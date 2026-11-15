import type { SkyFrame, SkyRequest } from '../../../api/sky'

// DATOS DE EJEMPLO: imágenes sintéticas dibujadas en canvas. No son imágenes de SPHEREx.
// El campo de estrellas depende solo de RA/Dec (mismo parche = mismo campo). El FOV no afecta
// al mock. Las épocas y las bandas son inventadas y genéricas.
export const MOCK_FRAME_COUNT = 12
const SIZE = 384
const STAR_COUNT = 90
const EPOCH_BASE_MS = Date.UTC(2000, 0, 1) // época sintética de ejemplo
const EPOCH_STEP_MS = 6 * 60 * 60 * 1000

// Hash FNV-1a del texto "ra|dec" → semilla de 32 bits.
function seedFrom(req: SkyRequest): number {
  const text = `${req.raDeg.toFixed(4)}|${req.decDeg.toFixed(4)}`
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Generador pseudoaleatorio determinista (mulberry32).
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateMockFrames(req: SkyRequest): SkyFrame[] {
  const rand = mulberry32(seedFrom(req))

  const stars = Array.from({ length: STAR_COUNT }, () => {
    const x = rand() * SIZE
    const y = rand() * SIZE
    const big = rand() ** 3
    const alpha = 0.35 + rand() * 0.65
    return { x, y, r: 0.7 + big * 2.2, alpha }
  })

  // Objeto en movimiento: recta de un punto inicial a uno final dentro del campo.
  const start = { x: 0.12 + rand() * 0.23, y: 0.15 + rand() * 0.7 }
  const end = { x: 0.6 + rand() * 0.28, y: 0.15 + rand() * 0.7 }

  return Array.from({ length: MOCK_FRAME_COUNT }, (_, i) => {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D no disponible')

    ctx.fillStyle = '#02050a'
    ctx.fillRect(0, 0, SIZE, SIZE)

    for (const s of stars) {
      ctx.globalAlpha = s.alpha
      ctx.fillStyle = '#dbe8ff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }

    const t = i / (MOCK_FRAME_COUNT - 1)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(
      (start.x + (end.x - start.x) * t) * SIZE,
      (start.y + (end.y - start.y) * t) * SIZE,
      2.8,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    return {
      id: `mock-${i + 1}`,
      epochUT: new Date(EPOCH_BASE_MS + i * EPOCH_STEP_MS).toISOString(),
      bandLabel: 'Banda de ejemplo',
      imageUrl: canvas.toDataURL('image/png'),
    }
  })
}
