import React, { createContext, useContext, useMemo } from 'react'
import { ACCENT, type Appearance, type GlassVariant } from './theme'

export interface GlassContextValue {
  appearance: Appearance
  reduceTransparency: boolean
  accent: string
  defaultVariant: GlassVariant
}

const GlassContext = createContext<GlassContextValue>({
  appearance: 'light',
  reduceTransparency: false,
  accent: ACCENT,
  defaultVariant: 'regular',
})

export function useGlass(): GlassContextValue {
  return useContext(GlassContext)
}

// Providers nest: a GlassWindow that samples a dark patch of wallpaper wraps
// its content in <GlassProvider appearance="dark"> and every control inside
// adapts — the same cascade the macOS material system applies.
export function GlassProvider({
  children,
  ...overrides
}: Partial<GlassContextValue> & { children: React.ReactNode }) {
  const parent = useGlass()
  const value = useMemo(
    () => ({ ...parent, ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== undefined)) }),
    [parent, overrides.appearance, overrides.reduceTransparency, overrides.accent, overrides.defaultVariant],
  ) as GlassContextValue
  return <GlassContext.Provider value={value}>{children}</GlassContext.Provider>
}
