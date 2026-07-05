# Liquid Glass — forensic extraction log

Everything in this document was read directly off **macOS 26.4.1 (build 25E253)** — the
machine this repo was developed on. No values were estimated from screenshots. The
engine ([src/engine/recipes.ts](../src/engine/recipes.ts)) consumes this data verbatim.

## Method

1. **Material recipes** — CoreMaterial ships its material definitions as binary plists
   on disk (they are resources, so they are not locked inside the dyld shared cache):

   ```sh
   find /System/Library/PrivateFrameworks/CoreMaterial.framework -name "*.materialrecipe"
   plutil -p .../platformContentGlass.materialrecipe   # etc. (45 recipes)
   ```

2. **Filter primitives** — QuartzCore's private `CAFilter` class enumerates the actual
   GPU filter set (compiled ObjC, run on this machine):

   ```objc
   [NSClassFromString(@"CAFilter") filterTypes]
   ```

   Tahoe's list includes, among classic filters: **`glassBackground`**,
   **`glassForeground`**, **`chromaticAberrationMap`**, **`displacementMap`**,
   **`variableBlur`**, **`luminanceCurveMap`**, `vibrantColorMatrix`.

3. **SDF glass effects** — the lens is implemented as SDF-driven effects. Their
   parameter sets and defaults were read from live instances:

   ```objc
   [[NSClassFromString(@"CASDFGlassDisplacementEffect") alloc] init]  // + KVC reads
   ```

4. **Live layer tree** — an `NSGlassEffectView` was instantiated in a real window and
   its layer tree walked: `CABackdropLayer` (with the `glassBackground` filter and
   `scale`/`tracksLuma` config) → `CASDFLayer` → `CASDFElementLayer` (the rounded-rect
   SDF shape, `operation=union`), plus `vibrantColorMatrix` filters on content layers.

## Extracted data

### CASDF glass effect defaults (QuartzCore, live instances)

| Effect | Parameters (defaults) |
| --- | --- |
| `CASDFGlassDisplacementEffect` (the lens) | height **20**, curvature **1.0**, angle **0**, maskOffset **0** |
| `CASDFGlassHighlightEffect` (specular rim) | height **20**, curvature **1.0**, angle **π/2** (light from straight above), spread **π**, amount **0.5** |
| `CASDFKeyFillHighlightEffect` (content highlight) | curvature **0.7** |

### Live NSGlassEffectView observations

- Layer stack: `CABackdropLayer` + filter `glassBackground` → `CASDFLayer` →
  `CASDFElementLayer` (cornerRadius = view cornerRadius, `mode=bounds`,
  `operation=union` — union is how merging glass shapes coalesce).
- `CABackdropLayer.scale` = **0.25** at `style=0` (regular) and **0.5** at `style=1` —
  clear glass captures the backdrop at twice the resolution, i.e. half the effective frost.
- `CABackdropLayer.lumaUpdateRate` = **0.25** (adaptive luminance sampling at 4 Hz);
  `tracksLuma` toggles the behind-content adaptivity.
- `NSGlassEffectView` exposes `_variant`, `_subvariant`, `_interactionState`,
  `_subduedState`, `_scrimState`, `_contentLensing`, `_adaptiveAppearance` (default 2),
  `_groupIdentifier` (merge groups), `cornerRadius` (default 26), `tintColor`.
- `CASDFLayer` exposes `mergeElements`, `smoothness`, `gaussianRadius` — the liquid
  merge controls.

### Material recipes (CoreMaterial, decoded plists)

| Recipe | blur | backdropScale | saturation | brightness | luminance curve (amount) | color matrix |
| --- | --- | --- | --- | --- | --- | --- |
| `platformContentGlass` (+Darker/Lighter) | 45 | — | — | — | — | 0.629·Sat(1.589)+0.235 ¹ |
| `dockLight` | 30 (at end) | 0.25 | 1.8 | +0.08 | [0.3, 0.5, 1, 0.77] (0.5) | — |
| `dockDark` | 30 (at end) | 0.25 | 1.6 | — | [0.29, −0.2, 0.375, 0.65] (0.5) | — |
| `platters` (menus/popovers, light) | 30 (at end) | 0.25 | **2.4** | — | [0.775, 0.85, 1.05, 0.94] (0.6) | — |
| `plattersDark` | 30 (at end) | 0.25 | 1.4 | −0.03 | [0.41, −0.4, 0.3, 0] (0.4) | — |
| `toolbarButtonBackground` | 15 (at end) | 0.25 | 1.1 | — | [0.24, 0.24, 0.3, 0.39] (0.5) | — |
| `platformContentLight` | 30 (at end) | 0.25 | 1.5 | +0.1 | [0.9, 0.83, 0.925, 0.815] (0.75) | — |
| `platformContentDark` | 30 (at end) | 0.25 | 1.5 | 0 | [0.16, 0.26, 0.1, 0.1] (0.75) | — |
| `platformChromeLight` | 22.5 (at end) | 0.25 | 1.1 | +0.1 | [0.8, 0.9, 1.1, 0.825] (0.75) | — |
| `platformChromeDark` | 22.5 (at end) | 0.25 | 2.0 | −0.1 | [0.23, 0.52, 0.27, 0.255] (0.75) | — |
| `modules` (Control Center) | — ² | — | — | — | — | 0.731·Sat(1.335)−0.061 ¹ |

¹ Decomposition of the verbatim 4×5 matrix (stored in full in recipes.ts). The
decomposition falls out exactly on **Rec.709 luma weights (0.2126/0.7152/0.0722)** —
the same weights SVG's `feColorMatrix type="saturate"` uses.

² The modules recipe is color-only; Control Center's blur comes from the panel's
backdrop configuration.

Notable: **`platformContentGlass` has no light/dark variants.** The matrix compresses
the backdrop into the 0.235–0.864 luminance band and legibility is handled by luma
tracking + vibrant content, not by swapping the base material.

There are 45 recipes in total on this build; the ones above are the set used by the
visible Liquid Glass surfaces this repo implements. Also decoded:
`platterStrokeLight/Dark`, `moduleFill/Stroke` (the near-solid-white active state is
`moduleHighlight`: a backdrop-aware matrix ≈ 0.03·backdrop + 0.97),
`platformChromeLightReduceTransparency` (the accessibility fallback material).

## Engine mapping (exact vs approximated)

**Verbatim (bit-exact values):** every recipe's blur radius, saturation, brightness,
luminance curve + amount, and full color matrices (SVG `feColorMatrix` shares
CoreMaterial's 4×5 layout, so matrices transfer without conversion); SDF lens
height/curvature/angle defaults; backdrop scale regular/clear; luma update rate.

**Structurally identical, numerically mapped:** the lens displacement profile. Apple
evaluates it in the compiled `glassBackground` Metal shader (inside the dyld shared
cache, not extractable without decompilation); the engine uses the same architecture —
rounded-rect SDF, displacement along the SDF gradient within `height` px of the edge —
with a `t^(2·curvature)` profile and displacement scale defaulting to 2×height.

**Documented approximations:** the luminance curve is applied per-channel
(`feComponentTransfer`) instead of luma-only; `backdropScale` downsampling is a capture
optimization SVG cannot express (its frost contribution is folded into the blur
radius); the specular rim samples the highlight's cosine falloff at four edges as inset
shadows instead of a true angular gradient; CA blur radius is mapped 1:1 onto
`feGaussianBlur stdDeviation`.
