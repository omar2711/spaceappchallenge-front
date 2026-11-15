import { getJson } from './client'
import type { GaiaField, Visibility } from './types'

// Endpoints de contexto (B3): estrellas Gaia DR3 de un campo conocido y visibilidad desde Cochabamba.

const gaiaCache = new Map<string, Promise<GaiaField>>()

/** GET /gaia?field=<id> (los 5 objetivos y los presets). Se guarda en memoria; los fallos no. */
export function getGaia(field: string): Promise<GaiaField> {
  let p = gaiaCache.get(field)
  if (!p) {
    p = getJson<GaiaField>('/gaia', { field })
    p.catch(() => gaiaCache.delete(field))
    gaiaCache.set(field, p)
  }
  return p
}

/** GET /visibility: noche que empieza en `date` (YYYY-MM-DD, hora local de Cochabamba, UTC−4). */
export function getVisibility(ra: number, dec: number, date?: string, signal?: AbortSignal) {
  return getJson<Visibility>('/visibility', { ra: Number(ra.toFixed(5)), dec: Number(dec.toFixed(5)), date }, signal)
}
