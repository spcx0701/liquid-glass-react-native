// SVG filter management for the web adapter.
//
// Each distinct surface geometry (size × radius × bezel × strength) gets one
// <filter> holding its lens map, appended to a hidden shared <svg> and cached
// forever — buttons and cards of equal size share a filter. The optional
// chromatic path displaces R/G/B with slightly different strengths, the
// dispersion fringe visible on real Tahoe glass edges.

import { useMemo } from 'react'
import { generateLensMap } from './displacement'
import { supportsLensing } from './capabilities'

export interface LensSpec {
  width: number
  height: number
  radius: number
  bezel: number
  refraction: number
  blur: number
  chromatic?: boolean
}

let host: SVGSVGElement | null = null
const cache = new Map<string, string>()
let seq = 0

function ensureHost(): SVGSVGElement {
  if (host && document.body.contains(host)) return host
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'fixed'
  svg.style.left = '-9999px'
  svg.style.top = '0'
  document.body.appendChild(svg)
  host = svg
  return svg
}

function channelMatrix(channel: 0 | 1 | 2): string {
  const rows = ['0 0 0 0 0', '0 0 0 0 0', '0 0 0 0 0', '0 0 0 1 0']
  rows[channel] = ['1 0 0 0 0', '0 1 0 0 0', '0 0 1 0 0'][channel]
  return rows.join(' ')
}

function plainChain(s: LensSpec): string {
  return (
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s.refraction}" xChannelSelector="R" yChannelSelector="G" result="disp"/>` +
    `<feGaussianBlur in="disp" stdDeviation="${s.blur}"/>`
  )
}

function chromaticChain(s: LensSpec): string {
  const disp = (mult: number, out: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(s.refraction * mult).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d${out}"/>` +
    `<feColorMatrix in="d${out}" type="matrix" values="${channelMatrix(out === 'r' ? 0 : out === 'g' ? 1 : 2)}" result="${out}"/>`
  return (
    disp(1.16, 'r') +
    disp(1, 'g') +
    disp(0.84, 'b') +
    `<feBlend in="r" in2="g" mode="screen" result="rg"/>` +
    `<feBlend in="rg" in2="b" mode="screen" result="rgb"/>` +
    `<feGaussianBlur in="rgb" stdDeviation="${s.blur}"/>`
  )
}

export function ensureLensFilter(s: LensSpec): string {
  const key = `${s.width}x${s.height}r${s.radius}b${s.bezel}s${s.refraction}f${s.blur}c${s.chromatic ? 1 : 0}`
  const hit = cache.get(key)
  if (hit) return hit

  const id = `lg-lens-${(seq++).toString(36)}`
  const map = generateLensMap(s.width, s.height, s.radius, s.bezel)
  const markup =
    `<filter id="${id}" x="0" y="0" width="${s.width}" height="${s.height}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
    `<feImage href="${map}" x="0" y="0" width="${s.width}" height="${s.height}" preserveAspectRatio="none" result="map"/>` +
    (s.chromatic ? chromaticChain(s) : plainChain(s)) +
    `</filter>`

  const tmp = document.createElement('div')
  tmp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`
  ensureHost().appendChild(tmp.firstElementChild!.firstElementChild!)
  cache.set(key, id)
  return id
}

export function useLensFilter(
  w: number,
  h: number,
  radius: number,
  bezel: number,
  refraction: number,
  blur: number,
  chromatic = false,
): string | null {
  return useMemo(() => {
    if (!supportsLensing || w < 8 || h < 8 || refraction <= 0) return null
    return ensureLensFilter({
      width: Math.round(w),
      height: Math.round(h),
      radius: Math.round(Math.min(radius, w / 2, h / 2)),
      bezel: Math.round(bezel),
      refraction: Math.round(refraction),
      blur,
      chromatic,
    })
  }, [w, h, radius, bezel, refraction, blur, chromatic])
}
