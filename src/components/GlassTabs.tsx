import React, { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, useGlass, withAlpha } from '../engine'

const PAD = 5

export function GlassTabs({
  tabs,
  value,
  onChange,
  style,
}: {
  tabs: { icon: string; label: string }[]
  value: number
  onChange: (i: number) => void
  style?: any
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [w, setW] = useState(0)
  const x = useRef(new Animated.Value(PAD)).current
  const tabW = w > 0 ? (w - PAD * 2) / tabs.length : 0

  useEffect(() => {
    if (tabW > 0) spring(x, PAD + value * tabW, Motion.morph).start()
  }, [value, tabW, x])

  return (
    <GlassSurface
      radius={22}
      refraction={0}
      onLayout={(e: any) => setW(e.nativeEvent.layout.width)}
      style={[{ height: 46, flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD }, style]}
    >
      {tabW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: PAD,
            bottom: PAD,
            width: tabW,
            borderRadius: 18,
            backgroundColor: withAlpha(glass.accent, dark ? 0.4 : 0.25),
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.1)',
            transform: [{ translateX: x }],
          }}
        />
      )}
      {tabs.map((tab, i) => (
        <Pressable
          key={tab.label}
          onPress={() => onChange(i)}
          style={{
            flex: 1,
            height: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 15 }}>{tab.icon}</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: i === value ? labelColor(dark) : labelColor(dark, 'secondary'),
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </GlassSurface>
  )
}
