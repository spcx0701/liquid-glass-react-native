# Liquid Glass · React Native

The macOS 26 (Tahoe) **Liquid Glass** material system translated into React Native —
built from implementation data **extracted directly from macOS** (CoreMaterial recipe
plists, QuartzCore's CASDF glass effects, a live NSGlassEffectView layer tree), not
from eyeballed screenshots. Core glass engine + a full interactive component library,
running in the browser through `react-native-web`.

**Live demo:** https://spcx0701.github.io/liquid-glass-react-native/
*(open in Chrome/Edge/Arc for true refraction; Safari/Firefox get the frosted fallback)*

**The extraction:** [docs/EXTRACTION.md](docs/EXTRACTION.md) — how the system data was
pulled off macOS 26.4.1 and every extracted value.
**The analysis:** [docs/ANALYSIS.md](docs/ANALYSIS.md) — the behavioral model those
values implement.

## What the engine does

| macOS implementation (extracted) | Engine implementation |
| --- | --- |
| `CASDFGlassDisplacementEffect` (height 20, curvature 1, angle 0) over the shape's SDF | Rounded-rect SDF → displacement map → `feDisplacementMap` in `backdrop-filter` — [`displacement.ts`](src/engine/displacement.ts), [`filters.ts`](src/engine/filters.ts) |
| CoreMaterial recipes: `platformContentGlass` (blur 45 + exact 4×5 matrix), `platters` (sat 2.4), `dockLight/Dark`, `toolbarButtonBackground`, `platformChrome*`, `platformContent*` | Verbatim recipe data compiled into SVG primitives (`feGaussianBlur`, `feColorMatrix`, `feComponentTransfer`) — [`recipes.ts`](src/engine/recipes.ts) |
| `CASDFGlassHighlightEffect` (angle π/2, spread π, amount 0.5) | Specular rim sampled from the cosine falloff as inset bevels — [`theme.ts`](src/engine/theme.ts) |
| `CABackdropLayer` scale 0.25 (regular) / 0.5 (clear) | Clear variant halves effective frost |
| `CABackdropLayer.tracksLuma`, `lumaUpdateRate` 0.25 | Offscreen-canvas `LuminanceSampler` at 4 Hz + nested `GlassProvider` appearance cascade — [`wallpaper.ts`](src/engine/wallpaper.ts) |
| CA `chromaticAberrationMap` filter | Per-channel displacement + screen recombine |
| Interactive gel response | Spring presets: press-recede, gleam, overshoot release — [`springs.ts`](src/engine/springs.ts) |
| SDF `operation=union` + `mergeElements` (liquid merging) | Morphing selection pills (`Motion.morph`) |
| `platformChrome*ReduceTransparency` recipes | Provider flag swaps every surface to near-opaque |

## Components (all interactive in the demo)

`GlassButton` · `GlassToggle` · `GlassSlider` · `GlassSegmented` · `GlassTextField` ·
`GlassCard` · `GlassToolbar` · `GlassDock` (cursor magnification) · `GlassMenu` ·
`GlassModal` · `GlassTabs` · `GlassProgress` · `GlassBadge` · `GlassTooltip` ·
`GlassNotificationStack` · `GlassSidebar` · `GlassWindow` (draggable, adaptive)

## Architecture

```
src/
  engine/          the material system (pure logic + web adapter)
    displacement.ts  SDF lens-map generation
    filters.ts       SVG filter lifecycle + caching
    theme.ts         variants, rims, shadows, palettes
    springs.ts       motion physics (press/release/morph)
    wallpaper.ts     wallpaper specs + luminance sampling
    GlassProvider.tsx appearance/variant/accent context (nestable)
    GlassSurface.tsx  the core 3-layer material component
  components/      17 UI components built only on the engine + RN primitives
  demo/            the showcase desktop
```

Components are written exclusively against React Native primitives (`View`, `Text`,
`Pressable`, `Animated`, `PanResponder`); Vite aliases `react-native` →
`react-native-web` ([vite.config.ts](vite.config.ts)). On a Metro/native target the
same component and physics layers compile as-is; only the engine's rendering adapter
(backdrop filters) is web-specific and maps to Skia/`BackdropFilter` natively.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173/liquid-glass-react-native/
npm run build    # static site in dist/
```

Deployed to GitHub Pages by [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
on every push to `main`.
