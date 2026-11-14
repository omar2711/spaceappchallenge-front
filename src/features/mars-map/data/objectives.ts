// DATOS DE EJEMPLO: objetivos y descripciones de muestra.
// TODO: verificar las coordenadas (centro aproximado, lat/lon en grados, longitud en -180..180)
// y el zoom de cada lugar antes de usarlos en serio.
export type Objective = {
  id: string
  name: string
  place: string
  goal: string
  center: [number, number] // [lat, lon]
  zoom: number
}

export const objectives: Objective[] = [
  {
    id: 'gale',
    name: 'Monte Sharp',
    place: 'Cráter Gale',
    goal: 'Estudiar las capas de roca del Monte Sharp.',
    center: [-5.4, 137.8], // TODO verificar
    zoom: 6,
  },
  {
    id: 'valles',
    name: 'Valles Marineris',
    place: 'Valles Marineris',
    goal: 'Explorar el cañón y sus paredes.',
    center: [-14, -59], // TODO verificar
    zoom: 4,
  },
  {
    id: 'olympus',
    name: 'Olympus Mons',
    place: 'Olympus Mons',
    goal: 'Estudiar el volcán y su entorno.',
    center: [18.65, -133.8], // TODO verificar
    zoom: 5,
  },
]
