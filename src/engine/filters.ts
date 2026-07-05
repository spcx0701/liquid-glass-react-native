// SVG filter construction — a 1:1 mapping of the CoreMaterial/CASDF pipeline
// observed on macOS 26.4.1 onto SVG filter primitives:
//
//   CASDFGlassDisplacementEffect → feDisplacementMap driven by an SDF lens map
//   chromaticAberrationMap       → per-channel displacement + screen recombine
//   gaussianBlur                 → feGaussianBlur (radius → stdDeviation)
//   colorSaturate                → feColorMatrix type="saturate"
//                                  (SVG uses the same Rec.709 luma weights that
//                                  Apple's decomposed matrices contain)
//   colorBrightness (additive)   → feComponentTransfer linear intercept
//   luminanceCurveMap            → feComponentTransfer 4-point table, blended
//                                  by luminanceAmount (deviation: applied
//                                  per-channel, Apple applies it to luma)
//   colorMatrix                  → feColorMatrix type="matrix" (same 4×5 layout)
//   blurAtEnd                    → blur moved after the color pipeline
//
// Each distinct (recipe × geometry × lens params) gets one cached <filter> in
// a shared hidden <svg>.

import { useMemo } from 'react'
import { generateLensMap } from './displacement'
import { supportsLensing } from './capabilities'
import { RECIPES, type RecipeName } from './recipes'

export interface LensSpec {
  width: number
  height: number
  radius: number
  recipeName: RecipeName
  /** Rim displacement in px; 0 = frost/color pipeline only. */
  refraction: number
  /** CASDFGlassDisplacementEffect.curvature — lens profile shape. */
  curvature: number
  /** Effective frost multiplier (clear glass captures backdrop at 2× resolution). */
  blurScale: number
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

function displacementChain(s: LensSpec): { markup: string; out: string } {
  if (s.refraction <= 0) return { markup: '', out: 'SourceGraphic' }
  const map = generateLensMap(s.width, s.height, s.radius, s.curvature)
  const feImage = `<feImage href="${map}" x="0" y="0" width="${s.width}" height="${s.height}" preserveAspectRatio="none" result="map"/>`
  if (!s.chromatic) {
    return {
      markup:
        feImage +
        `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s.refraction}" xChannelSelector="R" yChannelSelector="G" result="lensed"/>`,
      out: 'lensed',
    }
  }
  const disp = (mult: number, out: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(s.refraction * mult).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d${out}"/>` +
    `<feColorMatrix in="d${out}" type="matrix" values="${channelMatrix(out === 'r' ? 0 : out === 'g' ? 1 : 2)}" result="${out}"/>`
  return {
    markup:
      feImage +
      disp(1.16, 'r') +
      disp(1, 'g') +
      disp(0.84, 'b') +
      `<feBlend in="r" in2="g" mode="screen" result="rg"/>` +
      `<feBlend in="rg" in2="b" mode="screen" result="lensed"/>`,
    out: 'lensed',
  }
}

function frostChain(name: RecipeName, blurScale: number, input: string): string {
  const r = RECIPES[name]
  let cur = input
  let n = 0
  const parts: string[] = []
  const step = (open: string, close = '/>') => {
    const res = `f${n++}`
    parts.push(`${open} in="${cur}" result="${res}"${close}`)
    cur = res
  }
  const transfer = (funcs: string) => {
    const res = `f${n++}`
    parts.push(`<feComponentTransfer in="${cur}" result="${res}">${funcs}</feComponentTransfer>`)
    cur = res
  }
  const blurStdDev = r.blurRadius ? (r.blurRadius * blurScale).toFixed(1) : null

  if (blurStdDev && !r.blurAtEnd) step(`<feGaussianBlur stdDeviation="${blurStdDev}"`)
  if (r.saturation != null) step(`<feColorMatrix type="saturate" values="${r.saturation}"`)
  if (r.brightness) {
    const f = (c: string) => `<feFunc${c} type="linear" slope="1" intercept="${r.brightness}"/>`
    transfer(f('R') + f('G') + f('B'))
  }
  if (r.luminanceValues) {
    const a = r.luminanceAmount ?? 1
    const identity = [0, 1 / 3, 2 / 3, 1]
    const table = r.luminanceValues.map((v, i) => (identity[i] * (1 - a) + v * a).toFixed(4)).join(' ')
    const f = (c: string) => `<feFunc${c} type="table" tableValues="${table}"/>`
    transfer(f('R') + f('G') + f('B'))
  }
  if (blurStdDev && r.blurAtEnd) step(`<feGaussianBlur stdDeviation="${blurStdDev}"`)
  if (r.colorMatrix) step(`<feColorMatrix type="matrix" values="${r.colorMatrix.join(' ')}"`)
  return parts.join('')
}

export function ensureLensFilter(s: LensSpec): string {
  const key = `${s.recipeName}|${s.width}x${s.height}|r${s.radius}|d${s.refraction}|c${s.curvature}|b${s.blurScale}|${s.chromatic ? 1 : 0}`
  const hit = cache.get(key)
  if (hit) return hit

  const id = `lg-${(seq++).toString(36)}`
  const lens = displacementChain(s)
  const markup =
    `<filter id="${id}" x="0" y="0" width="${s.width}" height="${s.height}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
    lens.markup +
    frostChain(s.recipeName, s.blurScale, lens.out) +
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
  recipeName: RecipeName,
  refraction: number,
  curvature: number,
  blurScale: number,
  chromatic = false,
): string | null {
  return useMemo(() => {
    if (!supportsLensing || w < 8 || h < 8) return null
    return ensureLensFilter({
      width: Math.round(w),
      height: Math.round(h),
      radius: Math.round(Math.min(radius, w / 2, h / 2)),
      recipeName,
      refraction: Math.round(Math.max(refraction, 0)),
      curvature: Math.round(curvature * 100) / 100,
      blurScale: Math.round(blurScale * 100) / 100,
      chromatic,
    })
  }, [w, h, radius, recipeName, refraction, curvature, blurScale, chromatic])
}
