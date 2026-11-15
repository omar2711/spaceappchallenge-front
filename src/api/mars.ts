import { getJson } from './client'
import type { MarsWalk } from './types'

// Caminata de la Ruta del Agua en el cráter Jezero: recorrido real de Perseverance, paradas y peligros.

let walk: Promise<MarsWalk> | null = null

/** GET /mars/marswalk (se guarda en memoria; un fallo se puede reintentar). */
export function getMarsWalk(): Promise<MarsWalk> {
  if (!walk) {
    walk = getJson<MarsWalk>('/mars/marswalk')
    walk.catch(() => (walk = null))
  }
  return walk
}
