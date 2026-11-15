// DATOS DE EJEMPLO: sitios de muestra para construir y probar la interfaz.
// PUNTO DE REEMPLAZO: el equipo de datos sustituye este arreglo por los sitios
// reales (o lo alimenta desde su fuente); mientras mantenga la forma de
// `LandingSite`, ninguna pantalla necesita cambios.
// TODO: verificar nombres, coordenadas y datos de cada sitio antes de usarlos en serio.
export type LandingSite = {
  id: string
  name: string
  region: string
  center: [number, number] // [lat, lon] en grados; longitud en -180..180
  zoom: number
  water: string // qué se sabe del agua/hielo en el sitio
  slope: string // pendiente del terreno
  light: string // iluminación solar
}

// Lo que aún no tenemos como dato va como [por definir]: no se inventan cifras.
const TBD = '[por definir]'

export const landingSites: LandingSite[] = [
  {
    id: 'shackleton',
    name: 'Cráter Shackleton',
    region: 'Polo sur',
    center: [-89.9, 0], // TODO verificar
    zoom: 5,
    water: 'Cráter del polo sur con zonas que nunca reciben luz solar.',
    slope: TBD,
    light: TBD,
  },
  {
    id: 'cabeus',
    name: 'Cráter Cabeus',
    region: 'Polo sur',
    center: [-84.9, -35.5], // TODO verificar
    zoom: 5,
    water: 'Cráter del polo sur con zonas que nunca reciben luz solar.',
    slope: TBD,
    light: TBD,
  },
  {
    id: 'shoemaker',
    name: 'Cráter Shoemaker',
    region: 'Polo sur',
    center: [-88.1, 44.9], // TODO verificar
    zoom: 5,
    water: 'Cráter del polo sur con zonas que nunca reciben luz solar.',
    slope: TBD,
    light: TBD,
  },
  {
    id: 'faustini',
    name: 'Cráter Faustini',
    region: 'Polo sur',
    center: [-87.3, 77], // TODO verificar
    zoom: 5,
    water: 'Cráter del polo sur con zonas que nunca reciben luz solar.',
    slope: TBD,
    light: TBD,
  },
]

// Vista del polo sur (atajo del panel): ahí está el hielo en cráteres sin luz.
export const SOUTH_POLE_VIEW = { center: [-87, 0] as [number, number], zoom: 4 }
