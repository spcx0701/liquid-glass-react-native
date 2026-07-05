import React, { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, useGlass } from '../engine'

const PAD = 4

// Selection is a glass pill that morphs (slides with spring physics) between
// segments rather than jumping — Liquid Glass controls move like droplets.
export function GlassSegmented({
  options,
  value,
  onChange,
  style,
}: {
  options: string[]
  value: number
  onChange: (i: number) => void
  style?: any
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [w, setW] = useState(0)
  const x = useRef(new Animated.Value(PAD)).current
  const segW = w > 0 ? (w - PAD * 2) / options.length : 0

  useEffect(() => {
    if (segW > 0) spring(x, PAD + value * segW, Motion.morph).start()
  }, [value, segW, x])

  return (
    <GlassSurface
      radius={18}
      refraction={0}
      onLayout={(e: any) => setW(e.nativeEvent.layout.width)}
      style={[{ height: 36, flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD }, style]}
    >
      {segW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: PAD,
            bottom: PAD,
            width: segW,
            borderRadius: 14,
            backgroundColor: dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14), inset 0 1px 1px rgba(255,255,255,0.6)',
            transform: [{ translateX: x }],
          }}
        />
      )}
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => onChange(i)}
          style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: i === value ? labelColor(dark) : labelColor(dark, 'secondary'),
            }}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </GlassSurface>
  )
}
