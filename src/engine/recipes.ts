// VERBATIM system data — extracted from macOS 26.4.1 (25E253), not estimated.
//
// Sources:
//  · Material recipes: binary plists decoded with `plutil -p` from
//    /System/Library/PrivateFrameworks/CoreMaterial.framework/Versions/A/Resources/*.materialrecipe
//  · SDF glass parameters: Objective-C runtime introspection of QuartzCore's
//    CASDFGlassDisplacementEffect / CASDFGlassHighlightEffect /
//    CASDFKeyFillHighlightEffect default instances.
//  · Backdrop pipeline: live layer-tree dump of an NSGlassEffectView
//    (CABackdropLayer + `glassBackground` CAFilter + CASDFElementLayer).
//
// See docs/EXTRACTION.md for the full forensic log.

export interface SystemRecipe {
  /** File the values were decoded from (path on macOS). */
  source: string
  blurRadius?: number
  /** Backdrop is captured downsampled by this factor (perf; affects effective frost). */
  backdropScale?: number
  /** Blur is applied after the color pipeline instead of before. */
  blurAtEnd?: boolean
  /** Additive luminance bias. */
  brightness?: number
  saturation?: number
  /** 4-point tone curve applied to backdrop luminance, blended by luminanceAmount. */
  luminanceAmount?: number
  luminanceValues?: [number, number, number, number]
  /** Full 4x5 color matrix, row-major — identical layout to SVG feColorMatrix. */
  colorMatrix?: number[]
  /** CSS-only approximation for engines without SVG backdrop filters. */
  cssApprox: string
}

const CM = '/System/Library/PrivateFrameworks/CoreMaterial.framework/Versions/A/Resources'

export const RECIPES = {
  // The Liquid Glass content material. No light/dark split: the matrix
  // normalizes the backdrop into [0.235, 0.864] and everything else adapts
  // via luma tracking. Decomposes exactly to 0.629·saturate(1.589) + 0.235
  // with Rec.709 luma weights.
  platformContentGlass: {
    source: `${CM}/platformContentGlass.materialrecipe`,
    blurRadius: 45,
    colorMatrix: [
      0.921, -0.265, -0.027, 0, 0.235,
      -0.079, 0.735, -0.027, 0, 0.235,
      -0.079, -0.265, 0.973, 0, 0.235,
      0, 0, 0, 1, 0,
    ],
    cssApprox: 'blur(45px) saturate(1.59) contrast(0.63) brightness(1.26)',
  },
  dockLight: {
    source: `${CM}/dockLight.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: 0.08,
    saturation: 1.8,
    luminanceAmount: 0.5,
    luminanceValues: [0.3, 0.5, 1, 0.77],
    cssApprox: 'blur(30px) saturate(1.8) brightness(1.1)',
  },
  dockDark: {
    source: `${CM}/dockDark.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    saturation: 1.6,
    luminanceAmount: 0.5,
    luminanceValues: [0.29, -0.2, 0.375, 0.65],
    cssApprox: 'blur(30px) saturate(1.6) brightness(0.85)',
  },
  // Menus, popovers, floating shelves ("platters").
  platters: {
    source: `${CM}/platters.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    saturation: 2.4,
    luminanceAmount: 0.6,
    luminanceValues: [0.775, 0.85, 1.05, 0.94],
    cssApprox: 'blur(30px) saturate(2.4) brightness(1.35)',
  },
  plattersDark: {
    source: `${CM}/plattersDark.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: -0.03,
    saturation: 1.4,
    luminanceAmount: 0.4,
    luminanceValues: [0.41, -0.4, 0.3, 0],
    cssApprox: 'blur(30px) saturate(1.4) brightness(0.7)',
  },
  // Inset control backgrounds (toolbar buttons, fields, tracks).
  toolbarButtonBackground: {
    source: `${CM}/toolbarButtonBackground.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 15,
    saturation: 1.1,
    luminanceAmount: 0.5,
    luminanceValues: [0.24, 0.24, 0.3, 0.39],
    cssApprox: 'blur(15px) saturate(1.1) brightness(0.9)',
  },
  platformContentLight: {
    source: `${CM}/platformContentLight.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: 0.1,
    saturation: 1.5,
    luminanceAmount: 0.75,
    luminanceValues: [0.9, 0.83, 0.925, 0.815],
    cssApprox: 'blur(30px) saturate(1.5) brightness(1.35)',
  },
  platformContentDark: {
    source: `${CM}/platformContentDark.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: 0,
    saturation: 1.5,
    luminanceAmount: 0.75,
    luminanceValues: [0.16, 0.26, 0.1, 0.1],
    cssApprox: 'blur(30px) saturate(1.5) brightness(0.55)',
  },
  platformChromeLight: {
    source: `${CM}/platformChromeLight.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 22.5,
    brightness: 0.1,
    saturation: 1.1,
    luminanceAmount: 0.75,
    luminanceValues: [0.8, 0.9, 1.1, 0.825],
    cssApprox: 'blur(22.5px) saturate(1.1) brightness(1.3)',
  },
  platformChromeDark: {
    source: `${CM}/platformChromeDark.materialrecipe`,
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 22.5,
    brightness: -0.1,
    saturation: 2,
    luminanceAmount: 0.75,
    luminanceValues: [0.23, 0.52, 0.27, 0.255],
    cssApprox: 'blur(22.5px) saturate(2) brightness(0.6)',
  },
  // Control Center modules: color pipeline only (0.731·saturate(1.335) − 0.061);
  // the blur comes from the panel's backdrop configuration.
  modules: {
    source: `${CM}/modules.materialrecipe`,
    colorMatrix: [
      0.924, -0.175, -0.018, 0, -0.061,
      -0.052, 0.801, -0.018, 0, -0.061,
      -0.052, -0.175, 0.958, 0, -0.061,
      0, 0, 0, 1, 0,
    ],
    cssApprox: 'blur(30px) saturate(1.34) contrast(0.73)',
  },
} as const satisfies Record<string, SystemRecipe>

