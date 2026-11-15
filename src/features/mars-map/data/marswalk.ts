// Textos en español para la caminata de Jezero (GET /mars/marswalk). Los datos (posiciones, soles,
// alturas, pendientes) llegan del backend; aquí solo se traducen sus textos. Sin traducción, el original.
import type { MarsStop, MarsWalk } from '../../../api/types'
import type { Obstacle } from './obstacles'

export const SUMMARY_ES =
  'Jezero tuvo un lago hace ~3 500 millones de años, alimentado por un río que formó un delta. La caminata sigue al rover Perseverance de la NASA desde su sitio de aterrizaje, cruza el fondo del cráter hasta el frente del delta y un antiguo cauce de río, y se detiene donde el agua dejó su marca en las rocas.'

const STOP_ES: Record<string, { title?: string; date: string; why: string }> = {
  landing: {
    date: '18 feb 2021 (aterrizaje)',
    why: 'Sitio de aterrizaje en el fondo de un antiguo lago (Jezero, hace ~3 500 millones de años).',
  },
  rochette: {
    title: 'Rochette (fondo del cráter)',
    date: '6 sep 2021',
    why: 'Primer núcleo de roca: roca ígnea alterada por el agua después de formarse.',
  },
  wildcat_ridge: {
    title: 'Wildcat Ridge (frente del delta)',
    date: '27 jul 2022',
    why: 'Roca sedimentaria depositada donde un río entraba al lago; se detectaron moléculas orgánicas.',
  },
  cheyava_falls: {
    date: '21 jul 2024',
    why: 'Roca de un antiguo cauce de río con rasgos que la NASA llamó una posible biofirma.',
  },
}

const ROCK_ES: Record<string, string> = { Igneous: 'ígnea', Sedimentary: 'sedimentaria' }

export const stopEs = (s: MarsStop) => ({
  title: STOP_ES[s.id]?.title ?? s.title,
  date: STOP_ES[s.id]?.date ?? s.date,
  why: STOP_ES[s.id]?.why ?? s.why_water,
  rock: s.rock_type ? (ROCK_ES[s.rock_type] ?? s.rock_type) : null,
})

const TERRAIN_ES: Record<string, string> = {
  sand: 'Séítah («entre la arena» en navajo): ondulaciones y arena entre el sitio de aterrizaje y el delta; Perseverance la rodeó.',
  slopes_boulders: 'Frente del delta y borde del cráter: pendientes fuertes con bloques de roca (ver las pendientes medidas).',
  environment: 'Atmósfera delgada de CO₂, noches por debajo de −80 °C, tormentas de polvo y radiación en la superficie.',
}

export const terrainEs = (t: { type: string; text: string }) => TERRAIN_ES[t.type] ?? t.text

/** Margen de seguridad alrededor de cada pendiente fuerte medida (elección de la interfaz, no un dato). */
export const HAZARD_MARGIN_KM = 0.15

/** Pendientes fuertes de la ruta real como zonas a evitar al trazar una ruta propia. */
export const hazardZones = (w: MarsWalk): Obstacle[] =>
  w.hazards.steep_segments.map((h, i) => ({ id: `pendiente-${i}`, center: [h.lat, h.lon], radiusKm: HAZARD_MARGIN_KM }))
