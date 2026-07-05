// Shared appearance definitions. The frost/color pipeline itself lives in
// recipes.ts — verbatim CoreMaterial data extracted from the system — and is
// applied by GlassSurface/filters; nothing here invents material physics.

import { SDF_GLASS } from './recipes'

export type GlassVariant = 'regular' | 'clear'
export type Appearance = 'light' | 'dark'
export type Depth = 'flat' | 'raised' | 'floating'

export const ACCENT = '#0A84FF'

export function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

export function labelColor(dark: boolean, level: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  if (dark) {
    if (level === 'primary') return 'rgba(255,255,255,0.95)'
    if (level === 'secondary') return 'rgba(235,235,245,0.62)'
    return 'rgba(235,235,245,0.38)'
  }
  if (level === 'primary') return 'rgba(0,0,0,0.88)'
  if (level === 'secondary') return 'rgba(60,60,67,0.62)'
  return 'rgba(60,60,67,0.36)'
}

export function surfaceShadow(depth: Depth, dark: boolean): string {
  const k = dark ? 1.7 : 1
  if (depth === 'flat') return `0 1px 2px rgba(0,0,0,${(0.07 * k).toFixed(3)})`
  if (depth === 'raised')
    return `0 6px 18px rgba(0,0,0,${(0.13 * k).toFixed(3)}), 0 1px 3px rgba(0,0,0,${(0.08 * k).toFixed(3)})`
  return `0 24px 60px rgba(0,0,0,${(0.28 * k).toFixed(3)}), 0 6px 16px rgba(0,0,0,${(0.13 * k).toFixed(3)})`
}

// Specular rim — CASDFGlassHighlightEffect with its extracted defaults:
// angle π/2 (light from straight above), spread π (falls to zero at the
// horizontal), amount 0.5. The inset-shadow stack samples that cosine
// falloff at the top/side/bottom edges.
export function rimHighlight(dark: boolean, _variant: GlassVariant): string {
  const a = SDF_GLASS.highlight.amount // 0.5, extracted
  const k = dark ? 0.8 : 1
  const top = a * k // cos(0)
  const side = a * Math.cos(Math.PI / 2 - Math.PI / 8) * k // near the spread's edge
  const bottom = side * 0.5 // outside the spread; ambient only
  return [
    `inset 0 1.5px 1px -0.5px rgba(255,255,255,${top.toFixed(2)})`,
    `inset 1px 0 1px -0.5px rgba(255,255,255,${side.toFixed(2)})`,
    `inset -1px 0 1px -0.5px rgba(255,255,255,${side.toFixed(2)})`,
    `inset 0 -1.5px 1px -0.5px rgba(255,255,255,${bottom.toFixed(2)})`,
  ].join(', ')
}

export function borderColor(dark: boolean): string {
  return dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.35)'
}
