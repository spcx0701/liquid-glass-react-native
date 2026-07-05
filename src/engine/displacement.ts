// Lens map generation — the heart of the refraction effect.
//
// Liquid Glass behaves like a slab of convex glass: flat (optically neutral)
// in the center, bending light increasingly toward the rim. We model the
// surface as a rounded-rectangle signed distance field. Every pixel within
// `bezel` px of the edge is displaced along the SDF gradient (the outward
// normal) with a quadratic falloff, so sampling reaches past the edge at the
// rim and relaxes to zero at the bezel's inner boundary. Encoded as
// R = 128 + dx·127, G = 128 + dy·127 for feDisplacementMap.

function roundedRectSDF(px: number, py: number, hw: number, hh: number, r: number): number {
  const qx = Math.abs(px) - hw + r
  const qy = Math.abs(py) - hh + r
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}

export function generateLensMap(width: number, height: number, radius: number, bezel: number): string {
  // Maps are smooth gradients, so they can be generated at reduced
  // resolution and stretched by feImage without visible loss.
  const scale = Math.min(1, 256 / Math.max(width, height))
  const mw = Math.max(4, Math.round(width * scale))
  const mh = Math.max(4, Math.round(height * scale))
  const hw = mw / 2
  const hh = mh / 2
  const r = Math.min(radius * scale, hw, hh)
  const bz = Math.max(2, bezel * scale)

  const canvas = document.createElement('canvas')
  canvas.width = mw
  canvas.height = mh
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(mw, mh)
  const data = img.data
  const e = 0.75

  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const px = x + 0.5 - hw
      const py = y + 0.5 - hh
      const sd = roundedRectSDF(px, py, hw, hh, r)
      let dx = 0
      let dy = 0
      const edge = -sd // distance inward from the surface's edge
      if (edge >= 0 && edge < bz) {
        const t = 1 - edge / bz // 1 at the rim -> 0 at the bezel interior
        const mag = t * t // convex lens profile
        const gx = (roundedRectSDF(px + e, py, hw, hh, r) - roundedRectSDF(px - e, py, hw, hh, r)) / (2 * e)
        const gy = (roundedRectSDF(px, py + e, hw, hh, r) - roundedRectSDF(px, py - e, hw, hh, r)) / (2 * e)
        const len = Math.hypot(gx, gy) || 1
        dx = (gx / len) * mag
        dy = (gy / len) * mag
      }
      const i = (y * mw + x) * 4
      data[i] = 128 + dx * 127
      data[i + 1] = 128 + dy * 127
      data[i + 2] = 128
      data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL()
}
