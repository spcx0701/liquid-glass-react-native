import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import { GlassSurface, useGlass } from '../engine'

export function GlassProgress({
  value = 0,
  indeterminate = false,
  style,
}: {
  value?: number
  indeterminate?: boolean
  style?: any
}) {
  const glass = useGlass()
  const [w, setW] = useState(0)
  const sweep = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: indeterminate ? 1200 : 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [indeterminate, sweep])

  const barW = indeterminate ? w * 0.3 : w * value

  return (
    <GlassSurface
      material="control"
      radius={5}
      refraction={0}
      depth="flat"
      onLayout={(e: any) => setW(e.nativeEvent.layout.width)}
      style={[{ height: 10, overflow: 'hidden' }, style]}
    >
      {w > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: Math.max(barW, 0),
            borderRadius: 5,
            backgroundColor: glass.accent,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
            transform: indeterminate
              ? [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-w * 0.3, w] }) }]
              : [],
          }}
        >
          {/* light sweep across the fill — glass catches a moving highlight */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 46,
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
              transform: [
                { translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-46, Math.max(barW, 0)] }) },
              ],
            }}
          />
        </Animated.View>
      )}
    </GlassSurface>
  )
}
