import { surfaceData } from './surfaceData'
import { getJson } from './client'
import type { MoonSites, MoonVisibility } from './types'

// Sitios lunares (Apollo 11–17 y regiones candidatas de Artemis III) y Sol/Tierra vistos desde cada uno.

let sites: Promise<MoonSites> | null = null

/** GET /moon/sites (se guarda en memoria; un fallo se puede reintentar). */
export function getMoonSites(): Promise<MoonSites> {
  if (!sites) {
    sites = surfaceData('moon-sites.json', () => getJson<MoonSites>('/moon/sites'))
    sites.catch(() => (sites = null))
  }
  return sites
}

/** GET /moon/visibility: `start` YYYY-MM-DD (UTC), `days` ≤ 30, `stepMin` 5–360. Responde en < 0.2 s. */
export function getMoonVisibility(site: string, start: string, days: number, stepMin: number, signal?: AbortSignal) {
  return getJson<MoonVisibility>('/moon/visibility', { site, start, days, step_min: stepMin }, signal)
}
