import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { GlassSurface, labelColor, useGlass, withAlpha } from '../engine'

export function GlassToolbar({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <GlassSurface
      radius={22}
      refraction={30}
      style={[
        { height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 2 },
        style,
      ]}
    >
      {children}
    </GlassSurface>
  )
}

export function ToolbarButton({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: string
  label?: string
  active?: boolean
  onPress?: () => void
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [hover, setHover] = useState(false)
  const bg = active
    ? withAlpha(glass.accent, 0.28)
    : hover
      ? dark
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.55)'
      : 'transparent'
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        height: 32,
        minWidth: 32,
        paddingHorizontal: label ? 10 : 0,
        borderRadius: 10,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 15, color: labelColor(dark) }}>{icon}</Text>
      {label ? <Text style={{ fontSize: 13, fontWeight: '600', color: labelColor(dark) }}>{label}</Text> : null}
    </Pressable>
  )
}

export function ToolbarDivider() {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  return (
    <View
      style={{
        width: 1,
        height: 18,
        marginHorizontal: 4,
        backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
      }}
    />
  )
}
