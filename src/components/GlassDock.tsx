import React, { useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { GlassSurface, Motion, spring, useGlassPress } from '../engine'

const SIZE = 52
const GAP = 10
const PAD = 10

export interface DockApp {
  icon: string
  name: string
  colors: [string, string]
}

// The dock is a floating clear-leaning glass shelf. Icons magnify under the
// cursor with a Gaussian falloff (each neighbor scales by its distance to
// the pointer) and spring back when the pointer leaves — the classic macOS
// dock behavior, driven directly through Animated values (no re-render per
// mouse move).
export function GlassDock({ apps, onLaunch }: { apps: DockApp[]; onLaunch?: (app: DockApp) => void }) {
  const scales = useRef(apps.map(() => new Animated.Value(1))).current
  const rowRef = useRef<any>(null)

  const onMove = (e: any) => {
    const rect = rowRef.current?.getBoundingClientRect?.()
    if (!rect) return
    const mx = (e.nativeEvent.pageX ?? e.nativeEvent.clientX ?? 0) - rect.left
    apps.forEach((_, i) => {
      const cx = i * (SIZE + GAP) + SIZE / 2
      const d = mx - cx
      scales[i].setValue(1 + 0.55 * Math.exp(-(d * d) / (2 * 70 * 70)))
    })
  }

  const onLeave = () => scales.forEach(s => spring(s, 1, Motion.release).start())

  return (
    <GlassSurface
      material="dock"
      radius={26}
      depth="floating"
      style={{ flexDirection: 'row', alignItems: 'flex-end', padding: PAD }}
    >
      <View
        ref={rowRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ flexDirection: 'row', gap: GAP, alignItems: 'flex-end' }}
      >
        {apps.map((app, i) => (
          <DockIcon key={app.name} app={app} magnify={scales[i]} onLaunch={onLaunch} />
        ))}
      </View>
    </GlassSurface>
  )
}

function DockIcon({
  app,
  magnify,
  onLaunch,
}: {
  app: DockApp
  magnify: any
  onLaunch?: (app: DockApp) => void
}) {
  const p = useGlassPress(0.9)
  return (
    <Pressable onPress={() => onLaunch?.(app)} onPressIn={p.onPressIn} onPressOut={p.onPressOut}>
      <Animated.View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(160deg, ${app.colors[0]}, ${app.colors[1]})`,
          boxShadow: '0 6px 14px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.5)',
          transformOrigin: '50% 100%',
          transform: [{ scale: Animated.multiply(magnify, p.scale) }],
        }}
      >
        <Text style={{ fontSize: 27 }}>{app.icon}</Text>
      </Animated.View>
    </Pressable>
  )
}
