import React from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native'
import { GlassSurface, labelColor, useGlass, useGlassPress, withAlpha, type GlassVariant } from '../engine'

const SIZES = {
  sm: { h: 30, px: 14, font: 13 },
  md: { h: 38, px: 18, font: 14.5 },
  lg: { h: 48, px: 24, font: 16 },
} as const

export interface GlassButtonProps {
  title: string
  icon?: string
  size?: keyof typeof SIZES
  /** Accent-tinted glass (macOS "prominent" style). */
  tinted?: boolean
  variant?: GlassVariant
  onPress?: () => void
  style?: any
}

export function GlassButton({ title, icon, size = 'md', tinted = false, variant, onPress, style }: GlassButtonProps) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const p = useGlassPress(0.95)
  const s = SIZES[size]
  const tint = tinted ? withAlpha(glass.accent, dark ? 0.55 : 0.75) : undefined
  const color = tinted ? '#fff' : labelColor(dark)

  return (
    <Pressable
      onPress={onPress}
      onPressIn={p.onPressIn}
      onPressOut={p.onPressOut}
      onHoverIn={p.onHoverIn}
      onHoverOut={p.onHoverOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: p.scale }] }}>
        <GlassSurface
          variant={variant}
          radius={s.h / 2}
          tint={tint}
          refraction={26}
          bezel={9}
          style={{
            height: s.h,
            paddingHorizontal: s.px,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {icon ? <Text style={{ fontSize: s.font + 1, color }}>{icon}</Text> : null}
          <Text style={{ fontSize: s.font, fontWeight: '600', color }}>{title}</Text>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: s.h / 2,
                backgroundColor: '#fff',
                opacity: Animated.add(
                  p.gleam.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
                  p.hover.interpolate({ inputRange: [0, 1], outputRange: [0, 0.09] }),
                ),
              },
            ]}
          />
        </GlassSurface>
      </Animated.View>
    </Pressable>
  )
}
