import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, timing, useGlass } from '../engine'

export interface Notice {
  id: number
  icon: string
  title: string
  body: string
}

export function GlassNotificationStack({
  notices,
  onDismiss,
}: {
  notices: Notice[]
  onDismiss: (id: number) => void
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 16, right: 16, gap: 10, zIndex: 500, alignItems: 'flex-end' }}
    >
      {notices.map(n => (
        <NotificationCard key={n.id} notice={n} onDismiss={onDismiss} />
      ))}
    </View>
  )
}

function NotificationCard({ notice, onDismiss }: { notice: Notice; onDismiss: (id: number) => void }) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const x = useRef(new Animated.Value(420)).current

  const dismiss = () => {
    timing(x, 440, 200).start(({ finished }: any) => finished && onDismiss(notice.id))
  }

  useEffect(() => {
    spring(x, 0, Motion.morph).start()
    const t = setTimeout(dismiss, 4200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Animated.View style={{ transform: [{ translateX: x }] }}>
      <Pressable onPress={dismiss}>
        <GlassSurface
          material="platters"
          radius={18}
          depth="floating"
          style={{ width: 340, padding: 13, flexDirection: 'row', gap: 12, alignItems: 'center' }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(160deg, #6ec1ff, #0a84ff)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
            }}
          >
            <Text style={{ fontSize: 20 }}>{notice.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '700', color: labelColor(dark) }}>{notice.title}</Text>
            <Text style={{ fontSize: 12.5, color: labelColor(dark, 'secondary'), marginTop: 1 }}>{notice.body}</Text>
          </View>
        </GlassSurface>
      </Pressable>
    </Animated.View>
  )
}
