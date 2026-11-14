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

// Formato numérico en es-BO, sin decimales (km).
export const format = (n: number) => n.toLocaleString('es-BO', { maximumFractionDigits: 0 })
