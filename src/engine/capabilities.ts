// Feature detection for the web adapter of the glass engine.
//
// True refraction requires an SVG filter reference inside backdrop-filter
// (`backdrop-filter: url(#lens)`). Chromium renders it; Safari and Firefox
// parse it but paint nothing, so they get the frosted (blur+saturate)
// fallback — the same degradation macOS itself uses for "Reduce
// transparency", just less aggressive.

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''

export const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|edg|android/i.test(ua)
export const isFirefox = /firefox/i.test(ua)

export const supportsBackdrop =
  typeof CSS !== 'undefined' &&
  (CSS.supports('backdrop-filter: blur(1px)') || CSS.supports('-webkit-backdrop-filter: blur(1px)'))

export const supportsLensing = supportsBackdrop && !isSafari && !isFirefox
