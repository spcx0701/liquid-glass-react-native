# Liquid Glass · React Native

The macOS 26 (Tahoe) **Liquid Glass** material system, analyzed on a real Tahoe machine
and translated into React Native — a core glass engine plus a full interactive component
library, running in the browser through `react-native-web`.

**Live demo:** https://spcx0701.github.io/liquid-glass-react-native/
*(open in Chrome/Edge/Arc for true refraction; Safari/Firefox get the frosted fallback)*

**The analysis:** [docs/ANALYSIS.md](docs/ANALYSIS.md) — each observed macOS behavior and
the engine module that reproduces it.

## What the engine does

| macOS Liquid Glass behavior | Engine implementation |
| --- | --- |
| Edge lensing (refraction) | Rounded-rect SDF → displacement map → `feDisplacementMap` in `backdrop-filter` — [`displacement.ts`](src/engine/displacement.ts), [`filters.ts`](src/engine/filters.ts) |
| Frosting with vibrancy | blur + `saturate()` per variant — [`theme.ts`](src/engine/theme.ts) |
| Regular / Clear variants | `VARIANTS` material specs, app-wide default via provider |
| Specular rim light | Inset bevel shadow stack from a fixed overhead light |
| Behind-content adaptivity | Offscreen-canvas `LuminanceSampler` + nested `GlassProvider` appearance cascade — [`wallpaper.ts`](src/engine/wallpaper.ts) |
| Gel-like interactivity | Spring presets: press-recede, gleam, overshoot release — [`springs.ts`](src/engine/springs.ts) |
| Morphing selection | Single glass pill animated between states (`Motion.morph`) |
| Chromatic dispersion | Per-channel displacement (R 1.16× / G 1× / B 0.84×) + screen recombine |
| Reduce transparency | Provider flag swaps every surface to near-opaque |

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
