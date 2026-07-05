// Material definitions for the two Liquid Glass variants.
//
// "Regular" is the workhorse: heavier frost, adaptive tint, guaranteed
// legibility for content sitting on it. "Clear" is nearly transparent with
// stronger lensing, meant for surfaces over rich media where the backdrop
// should dominate. These numbers were tuned side-by-side against macOS 26.4
// controls (Control Center, menus, Dock) on the machine this was built on.

export type GlassVariant = 'regular' | 'clear'
export type Appearance = 'light' | 'dark'
export type Depth = 'flat' | 'raised' | 'floating'

export interface VariantSpec {
  blur: number
  saturate: number
  refraction: number
  bezel: number
  tintLight: string
  tintDark: string
}

export const VARIANTS: Record<GlassVariant, VariantSpec> = {
  regular: {
    blur: 9,
    saturate: 1.5,
    refraction: 44,
    bezel: 15,
    tintLight: 'rgba(255,255,255,0.34)',
    tintDark: 'rgba(40,40,46,0.42)',
  },
  clear: {
    blur: 2.5,
    saturate: 1.35,
    refraction: 72,
    bezel: 20,
    tintLight: 'rgba(255,255,255,0.08)',
    tintDark: 'rgba(18,18,22,0.14)',
  },
}

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

// Specular rim: a fixed virtual light source above the surface. The bright
// inner bevel on the top edge plus faint counter-light below is what reads
// as "glass" even before refraction kicks in.
export function rimHighlight(dark: boolean, variant: GlassVariant): string {
  const hi = variant === 'clear' ? (dark ? 0.38 : 0.6) : dark ? 0.26 : 0.7
  const lo = hi * 0.4
  return [
    `inset 0 1.5px 1px -0.5px rgba(255,255,255,${hi.toFixed(2)})`,
    `inset 1px 0 1px -0.5px rgba(255,255,255,${lo.toFixed(2)})`,
    `inset -1px 0 1px -0.5px rgba(255,255,255,${(lo * 0.8).toFixed(2)})`,
    `inset 0 -1.5px 1px -0.5px rgba(255,255,255,${(lo * 0.9).toFixed(2)})`,
  ].join(', ')
}

export function borderColor(dark: boolean): string {
  return dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.5)'
}
