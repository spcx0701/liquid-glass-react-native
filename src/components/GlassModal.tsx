import React, { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, timing, useGlass } from '../engine'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function GlassModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean
  onClose: () => void
  title: string
  children?: React.ReactNode
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [mounted, setMounted] = useState(visible)
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setMounted(true)
      spring(anim, 1, Motion.morph).start()
    } else {
      timing(anim, 0, 160).start(({ finished }: any) => finished && setMounted(false))
    }
  }, [visible, anim])

  if (!mounted) return null

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 1000, alignItems: 'center', justifyContent: 'center' }]}>
      <AnimatedPressable
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', opacity: anim, cursor: 'default' }]}
      />
      <Animated.View
        style={{
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
        }}
      >
        <GlassSurface material="platters" radius={26} depth="floating" chromatic style={{ width: 420, padding: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Pressable
              onPress={onClose}
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: '#ff5f57',
                boxShadow: 'inset 0 0 1px rgba(0,0,0,0.3)',
              }}
            />
            <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: '#febc2e' }} />
            <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: '#28c840' }} />
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 14.5, fontWeight: '700', color: labelColor(dark), marginRight: 59 }}>
              {title}
            </Text>
          </View>
          {children}
        </GlassSurface>
      </Animated.View>
    </View>
  )
}
