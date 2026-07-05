// Motion physics. Liquid Glass never snaps — everything settles through a
// spring, and interactive glass responds to touch like gel: it recedes and
// brightens on press, then springs back with a fluid overshoot on release.

import { useRef } from 'react'
import { Animated } from 'react-native'

export const Motion = {
  press: { tension: 550, friction: 28 }, // fast follow, minimal wobble
  release: { tension: 320, friction: 13 }, // visible fluid overshoot
  morph: { tension: 280, friction: 24 }, // shape/position morphing
  smooth: { tension: 180, friction: 26 },
} as const

export function spring(value: any, toValue: number, preset: { tension: number; friction: number } = Motion.smooth) {
  return Animated.spring(value, { toValue, useNativeDriver: false, ...preset })
}

export function timing(value: any, toValue: number, duration = 180) {
  return Animated.timing(value, { toValue, duration, useNativeDriver: false })
}

export interface GlassPress {
  scale: any
  gleam: any
  hover: any
  onPressIn: () => void
  onPressOut: () => void
  onHoverIn: () => void
  onHoverOut: () => void
}

export function useGlassPress(pressScale = 0.955): GlassPress {
  const scale = useRef(new Animated.Value(1)).current
  const gleam = useRef(new Animated.Value(0)).current
  const hover = useRef(new Animated.Value(0)).current
  return {
    scale,
    gleam,
    hover,
    onPressIn: () => {
      spring(scale, pressScale, Motion.press).start()
      timing(gleam, 1, 90).start()
    },
    onPressOut: () => {
      spring(scale, 1, Motion.release).start()
      timing(gleam, 0, 420).start()
    },
    onHoverIn: () => timing(hover, 1, 140).start(),
    onHoverOut: () => timing(hover, 0, 220).start(),
  }
}
