// Wallpapers are declared as data (base gradient + color blobs) so the same
// spec renders twice: once as CSS gradients for the screen, once onto an
// offscreen canvas for luminance sampling — which is how the engine's
// adaptive behavior decides whether glass content should flip light/dark,
// mirroring how the macOS material samples what's behind it.

export interface WallpaperBlob {
  x: number
  y: number
  r: number
  rgb: [number, number, number]
  a?: number
}

export interface WallpaperSpec {
  id: string
  name: string
  dark: boolean
  base: [[number, number, number], [number, number, number]]
  blobs: WallpaperBlob[]
}

export const WALLPAPERS: WallpaperSpec[] = [
  {
    id: 'tahoe-day',
    name: 'Tahoe Day',
    dark: false,
    base: [
      [126, 168, 222],
      [236, 224, 212],
    ],
    blobs: [
      { x: 0.15, y: 0.18, r: 0.5, rgb: [255, 150, 118] },
      { x: 0.85, y: 0.12, r: 0.45, rgb: [116, 190, 255] },
      { x: 0.72, y: 0.85, r: 0.55, rgb: [255, 204, 118], a: 0.8 },
      { x: 0.24, y: 0.8, r: 0.42, rgb: [152, 118, 255], a: 0.65 },
      { x: 0.5, y: 0.46, r: 0.3, rgb: [255, 255, 255], a: 0.5 },
    ],
  },
  {
    id: 'tahoe-night',
    name: 'Tahoe Night',
    dark: true,
    base: [
      [15, 19, 38],
      [43, 27, 58],
    ],
    blobs: [
      { x: 0.2, y: 0.22, r: 0.46, rgb: [64, 90, 220], a: 0.55 },
      { x: 0.82, y: 0.18, r: 0.4, rgb: [182, 70, 162], a: 0.5 },
      { x: 0.6, y: 0.82, r: 0.5, rgb: [30, 142, 184], a: 0.5 },
      { x: 0.34, y: 0.64, r: 0.3, rgb: [242, 120, 60], a: 0.32 },
    ],
  },
  {
    id: 'poolside',
    name: 'Poolside',
    dark: false,
    base: [
      [64, 158, 199],
      [196, 238, 240],
    ],
    blobs: [
      { x: 0.3, y: 0.3, r: 0.5, rgb: [255, 255, 255], a: 0.55 },
      { x: 0.85, y: 0.7, r: 0.5, rgb: [22, 122 , 168], a: 0.7 },
      { x: 0.1, y: 0.85, r: 0.4, rgb: [255, 214, 140], a: 0.6 },
    ],
  },
  {
    id: 'lava',
    name: 'Lava',
    dark: true,
    base: [
      [24, 10, 16],
      [58, 18, 12],
    ],
    blobs: [
      { x: 0.75, y: 0.75, r: 0.55, rgb: [255, 96, 32], a: 0.55 },
      { x: 0.2, y: 0.3, r: 0.45, rgb: [148, 32, 80], a: 0.55 },
      { x: 0.5, y: 0.95, r: 0.35, rgb: [255, 190, 60], a: 0.4 },
    ],
  },
]

export function wallpaperCSS(w: WallpaperSpec): string {
  const blobs = w.blobs
    .map(
      b =>
        `radial-gradient(${(b.r * 130).toFixed(0)}% ${(b.r * 130).toFixed(0)}% at ${(b.x * 100).toFixed(0)}% ${(
          b.y * 100
        ).toFixed(0)}%, rgba(${b.rgb.join(',')},${b.a ?? 0.9}) 0%, rgba(${b.rgb.join(',')},0) 100%)`,
    )
    .join(', ')
  const base = `linear-gradient(180deg, rgb(${w.base[0].join(',')}) 0%, rgb(${w.base[1].join(',')}) 100%)`
  return `${blobs}, ${base}`
}

export class LuminanceSampler {
  private data: Uint8ClampedArray | null = null
  private readonly w = 96
  private readonly h = 60

  constructor(spec: WallpaperSpec) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = this.w
      canvas.height = this.h
      const ctx = canvas.getContext('2d')!
      const base = ctx.createLinearGradient(0, 0, 0, this.h)
      base.addColorStop(0, `rgb(${spec.base[0].join(',')})`)
      base.addColorStop(1, `rgb(${spec.base[1].join(',')})`)
      ctx.fillStyle = base
      ctx.fillRect(0, 0, this.w, this.h)
      for (const b of spec.blobs) {
        const cx = b.x * this.w
        const cy = b.y * this.h
        const radius = b.r * 1.3 * ((this.w + this.h) / 2)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        g.addColorStop(0, `rgba(${b.rgb.join(',')},${b.a ?? 0.9})`)
        g.addColorStop(1, `rgba(${b.rgb.join(',')},0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, this.w, this.h)
      }
      this.data = ctx.getImageData(0, 0, this.w, this.h).data
    } catch {
      this.data = null
    }
  }

  /** Average relative luminance (0..1) over a viewport-normalized rect. */
  luminanceAt(nx: number, ny: number, nw = 0, nh = 0): number {
    if (!this.data) return 0.5
    const x0 = Math.max(0, Math.min(this.w - 1, Math.floor(nx * this.w)))
    const y0 = Math.max(0, Math.min(this.h - 1, Math.floor(ny * this.h)))
    const x1 = Math.max(x0, Math.min(this.w - 1, Math.ceil((nx + nw) * this.w)))
    const y1 = Math.max(y0, Math.min(this.h - 1, Math.ceil((ny + nh) * this.h)))
    let sum = 0
    let n = 0
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = (y * this.w + x) * 4
        sum += 0.2126 * this.data[i] + 0.7152 * this.data[i + 1] + 0.0722 * this.data[i + 2]
        n++
      }
    }
    return n ? sum / n / 255 : 0.5
  }
}
