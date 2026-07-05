import React, { useEffect, useRef, useState } from 'react'
import { Animated, PanResponder, Text, View } from 'react-native'
import { GlassProvider, GlassSurface, labelColor, useGlass, type Appearance, LuminanceSampler } from '../engine'

// A draggable glass window demonstrating the material's adaptivity: while
// dragged, it samples the wallpaper luminance beneath itself (through the
// engine's LuminanceSampler) and flips its entire content tree between light
// and dark by re-providing the glass context — the same behind-content
// sampling macOS uses to keep glass legible anywhere on screen.
export function GlassWindow({
  title,
  children,
  initialX = 40,
  initialY = 40,
  sampler,
}: {
  title: string
  children?: React.ReactNode
  initialX?: number
  initialY?: number
  sampler?: LuminanceSampler
}) {
  const glass = useGlass()
  const [auto, setAuto] = useState<Appearance>(glass.appearance)
  const pos = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current
  const offset = useRef({ x: initialX, y: initialY })
  const boxRef = useRef<any>(null)
  const lastSample = useRef(0)

  const sample = (force = false) => {
    if (!sampler) return
    const now = Date.now()
    // CABackdropLayer.lumaUpdateRate = 0.25 → the system re-samples luma at 4 Hz.
    if (!force && now - lastSample.current < 250) return
    lastSample.current = now
    const rect = boxRef.current?.getBoundingClientRect?.()
    if (!rect || typeof window === 'undefined') return
    const lum = sampler.luminanceAt(
      rect.left / window.innerWidth,
      rect.top / window.innerHeight,
      rect.width / window.innerWidth,
      rect.height / window.innerHeight,
    )
    setAuto(lum < 0.46 ? 'dark' : 'light')
  }

  useEffect(() => {
    sample(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampler, glass.appearance])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pos.setOffset(offset.current)
        pos.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: (_e: any, g: any) => {
        pos.setValue({ x: g.dx, y: g.dy })
        sample()
      },
      onPanResponderRelease: (_e: any, g: any) => {
        offset.current = { x: offset.current.x + g.dx, y: offset.current.y + g.dy }
        pos.flattenOffset()
        sample(true)
      },
    }),
  ).current

  const dark = auto === 'dark'

  return (
    <Animated.View
      ref={boxRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 340,
        transform: [{ translateX: pos.x }, { translateY: pos.y }],
      }}
    >
      <GlassProvider appearance={auto}>
        <GlassSurface material="chrome" radius={20} depth="floating" chromatic>
          <View
            {...pan.panHandlers}
            style={{
              height: 40,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              gap: 8,
              cursor: 'grab',
            }}
          >
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff5f57' }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#febc2e' }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#28c840' }} />
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 13.5,
                fontWeight: '700',
                color: labelColor(dark),
                marginRight: 52,
              }}
            >
              {title}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{children}</View>
        </GlassSurface>
      </GlassProvider>
    </Animated.View>
  )
}
