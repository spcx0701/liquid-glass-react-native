import React, { useRef } from 'react'
import { Animated, TextInput, View } from 'react-native'
import { GlassSurface, labelColor, timing, useGlass, withAlpha } from '../engine'

export function GlassTextField({
  value,
  onChangeText,
  placeholder,
  secure = false,
  style,
}: {
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  secure?: boolean
  style?: any
}) {
  const glass = useGlass()
  const dark = glass.appearance === 'dark'
  const focus = useRef(new Animated.Value(0)).current

  return (
    <View style={style}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -3.5,
          left: -3.5,
          right: -3.5,
          bottom: -3.5,
          borderRadius: 15.5,
          borderWidth: 3.5,
          borderColor: withAlpha(glass.accent, 0.45),
          opacity: focus,
        }}
      />
      <GlassSurface material="control" radius={12} refraction={0} style={{ height: 40, justifyContent: 'center', paddingHorizontal: 14 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={labelColor(dark, 'tertiary')}
          secureTextEntry={secure}
          onFocus={() => timing(focus, 1, 160).start()}
          onBlur={() => timing(focus, 0, 220).start()}
          style={{
            fontSize: 14.5,
            color: labelColor(dark),
            outlineStyle: 'none',
            outlineWidth: 0,
            backgroundColor: 'transparent',
          }}
        />
      </GlassSurface>
    </View>
  )
}
