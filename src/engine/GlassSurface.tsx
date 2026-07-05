import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlass } from './GlassProvider'
import { VARIANTS, borderColor, rimHighlight, surfaceShadow, type Depth, type GlassVariant } from './theme'
import { useLensFilter } from './filters'
import { supportsBackdrop } from './capabilities'

export interface GlassSurfaceProps {
  variant?: GlassVariant
  radius?: number
  /** Optional tint override (e.g. accent-tinted glass). */
  tint?: string
  /** Displacement strength in px; 0 disables lensing (frost only). */
  refraction?: number
  blur?: number
  bezel?: number
  /** RGB dispersion fringe on the lens rim. */
  chromatic?: boolean
  depth?: Depth
  style?: any
  pointerEvents?: any
  onLayout?: (e: any) => void
  children?: React.ReactNode
}

// The core material. Three layers:
//  1. backdrop layer — refracts (SVG displacement via backdrop-filter),
//     frosts (blur+saturate) and tints whatever is painted beneath;
//  2. specular rim — bevel highlights from a fixed overhead light source;
//  3. the surface's own content, drawn on top.
export function GlassSurface({
  variant,
  radius = 16,
  tint,
  refraction,
  blur,
  bezel,
  chromatic = false,
  depth = 'raised',
  style,
  pointerEvents,
  onLayout,
  children,
}: GlassSurfaceProps) {
  const glass = useGlass()
  const activeVariant = variant ?? glass.defaultVariant
  const v = VARIANTS[activeVariant]
  const dark = glass.appearance === 'dark'
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

  const filterId = useLensFilter(
    size.w,
    size.h,
    radius,
    bezel ?? v.bezel,
    glass.reduceTransparency ? 0 : refraction ?? v.refraction,
    blur ?? v.blur,
    chromatic,
  )

  let backdropFilter: string | undefined
  let background: string
  if (glass.reduceTransparency) {
    background = dark ? 'rgba(44,44,48,0.96)' : 'rgba(247,247,249,0.96)'
  } else {
    background = tint ?? (dark ? v.tintDark : v.tintLight)
    if (filterId) backdropFilter = `url(#${filterId}) saturate(${v.saturate})`
    else if (supportsBackdrop) backdropFilter = `blur(${blur ?? v.blur}px) saturate(${v.saturate})`
    else background = dark ? 'rgba(44,44,48,0.88)' : 'rgba(250,250,252,0.88)'
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
