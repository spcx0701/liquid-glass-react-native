import React, { useRef, useState } from 'react'
import { Animated, Pressable, Text } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, timing, useGlass } from '../engine'

export function GlassTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [show, setShow] = useState(false)
  const anim = useRef(new Animated.Value(0)).current
  const timer = useRef<any>(null)

  const enter = () => {
    timer.current = setTimeout(() => {
      setShow(true)
      spring(anim, 1, Motion.morph).start()
    }, 320)
  }
  const leave = () => {
    clearTimeout(timer.current)
    timing(anim, 0, 130).start(({ finished }: any) => finished && setShow(false))
  }

  return (
    <Pressable onHoverIn={enter} onHoverOut={leave} style={{ alignItems: 'center' }}>
      {children}
      {show && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: 8,
            zIndex: 50,
            opacity: anim,
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [5, 0] }) },
            ],
          }}
        >
          <GlassSurface material="platters" radius={10} refraction={0} depth="floating" style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '500', color: labelColor(dark), whiteSpace: 'nowrap' }}>
              {label}
            </Text>
          </GlassSurface>
        </Animated.View>
      )}
    </Pressable>
  )
}
