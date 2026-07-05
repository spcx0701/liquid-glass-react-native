import React from 'react'
import { Text } from 'react-native'
import { GlassSurface, labelColor, useGlass, type GlassVariant } from '../engine'

export function GlassCard({
  title,
  subtitle,
  children,
  variant,
  chromatic = false,
  style,
}: {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  variant?: GlassVariant
  chromatic?: boolean
  style?: any
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  return (
    <GlassSurface material="content" variant={variant} chromatic={chromatic} radius={24} style={[{ padding: 20 }, style]}>
      {title ? (
        <Text style={{ fontSize: 16, fontWeight: '700', color: labelColor(dark), marginBottom: 4 }}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={{ fontSize: 13, color: labelColor(dark, 'secondary'), marginBottom: 14, lineHeight: 18 }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </GlassSurface>
  )
}
