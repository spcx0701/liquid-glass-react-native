import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'
import { GlassSurface, Motion, spring, timing, useGlass } from '../engine'

// The knob stretches like a droplet while pressed and settles with an
// overshoot on release — the macOS 26 switch behavior.
export function GlassToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const glass = useGlass()
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current
  const press = useRef(new Animated.Value(0)).current

  useEffect(() => {
    spring(anim, value ? 1 : 0, Motion.release).start()
  }, [value, anim])

  return (
    <Pressable
      onPress={() => onChange(!value)}
      onPressIn={() => timing(press, 1, 110).start()}
      onPressOut={() => timing(press, 0, 260).start()}
    >
      <GlassSurface radius={16} refraction={16} bezel={8} style={{ width: 54, height: 32 }}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16,
              backgroundColor: glass.accent,
              opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 2,
            left: 0,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.28), inset 0 -1px 2px rgba(0,0,0,0.06)',
            transform: [
              { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [2, 24] }) },
              { scaleX: press.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
              { scaleY: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) },
            ],
          }}
        />
      </GlassSurface>
    </Pressable>
  )
}