export type RecipeName = keyof typeof RECIPES

// Logical material roles → the system recipe used per appearance.
export type MaterialRole = 'glass' | 'platters' | 'dock' | 'chrome' | 'content' | 'control'

const ROLE_MAP: Record<MaterialRole, [RecipeName, RecipeName]> = {
  glass: ['platformContentGlass', 'platformContentGlass'],
  platters: ['platters', 'plattersDark'],
  dock: ['dockLight', 'dockDark'],
  chrome: ['platformChromeLight', 'platformChromeDark'],
  content: ['platformContentLight', 'platformContentDark'],
  control: ['toolbarButtonBackground', 'toolbarButtonBackground'],
}

export function resolveRecipe(role: MaterialRole, dark: boolean): { name: RecipeName; recipe: SystemRecipe } {
  const name = ROLE_MAP[role][dark ? 1 : 0]
  return { name, recipe: RECIPES[name] }
}

// QuartzCore CASDF* effect defaults, read from live instances. These are the
// actual parameters of Apple's SDF-driven lens and rim light.
export const SDF_GLASS = {
  /** CASDFGlassDisplacementEffect — the lens. */
  displacement: { height: 20, curvature: 1, angle: 0, maskOffset: 0 },
  /** CASDFGlassHighlightEffect — the specular rim. angle π/2 = light from straight above. */
  highlight: { height: 20, curvature: 1, angle: Math.PI / 2, spread: Math.PI, amount: 0.5 },
  /** CASDFKeyFillHighlightEffect — highlight applied to key fills/content. */
  keyFillHighlight: { curvature: 0.7 },
  /** CABackdropLayer configuration observed on a live NSGlassEffectView. */
  backdrop: { scaleRegular: 0.25, scaleClear: 0.5, lumaUpdateRate: 0.25 },
} as const
