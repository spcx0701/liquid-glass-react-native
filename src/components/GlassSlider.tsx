import React, { useRef, useState } from 'react'
import { Animated, PanResponder, View } from 'react-native'
import { GlassSurface, Motion, spring, useGlass } from '../engine'

const KNOB = 24

// The knob is clear glass with strong refraction — drag it and it lenses the
// accent track underneath, exactly like the macOS 26 slider thumb.
export function GlassSlider({
  value,
  onChange,
  style,
}: {
  value: number
  onChange: (v: number) => void
  style?: any
}) {
  const glass = useGlass()
  const [w, setW] = useState(0)
  const trackRef = useRef<any>(null)
  const knobScale = useRef(new Animated.Value(1)).current
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const update = (pageX: number) => {
    const rect = trackRef.current?.getBoundingClientRect?.()
    if (!rect || rect.width === 0) return
    onChangeRef.current(Math.min(1, Math.max(0, (pageX - rect.left) / rect.width)))
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: any, g: any) => {
        spring(knobScale, 1.3, Motion.press).start()
        update(g.x0 ?? e.nativeEvent.pageX)
      },
      onPanResponderMove: (_e: any, g: any) => update(g.moveX),
      onPanResponderRelease: () => spring(knobScale, 1, Motion.release).start(),
      onPanResponderTerminate: () => spring(knobScale, 1, Motion.release).start(),
    }),
  ).current

  const knobX = value * Math.max(w - KNOB, 0)

  return (
    <View
      ref={trackRef}
      {...pan.panHandlers}
      onLayout={(e: any) => setW(e.nativeEvent.layout.width)}
      style={[{ height: 30, justifyContent: 'center', cursor: 'pointer' }, style]}
    >
      <GlassSurface radius={5} refraction={0} depth="flat" style={{ height: 8 }}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${(value * 100).toFixed(1)}%`,
            borderRadius: 5,
            backgroundColor: glass.accent,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35)',
          }}
        />
      </GlassSurface>
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: knobX, top: 3, transform: [{ scale: knobScale }] }}
      >
        <GlassSurface variant="clear" radius={KNOB / 2} refraction={44} bezel={9} style={{ width: KNOB, height: KNOB }} />
      </Animated.View>
    </View>
  )
}
