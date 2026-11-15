// Los sitios llegan del backend (GET /moon/sites: Apollo 11–17 según NSSDCA/LRO y las nueve regiones
// candidatas de Artemis III según NASA, oct. 2024). Aquí solo queda lo propio de la interfaz.
import type { MoonSite } from '../../../api/types'

export const GROUP_LABEL: Record<MoonSite['group'], string> = {
  apollo: 'Apollo',
  artemis3_candidate: 'Artemis III (candidata)',
}

// Traducción de los textos del backend (en inglés); si no hay traducción se muestra el original.
const HISTORY_ES: Record<string, string> = {
  apollo11: 'Primer alunizaje tripulado.',
  apollo12: 'Alunizaje de precisión junto a la sonda Surveyor 3.',
  apollo14: 'Objetivo en las tierras altas planeado originalmente para el Apollo 13.',
  apollo15: 'Primer vehículo lunar (LRV); la «Roca del Génesis».',
  apollo16: 'Único alunizaje en las tierras altas centrales de la Luna.',
  apollo17: 'Último alunizaje tripulado; primer geólogo en la Luna.',
}

const NOTE_ES: Record<string, string> = {
  "NASA candidate landing region (Oct 2024). Position = IAU centre of the named feature, NOT the region centre: each region is ~15x15 km and may lie on the feature's rim or slopes.":
    'Región candidata de la NASA para el alunizaje (oct. 2024). La posición es el centro IAU del accidente que le da nombre, no el centro de la región: cada región mide ~15 × 15 km y puede estar en su borde o sus laderas.',
}

export const historyEs = (s: MoonSite) => (s.history ? (HISTORY_ES[s.id] ?? s.history) : undefined)
export const noteEs = (s: MoonSite) => (s.note ? (NOTE_ES[s.note] ?? s.note) : undefined)

/** Fichas de /abandonados con el equipo que quedó en cada sitio Apollo. */
export const ABANDONED_CARD: Record<string, string> = {
  apollo12: 'apollo-12-lm',
  apollo15: 'apollo-15-lm',
}

export const siteZoom = (s: MoonSite) => (s.group === 'apollo' ? 6 : 5)

export const formatLatLon = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(3)}° ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon).toFixed(3)}° ${lon < 0 ? 'O' : 'E'}`

// Vista del polo sur (atajo del panel): ahí están las regiones de Artemis III y el hielo en cráteres sin luz.
export const SOUTH_POLE_VIEW = { center: [-87, 0] as [number, number], zoom: 4 }
