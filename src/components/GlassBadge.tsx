import React from 'react'
import { Text } from 'react-native'
import { GlassSurface, labelColor, useGlass, withAlpha } from '../engine'

export function GlassBadge({ label, tint }: { label: string; tint?: string }) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  return (
    <GlassSurface
      radius={12}
      refraction={0}
      depth="flat"
      tint={tint ? withAlpha(tint, dark ? 0.55 : 0.72) : undefined}
      style={{ height: 24, paddingHorizontal: 10, justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: tint ? '#fff' : labelColor(dark) }}>{label}</Text>
    </GlassSurface>
  )
}
