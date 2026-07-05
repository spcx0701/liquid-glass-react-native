export { GlassSurface, type GlassSurfaceProps } from './GlassSurface'
export { GlassProvider, useGlass, type GlassContextValue } from './GlassProvider'
export {
  VARIANTS,
  ACCENT,
  withAlpha,
  labelColor,
  surfaceShadow,
  rimHighlight,
  borderColor,
  type GlassVariant,
  type Appearance,
  type Depth,
} from './theme'
export { Motion, spring, timing, useGlassPress, type GlassPress } from './springs'
export { useLensFilter, ensureLensFilter, type LensSpec } from './filters'
export { generateLensMap } from './displacement'
export { supportsBackdrop, supportsLensing, isSafari, isFirefox } from './capabilities'
export { WALLPAPERS, wallpaperCSS, LuminanceSampler, type WallpaperSpec } from './wallpaper'
