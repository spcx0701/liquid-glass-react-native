import React from 'react'
import { StyleSheet, View } from 'react-native'
import { wallpaperCSS, type WallpaperSpec } from '../engine'

// Desktop wallpaper: the color field the glass refracts, plus a dot grid and
// hairline grid whose high-frequency detail makes the edge lensing clearly
// visible (smooth gradients alone hide displacement).
export function Wallpaper({ spec }: { spec: WallpaperSpec }) {
  const dot = spec.dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'
  const line = spec.dark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.2)'
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundImage: wallpaperCSS(spec) }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${dot} 1.5px, transparent 2.6px)`,
            backgroundSize: '26px 26px',
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: '104px 104px',
          },
        ]}
      />
    </View>
  )
}
