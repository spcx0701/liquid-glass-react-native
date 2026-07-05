import React, { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import {
  ACCENT,
  GlassProvider,
  GlassSurface,
  LuminanceSampler,
  WALLPAPERS,
  labelColor,
  supportsLensing,
  type Appearance,
  type GlassVariant,
} from './engine'
import {
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassDock,
  GlassMenu,
  GlassModal,
  GlassNotificationStack,
  GlassProgress,
  GlassSegmented,
  GlassSidebar,
  GlassSlider,
  GlassTabs,
  GlassTextField,
  GlassToggle,
  GlassToolbar,
  GlassTooltip,
  GlassWindow,
  ToolbarButton,
  ToolbarDivider,
  type DockApp,
  type Notice,
} from './components'
import { Wallpaper } from './demo/Wallpaper'

const DOCK_APPS: DockApp[] = [
  { icon: '🧭', name: 'Safari', colors: ['#7cc7ff', '#1670d8'] },
  { icon: '✉️', name: 'Mail', colors: ['#8fd0ff', '#2a7de1'] },
  { icon: '🎵', name: 'Music', colors: ['#ff8ab5', '#e0286e'] },
  { icon: '🗺️', name: 'Maps', colors: ['#9be48f', '#2f9e44'] },
  { icon: '📷', name: 'Photos', colors: ['#ffd08a', '#f08c00'] },
  { icon: '💬', name: 'Messages', colors: ['#8affa1', '#12b886'] },
  { icon: '⚙️', name: 'Settings', colors: ['#d0d4da', '#6c7480'] },
]

const CARD = { flexGrow: 1, flexBasis: 350 }

export default function App() {
  const [appearance, setAppearance] = useState<Appearance>('light')
  const [variant, setVariant] = useState<GlassVariant>('regular')
  const [reduceTransparency, setReduceTransparency] = useState(false)
  const [wallpaperId, setWallpaperId] = useState('tahoe-day')
  const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId) ?? WALLPAPERS[0]
  const sampler = useMemo(() => new LuminanceSampler(wallpaper), [wallpaper])

  const [notices, setNotices] = useState<Notice[]>([])
  const [modal, setModal] = useState(false)

  const [toggleA, setToggleA] = useState(true)
  const [toggleB, setToggleB] = useState(false)
  const [slider, setSlider] = useState(0.62)
  const [seg, setSeg] = useState(0)
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')
  const [side, setSide] = useState(1)
  const [winSlider, setWinSlider] = useState(0.4)
  const [winToggle, setWinToggle] = useState(true)

  const [refr, setRefr] = useState(0.5)
  const [frost, setFrost] = useState(0.4)
  const [bez, setBez] = useState(0.35)
  const [chroma, setChroma] = useState(true)

  const push = (icon: string, title: string, body: string) =>
    setNotices(n => [...n, { id: Date.now() + Math.random(), icon, title, body }])

  const pickWallpaper = (id: string) => {
    setWallpaperId(id)
    const w = WALLPAPERS.find(x => x.id === id)
    if (w) setAppearance(w.dark ? 'dark' : 'light')
  }

  const dark = appearance === 'dark'
  const secondary = labelColor(dark, 'secondary')
  const rowStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 } as const

  return (
    <GlassProvider
      appearance={appearance}
      defaultVariant={variant}
      reduceTransparency={reduceTransparency}
      accent={ACCENT}
    >
      <View style={{ flex: 1 }}>
        <Wallpaper spec={wallpaper} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingTop: 30, paddingBottom: 170 }}>
          <View style={{ width: '100%', maxWidth: 1180, paddingHorizontal: 24, gap: 18 }}>
            {/* ------------------------------------------------ header */}
            <View style={{ gap: 14, zIndex: 60 }}>
              <Text style={{ fontSize: 42, fontWeight: '800', letterSpacing: -1.2, color: labelColor(dark) }}>
                Liquid Glass
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 22, maxWidth: 660, color: secondary }}>
                The macOS 26 (Tahoe) material, translated to React Native and rendered here through
                react-native-web. Every surface refracts, frosts and tints the wallpaper behind it in real time —
                drag, press and hover things.
                {supportsLensing ? '' : ' (This browser cannot refract backdrops, so you are seeing the frosted fallback — open in Chrome for full lensing.)'}
              </Text>
              <View style={[rowStyle, { zIndex: 60 }]}>
                <GlassSegmented
                  options={['Light', 'Dark']}
                  value={dark ? 1 : 0}
                  onChange={i => setAppearance(i ? 'dark' : 'light')}
                  style={{ width: 168 }}
                />
                <GlassSegmented
                  options={['Regular', 'Clear']}
                  value={variant === 'clear' ? 1 : 0}
                  onChange={i => setVariant(i ? 'clear' : 'regular')}
                  style={{ width: 188 }}
                />
                <GlassMenu
                  label={wallpaper.name}
                  items={WALLPAPERS.map(w => ({ label: w.name, icon: w.dark ? '🌙' : '☀️', onSelect: () => pickWallpaper(w.id) }))}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <GlassToggle value={reduceTransparency} onChange={setReduceTransparency} />
                  <Text style={{ fontSize: 13, color: secondary }}>Reduce transparency</Text>
                </View>
              </View>
            </View>

            {/* ------------------------------------------------ engine playground */}
            <GlassCard
              title="Core engine — live"
              subtitle="These sliders drive the engine directly: displacement strength (refraction), frost blur, lens bezel width and chromatic dispersion of the sample surface below."
            >
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <GlassSurface
                  variant="clear"
                  radius={28}
                  refraction={refr * 120}
                  blur={frost * 14}
                  bezel={4 + bez * 40}
                  chromatic={chroma}
                  depth="floating"
                  style={{ width: '80%', height: 130, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 17, fontWeight: '700', color: labelColor(dark) }}>Liquid Glass</Text>
                  <Text style={{ fontSize: 12.5, color: secondary, marginTop: 3 }}>
                    refraction {Math.round(refr * 120)}px · blur {(frost * 14).toFixed(1)}px · bezel {Math.round(4 + bez * 40)}px
                  </Text>
                </GlassSurface>
              </View>
              <View style={{ gap: 10 }}>
                <LabeledSlider label="Refraction" value={refr} onChange={setRefr} dark={dark} />
                <LabeledSlider label="Frost" value={frost} onChange={setFrost} dark={dark} />
                <LabeledSlider label="Bezel" value={bez} onChange={setBez} dark={dark} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <GlassToggle value={chroma} onChange={setChroma} />
                  <Text style={{ fontSize: 13, color: secondary }}>Chromatic dispersion</Text>
                </View>
              </View>
            </GlassCard>

            {/* ------------------------------------------------ component grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
              <GlassCard title="Buttons" subtitle="Press: the glass recedes, gleams, then springs back with fluid overshoot." style={CARD}>
                <View style={[rowStyle, { marginBottom: 12 }]}>
                  <GlassButton title="Small" size="sm" onPress={() => push('🫧', 'Button', 'Small pressed')} />
                  <GlassButton title="Medium" onPress={() => push('🫧', 'Button', 'Medium pressed')} />
                  <GlassButton title="Large" size="lg" onPress={() => push('🫧', 'Button', 'Large pressed')} />
                </View>
                <View style={rowStyle}>
                  <GlassButton title="Continue" tinted onPress={() => push('💠', 'Button', 'Prominent pressed')} />
                  <GlassButton title="Share" icon="↑" onPress={() => push('📤', 'Share', 'Share sheet requested')} />
                </View>
              </GlassCard>

              <GlassCard title="Toggles & badges" subtitle="The knob stretches like a droplet while held." style={CARD}>
                <View style={[rowStyle, { marginBottom: 16 }]}>
                  <GlassToggle value={toggleA} onChange={setToggleA} />
                  <Text style={{ fontSize: 13, color: secondary, marginRight: 14 }}>Wi-Fi</Text>
                  <GlassToggle value={toggleB} onChange={setToggleB} />
                  <Text style={{ fontSize: 13, color: secondary }}>Bluetooth</Text>
                </View>
                <View style={rowStyle}>
                  <GlassBadge label="Default" />
                  <GlassBadge label="New" tint="#0a84ff" />
                  <GlassBadge label="Active" tint="#30d158" />
                  <GlassBadge label="Alert" tint="#ff453a" />
                </View>
              </GlassCard>

              <GlassCard title="Slider & progress" subtitle="The thumb is clear glass — drag it and watch it lens the track." style={CARD}>
                <GlassSlider value={slider} onChange={setSlider} style={{ marginBottom: 16 }} />
                <GlassProgress value={slider} style={{ marginBottom: 12 }} />
                <GlassProgress indeterminate />
              </GlassCard>

              <GlassCard title="Segmented & tabs" subtitle="Selection morphs between segments — it never jumps." style={CARD}>
                <GlassSegmented options={['Day', 'Week', 'Month']} value={seg} onChange={setSeg} style={{ marginBottom: 14 }} />
                <GlassTabs
                  tabs={[
                    { icon: '🏠', label: 'Home' },
                    { icon: '🔍', label: 'Browse' },
                    { icon: '🎵', label: 'Library' },
                  ]}
                  value={tab}
                  onChange={setTab}
                />
                <Text style={{ fontSize: 13, color: secondary, marginTop: 12 }}>
                  {['Recently played and suggestions.', 'Search across your library.', 'Playlists, albums and artists.'][tab]}
                </Text>
              </GlassCard>

              <GlassCard title="Text fields" subtitle="Focus grows an accent ring out of the glass." style={CARD}>
                <GlassTextField value={name} onChangeText={setName} placeholder="Account name" style={{ marginBottom: 12 }} />
                <GlassTextField value={pass} onChangeText={setPass} placeholder="Password" secure />
              </GlassCard>

              <GlassCard title="Menu & tooltip" subtitle="The menu morphs out of its anchor button." style={[CARD, { zIndex: 40 }]}>
                <View style={rowStyle}>
                  <GlassMenu
                    label="Actions"
                    items={[
                      { label: 'New Window', icon: '🪟', onSelect: () => push('🪟', 'Menu', 'New Window selected') },
                      { label: 'Duplicate', icon: '⧉', onSelect: () => push('⧉', 'Menu', 'Duplicate selected') },
                      { label: 'Share…', icon: '↑', onSelect: () => push('📤', 'Menu', 'Share selected') },
                      { label: 'Delete', icon: '🗑️', danger: true, onSelect: () => push('🗑️', 'Menu', 'Delete selected') },
                    ]}
                  />
                  <GlassTooltip label="Glass tooltip — springs in after a beat">
                    <GlassButton title="Hover me" onPress={() => {}} />
                  </GlassTooltip>
                </View>
              </GlassCard>

              <GlassCard title="Modal & notifications" subtitle="Floating glass layers over the whole desktop." style={CARD}>
                <View style={rowStyle}>
                  <GlassButton title="Open modal" tinted onPress={() => setModal(true)} />
                  <GlassButton
                    title="Notify"
                    icon="🔔"
                    onPress={() => push('🔔', 'Ping', 'A glass notification slid in from the edge.')}
                  />
                </View>
              </GlassCard>

              <GlassCard title="Toolbar" subtitle="Hover highlights pool inside the glass." style={CARD}>
                <GlassToolbar style={{ alignSelf: 'flex-start' }}>
                  <ToolbarButton icon="◀" onPress={() => push('◀', 'Toolbar', 'Back')} />
                  <ToolbarButton icon="▶" onPress={() => push('▶', 'Toolbar', 'Forward')} />
                  <ToolbarDivider />
                  <ToolbarButton icon="🔍" label="Search" onPress={() => push('🔍', 'Toolbar', 'Search')} />
                  <ToolbarButton icon="＋" active onPress={() => push('＋', 'Toolbar', 'New item')} />
                  <ToolbarButton icon="⋯" onPress={() => push('⋯', 'Toolbar', 'More')} />
                </GlassToolbar>
              </GlassCard>

              <GlassCard title="Sidebar" subtitle="The selection pill flows between rows." style={CARD}>
                <GlassSidebar
                  items={[
                    { icon: '🏠', label: 'Home' },
                    { icon: '📄', label: 'Documents' },
                    { icon: '🖼️', label: 'Photos' },
                    { icon: '🎵', label: 'Music' },
                    { icon: '⚙️', label: 'Settings' },
                  ]}
                  value={side}
                  onChange={setSide}
                  style={{ width: '100%' }}
                />
              </GlassCard>

              <GlassCard
                title="Materials"
                subtitle="Regular guarantees legibility; Clear lets the backdrop dominate with stronger lensing."
                style={CARD}
              >
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <GlassSurface variant="regular" radius={20} style={{ flex: 1, height: 110, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: labelColor(dark) }}>Regular</Text>
                  </GlassSurface>
                  <GlassSurface variant="clear" radius={20} style={{ flex: 1, height: 110, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: labelColor(dark) }}>Clear</Text>
                  </GlassSurface>
                </View>
              </GlassCard>
            </View>

            {/* ------------------------------------------------ adaptive window playground */}
            <GlassCard
              title="Adaptive window"
              subtitle="Drag the window by its title bar. The engine samples wallpaper luminance beneath it and flips its whole content tree light/dark — the same behind-content sampling macOS glass performs."
            >
              <View style={{ height: 360 }}>
                <GlassWindow title="Preferences.glass" sampler={sampler} initialX={30} initialY={10}>
                  <Text style={{ fontSize: 13, color: secondary, marginBottom: 12 }}>
                    Everything in this window adapts as you drag it.
                  </Text>
                  <GlassSlider value={winSlider} onChange={setWinSlider} style={{ marginBottom: 12 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <GlassToggle value={winToggle} onChange={setWinToggle} />
                    <GlassBadge label={winToggle ? 'Adaptive' : 'Paused'} tint={winToggle ? '#30d158' : undefined} />
                  </View>
                  <GlassButton title="Apply" tinted size="sm" onPress={() => push('✅', 'Window', 'Preferences applied')} />
                </GlassWindow>
              </View>
            </GlassCard>

            <Text style={{ fontSize: 12.5, color: labelColor(dark, 'tertiary'), textAlign: 'center', marginTop: 6 }}>
              Built with React Native primitives on react-native-web · Refraction via SDF displacement maps in
              backdrop-filter (Chromium) with a frosted fallback (Safari/Firefox) · Analyzed against macOS 26.4 Tahoe
            </Text>
          </View>
        </ScrollView>

        {/* ------------------------------------------------ desktop chrome */}
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' }}>
          <GlassDock apps={DOCK_APPS} onLaunch={app => push(app.icon, app.name, `${app.name} launched from the dock.`)} />
        </View>

        <GlassNotificationStack notices={notices} onDismiss={id => setNotices(n => n.filter(x => x.id !== id))} />

        <GlassModal visible={modal} onClose={() => setModal(false)} title="About this glass">
          <Text style={{ fontSize: 13.5, lineHeight: 20, color: secondary, marginBottom: 16 }}>
            This dialog is a floating chromatic glass sheet. It refracts the desktop behind it through a lens
            displacement map, catches a specular rim light from above, and popped in on a spring. Press the red
            traffic light or the backdrop to dismiss.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <GlassButton title="Learn more" onPress={() => push('📖', 'Docs', 'See docs/ANALYSIS.md in the repo')} />
            <GlassButton title="Done" tinted onPress={() => setModal(false)} />
          </View>
        </GlassModal>
      </View>
    </GlassProvider>
  )
}

function LabeledSlider({
  label,
  value,
  onChange,
  dark,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  dark: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ width: 82, fontSize: 13, fontWeight: '600', color: labelColor(dark, 'secondary') }}>{label}</Text>
      <GlassSlider value={value} onChange={onChange} style={{ flex: 1 }} />
    </View>
  )
}
