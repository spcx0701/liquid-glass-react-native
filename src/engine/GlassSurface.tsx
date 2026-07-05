import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlass } from './GlassProvider'
import { borderColor, rimHighlight, surfaceShadow, type Depth, type GlassVariant } from './theme'
import { useLensFilter } from './filters'
import { supportsBackdrop } from './capabilities'
import { SDF_GLASS, resolveRecipe, type MaterialRole } from './recipes'

export interface GlassSurfaceProps {
  variant?: GlassVariant
  /** Which system material backs this surface (maps to a CoreMaterial recipe). */
  material?: MaterialRole
  radius?: number
  /** Optional tint overlay (e.g. accent-tinted glass); system glass has none. */
  tint?: string
  /** Rim displacement in px; 0 disables lensing. Default 2× SDF height (40). */
  refraction?: number
  /** Lens profile shape — CASDFGlassDisplacementEffect.curvature (system default 1). */
  curvature?: number
  /** Frost multiplier; clear glass halves effective frost (backdropScale 0.25→0.5). */
  blurScale?: number
  /** RGB dispersion fringe (CA `chromaticAberrationMap`). */
  chromatic?: boolean
  depth?: Depth
  style?: any
  pointerEvents?: any
  onLayout?: (e: any) => void
  children?: React.ReactNode
}

// The core material. Three layers, mirroring the layer tree of a live
// NSGlassEffectView (CABackdropLayer + glassBackground filter, CASDF shape,
// rim highlight, then content):
//  1. backdrop layer — lenses and frosts what's painted beneath through the
//     exact CoreMaterial recipe pipeline;
//  2. specular rim — CASDFGlassHighlightEffect (light from straight above);
//  3. the surface's own content.
export function GlassSurface({
  variant,
  material,
  radius = 16,
  tint,
  refraction,
  curvature,
  blurScale,
  chromatic = false,
  depth = 'raised',
  style,
  pointerEvents,
  onLayout,
  children,
}: GlassSurfaceProps) {
  const glass = useGlass()
  const activeVariant = variant ?? glass.defaultVariant
  const dark = glass.appearance === 'dark'
  const { recipe, name: recipeName } = resolveRecipe(material ?? 'glass', dark)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const handleLayout = useCallback(
    (e: any) => {
      const { width, height } = e.nativeEvent.layout
      // Quantize to a 2px grid so touch-driven size jitter doesn't churn filters.
      const w = Math.round(width / 2) * 2
      const h = Math.round(height / 2) * 2
      setSize(s => (s.w === w && s.h === h ? s : { w, h }))
      onLayout?.(e)
    },
    [onLayout],
  )

  // Clear glass captures its backdrop at 0.5 scale instead of 0.25 (observed
  // live on NSGlassEffectView style=1), i.e. half the effective frost.
  const effectiveBlurScale =
    blurScale ?? (activeVariant === 'clear' ? SDF_GLASS.backdrop.scaleRegular / SDF_GLASS.backdrop.scaleClear : 1)
  const refr = glass.reduceTransparency ? 0 : refraction ?? SDF_GLASS.displacement.height * 2

  const filterId = useLensFilter(
    size.w,
    size.h,
    radius,
    recipeName,
    refr,
    curvature ?? SDF_GLASS.displacement.curvature,
    effectiveBlurScale,
    chromatic,
  )

  let backdropFilter: string | undefined
  let background: string
  if (glass.reduceTransparency) {
    background = dark ? 'rgba(44,44,48,0.96)' : 'rgba(247,247,249,0.96)'
  } else if (filterId) {
    // Exact recipe pipeline runs inside the SVG filter; no tint needed —
    // the system material has no white overlay either.
    backdropFilter = `url(#${filterId})`
    background = tint ?? 'transparent'
  } else if (supportsBackdrop) {
    backdropFilter = recipe.cssApprox
    background = tint ?? 'transparent'
  } else {
    background = tint ?? (dark ? 'rgba(44,44,48,0.88)' : 'rgba(250,250,252,0.88)')
  }

  return (
    <View pointerEvents={pointerEvents} onLayout={handleLayout} style={[{ borderRadius: radius }, style]}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            backgroundColor: background,
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            boxShadow: surfaceShadow(depth, dark),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor: borderColor(dark),
            boxShadow: rimHighlight(dark, activeVariant),
          },
        ]}
      />
      {children}
    </View>
  )
}
