import React, { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, useGlass } from '../engine'

const ITEM_H = 38
const GAP = 4
const PAD = 8

export function GlassSidebar({
  items,
  value,
  onChange,
  style,
}: {
  items: { icon: string; label: string }[]
  value: number
  onChange: (i: number) => void
  style?: any
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const y = useRef(new Animated.Value(PAD + value * (ITEM_H + GAP))).current

  useEffect(() => {
    spring(y, PAD + value * (ITEM_H + GAP), Motion.morph).start()
  }, [value, y])

  return (
    <GlassSurface material="content" radius={20} style={[{ width: 220, padding: PAD }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 0,
          height: ITEM_H,
          borderRadius: 11,
          backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.78)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.5)',
          transform: [{ translateY: y }],
        }}
      />
      {items.map((item, i) => (
        <SidebarRow key={item.label} item={item} active={i === value} onPress={() => onChange(i)} dark={dark} last={i === items.length - 1} />
      ))}
    </GlassSurface>
  )
}

function SidebarRow({
  item,
  active,
  onPress,
  dark,
  last,
}: {
  item: { icon: string; label: string }
  active: boolean
  onPress: () => void
  dark: boolean
  last: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        height: ITEM_H,
        marginBottom: last ? 0 : GAP,
        borderRadius: 11,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: hover && !active ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.35)') : 'transparent',
      }}
    >
      <Text style={{ fontSize: 16 }}>{item.icon}</Text>
      <Text style={{ fontSize: 13.5, fontWeight: active ? '700' : '500', color: labelColor(dark, active ? 'primary' : 'secondary') }}>
        {item.label}
      </Text>
    </Pressable>
  )
}
