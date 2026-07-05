import React, { useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { GlassSurface, Motion, labelColor, spring, timing, useGlass } from '../engine'
import { GlassButton } from './GlassButton'

export interface GlassMenuItem {
  label: string
  icon?: string
  danger?: boolean
  onSelect?: () => void
}

// The menu morphs out of its anchor — scaling from the top-left corner with
// a spring rather than fading in place, the way Tahoe menus emerge from
// their buttons.
export function GlassMenu({ label, icon, items }: { label: string; icon?: string; items: GlassMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const anim = useRef(new Animated.Value(0)).current

  const openMenu = () => {
    setOpen(true)
    anim.setValue(0)
    spring(anim, 1, Motion.morph).start()
  }
  const close = () => {
    timing(anim, 0, 140).start(({ finished }: any) => finished && setOpen(false))
  }

  return (
    <View style={{ zIndex: open ? 100 : 0 }}>
      <GlassButton title={label} icon={icon ?? '▾'} onPress={() => (open ? close() : openMenu())} />
      {open && (
        <>
          <Pressable
            onPress={close}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, cursor: 'default' } as any}
          />
          <Animated.View
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              zIndex: 10,
              opacity: anim,
              transformOrigin: 'top left',
              transform: [
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) },
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
              ],
            }}
          >
            <GlassSurface radius={16} refraction={30} depth="floating" style={{ minWidth: 210, padding: 5 }}>
              {items.map(item => (
                <MenuRow key={item.label} item={item} close={close} />
              ))}
            </GlassSurface>
          </Animated.View>
        </>
      )}
    </View>
  )
}

function MenuRow({ item, close }: { item: GlassMenuItem; close: () => void }) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const [hover, setHover] = useState(false)
  const color = hover ? '#fff' : item.danger ? '#ff453a' : labelColor(dark)
  return (
    <Pressable
      onPress={() => {
        item.onSelect?.()
        close()
      }}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        height: 32,
        borderRadius: 11,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: hover ? glass.accent : 'transparent',
      }}
    >
      {item.icon ? <Text style={{ fontSize: 14, color }}>{item.icon}</Text> : null}
      <Text style={{ fontSize: 13.5, fontWeight: '500', color }}>{item.label}</Text>
    </Pressable>
  )
}
