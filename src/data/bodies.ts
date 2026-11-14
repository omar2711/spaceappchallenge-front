import type positions from '../positions.json'

// Los nombres de los cuerpos salen de positions.json (efemérides de JPL Horizons):
// así el catálogo no puede declarar un cuerpo del que no tengamos posición.
export type Body = keyof typeof positions
export type View = Body | 'Sistema solar' | 'Vuelo libre'

// [nombre, radio medio en km, color de respaldo mientras carga la textura]
export const catalog: [Body, number, string][] = [
  ['Sol', 695700, '#ffda88'], ['Mercurio', 2439.4, '#bcb4ab'], ['Venus', 6051.8, '#e8ce9d'],
  ['Tierra', 6371, '#86c4ed'], ['Luna', 1737.4, '#cecac6'], ['Marte', 3389.5, '#cf8667'],
  ['Júpiter', 69911, '#d6ba98'], ['Saturno', 58232, '#decfa3'], ['Urano', 25362, '#9fdbe0'], ['Neptuno', 24622, '#779cd7'],
]

// Texturas de 2k que cargan al abrir: pesan poco y la escena aparece rápido.
export const textures: Record<Body, string> = {
  Sol: '2k_sun', Mercurio: '2k_mercury', Venus: '2k_venus_atmosphere', Tierra: 'tierra',
  Luna: 'luna', Marte: 'marte', Júpiter: '2k_jupiter', Saturno: '2k_saturn', Urano: '2k_uranus', Neptuno: '2k_neptune',
}

// Texturas de 8k solo para los cuerpos a los que el usuario se acerca de verdad;
// se piden bajo demanda para no cargar decenas de MB en la primera visita.
export const detailFiles: Partial<Record<Body, string>> = { Tierra: '8k_earth_daymap', Marte: '8k_mars' }

// Mundos con página propia (/body/:id). Una sola fuente para la barra superior,
// las tarjetas de la landing y el panel del visor: añadir un mundo es una línea.
export const worlds = {
  moon: { name: 'Luna', path: '/body/moon' },
  mars: { name: 'Marte', path: '/body/mars' },
} as const
export type WorldId = keyof typeof worlds
export const isWorldId = (id: string | undefined): id is WorldId => id !== undefined && Object.hasOwn(worlds, id) // hasOwn: "toString" no debe contar como mundo

// Datos clave del panel que se abre al tocar un cuerpo. Solo Luna y Marte: son
// los dos mundos con página propia. Se guardan aquí (y no dentro del componente)
// para que quien redacte contenido edite datos, no JSX. Los valores son texto
// ya formateado a propósito: incluyen unidades y aclaraciones ("≈1/6 de la Tierra").
export type BodyFacts = {
  facts: { label: string; value: string }[]
  water: string
  world: WorldId
  cta: string
}
export const bodyFacts: Partial<Record<Body, BodyFacts>> = {
  Luna: {
    facts: [
      { label: 'Diámetro', value: '3,474 km' },
      { label: 'Gravedad', value: '1.62 m/s² (≈1/6 de la Tierra)' },
      { label: 'Ciclo día-noche', value: '≈29.5 días terrestres' },
      { label: 'Distancia media a la Tierra', value: '384,400 km' },
    ],
    water: 'Hielo en cráteres del polo sur que nunca reciben luz solar.',
    world: 'moon',
    cta: 'Explorar la Luna',
  },
  Marte: {
    facts: [
      { label: 'Diámetro', value: '6,779 km' },
      { label: 'Gravedad', value: '3.71 m/s²' },
      { label: 'Día marciano', value: '≈24 h 39 min' },
      { label: 'Cráter Jezero', value: '≈45 km de ancho' },
    ],
    water: 'Depósitos de un delta donde un río desembocaba en un lago.',
    world: 'mars',
    cta: 'Explorar Marte',
  },
}

// Formato numérico en es-BO, sin decimales (km).
export const format = (n: number) => n.toLocaleString('es-BO', { maximumFractionDigits: 0 })
