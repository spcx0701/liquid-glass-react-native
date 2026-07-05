# Liquid Glass: how the macOS 26 material actually behaves

This analysis was written against a real Tahoe machine — macOS **26.4.1 (25E253)**, light
appearance, transparency enabled, default accent — by observing system surfaces
(Control Center, menus, the Dock, sliders, toolbars, notifications) and Apple's public
material documentation. Each observed behavior below maps to the module in
[`src/engine/`](../src/engine) that reproduces it.

## 1. The material is a lens, not a blur

Pre-Tahoe "frosted" materials were a blur + tint. Liquid Glass is modeled as a physical
slab of glass with a convex profile: **optically neutral in the center, bending light
progressively toward the rim**. Watch any Control Center module over the wallpaper — the
center shows frosted backdrop, but the outer ~15 px visibly *pulls in* content from
beyond the edge, compressed and curved. Apple calls this **lensing**.

**Engine translation** — [`displacement.ts`](../src/engine/displacement.ts): the surface
shape is a rounded-rectangle signed distance field. Pixels within `bezel` px of the edge
are displaced along the SDF gradient (the outward normal) with a quadratic falloff
(`mag = t²`), encoded into an R/G displacement map, and applied to the backdrop with
`feDisplacementMap` inside `backdrop-filter` ([`filters.ts`](../src/engine/filters.ts)).
The center of every surface has zero displacement — exactly like the real material.

## 2. Frosting preserves color (vibrancy)

The blur behind glass is paired with a saturation boost so the backdrop's colors stay
vivid instead of washing out gray. Regular glass frosts heavily; clear glass barely.

**Engine translation** — `saturate(1.5)` chained after the lens filter;
per-variant blur radii in [`theme.ts`](../src/engine/theme.ts).

## 3. Two variants: Regular and Clear

- **Regular**: heavier frost and tint, guarantees legibility of content on the glass,
  fully adaptive. Used by menus, sidebars, alerts.
- **Clear**: nearly transparent, stronger lensing, lets media underneath dominate. Used
  over photos/video, always paired with more assertive rim lighting.

**Engine translation** — `VARIANTS` in [`theme.ts`](../src/engine/theme.ts); every
component takes `variant`, and a `GlassProvider` sets the app-wide default.

## 4. Specular rim from a fixed virtual light

Glass edges catch light from a light source above the display plane: a bright inner
bevel along the top edge, a fainter counter-light along the bottom, subtle on the sides.
This — not the blur — is the strongest "this is glass" cue at small sizes.

**Engine translation** — `rimHighlight()` in [`theme.ts`](../src/engine/theme.ts):
a stack of inset box-shadows with intensities keyed to variant and appearance, plus a
1 px translucent white border.

## 5. The glass samples what's beneath it (adaptivity)

Drag a Tahoe window between a bright and a dark region of the wallpaper: the material's
tint and its content flip between light and dark treatments automatically. The material
is *behind-content aware*.

**Engine translation** — [`wallpaper.ts`](../src/engine/wallpaper.ts): wallpapers are
declared as data and rendered twice — CSS gradients for the screen, an offscreen canvas
for `LuminanceSampler`. The draggable `GlassWindow` samples the luminance under its own
rect while moving and re-provides `appearance` to its whole subtree via a nested
`GlassProvider` ([`GlassProvider.tsx`](../src/engine/GlassProvider.tsx)) — the same
cascade the system applies.

## 6. Interactive glass responds like gel

Press any Tahoe control: the glass recedes slightly (~4–5 % scale), simultaneously
brightens (a "gleam" as if your touch illuminates it), and on release springs back with
a visible fluid overshoot. Hover on macOS adds a gentle brightening. Nothing snaps;
every transition is a spring.

**Engine translation** — [`springs.ts`](../src/engine/springs.ts): `useGlassPress()`
returns scale/gleam/hover `Animated.Value`s driven by tuned spring presets
(`press` = stiff follow, `release` = underdamped overshoot, `morph` = selection
movement). The toggle knob additionally stretches (`scaleX 1.14`) while held.

## 7. Selection morphs; it never teleports

Segmented controls, sidebars and tab bars move a single glass pill *between* states —
the selection is a droplet that flows to its new position, not a highlight that
reappears elsewhere. Menus grow out of their anchor buttons (scale from the anchor
corner), not fade in place.

**Engine translation** — `GlassSegmented`, `GlassTabs`, `GlassSidebar` animate one
absolute indicator with `Motion.morph` springs; `GlassMenu` scales from
`transformOrigin: top left` with a spring.

## 8. Chromatic dispersion at the rim

Look closely at a clear-glass edge over high-contrast content: a subtle RGB fringe,
because the lens bends each wavelength slightly differently.

**Engine translation** — the optional chromatic filter chain in
[`filters.ts`](../src/engine/filters.ts) displaces R/G/B channels at 1.16×/1×/0.84×
strength, isolates each with `feColorMatrix`, and recombines with screen blends.

## 9. Layering rules and shadows

Glass floats *above* a content layer; content scrolls beneath it (the Dock and menu bar
refract whatever passes under). Glass never stacks on glass in system UI. Depth is
conveyed by soft ambient shadows that scale with elevation (flat control → raised card →
floating window/menu/dock).

**Engine translation** — `surfaceShadow(depth)` presets in
[`theme.ts`](../src/engine/theme.ts); the demo keeps controls on cards, and floating
chrome (dock, menus, modals, notifications) at `floating` depth above the scroll plane.

## 10. Accessibility fallback

With **Reduce transparency** enabled, macOS replaces all of this with near-opaque
surfaces — the material system degrades gracefully rather than being load-bearing.
(This machine had it off: `com.apple.universalaccess reduceTransparency` unset.)

**Engine translation** — the `reduceTransparency` flag on `GlassProvider` swaps every
surface to a near-opaque background and disables filters; toggleable live in the demo.

## Web rendering constraints

True backdrop refraction requires an SVG filter reference in `backdrop-filter`, which
only Chromium rasterizes today. Safari and Firefox parse it but paint nothing, so
[`capabilities.ts`](../src/engine/capabilities.ts) detects them and serves the frosted
(blur + saturate + rim) pipeline instead — degradation in the same spirit as Apple's own
fallbacks. On native React Native, the engine's adapter surface (displacement +
blur + tint) maps to Skia shaders / `BackdropFilter`; the component and physics layers
are platform-independent RN primitives.
