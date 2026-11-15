import { getJson } from './client'
import type { SpectrumResponse } from './types'

// GET /spectrum: espectro de cualquier posición dentro de un campo ya preparado (objetivos y presets).
// Solo usa exposiciones en caché del servidor: ~0.5 s en los presets, ~3.5–6 s en los campos grandes.

// Los campos válidos (GET /fields) son exactamente los conocidos de fields.ts: los 5 objetivos y los presets.

export function getSpectrumAt(field: string, ra: number, dec: number, label?: string, signal?: AbortSignal) {
  return getJson<SpectrumResponse>(
    '/spectrum',
    { field, ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)), label },
    signal,
  )
}
