// Capas de NASA/JPL Moon Trek, comprobadas con curl: responden 200 y envían
// Access-Control-Allow-Origin: * (el navegador puede pedirlas sin clave de API).
// Mismo esquema WMTS que las capas de Marte, por eso /luna reutiliza la forma de /marte.
export type LayerKind = 'optical' | 'topographic'

export type MoonLayer = {
  id: string // identificador de capa en NASA/JPL Moon Trek
  title: string
  kind: LayerKind
  ext: 'jpg' | 'png'
  maxNativeZoom: number
  defaultOn: boolean
  defaultOpacity: number
}

export const KIND_LABEL: Record<LayerKind, string> = {
  optical: 'ÓPTICA',
  topographic: 'TOPOGRÁFICA',
}

// Zoom máximo del mapa: el de la capa más detallada (WAC = 8). Por encima de
// maxNativeZoom Leaflet reescala la tesela en vez de pedir una que no existe.
export const MAX_ZOOM = 8
const TILE_BASE = 'https://trek.nasa.gov/tiles/Moon/EQ'

// Leaflet {y} = fila contando desde arriba (CRS.EPSG4326): coincide con TileRow de WMTS.
export const tileUrl = (l: MoonLayer) =>
  `${TILE_BASE}/${l.id}/1.0.0/default/default028mm/{z}/{y}/{x}.${l.ext}`

// El orden de este arreglo define el apilado: la primera capa queda debajo.
export const moonLayers: MoonLayer[] = [
  {
    id: 'LRO_WAC_Mosaic_Global_303ppd_v02',
    title: 'LRO WAC · mosaico global',
    kind: 'optical',
    ext: 'jpg',
    maxNativeZoom: 8,
    defaultOn: true,
    defaultOpacity: 1,
  },
  {
    // Esta capa solo existe en PNG: con .jpg el servidor responde 404.
    id: 'LRO_LOLA_ClrShade_Global_128ppd_v04',
    title: 'LOLA · relieve sombreado en color',
    kind: 'topographic',
    ext: 'png',
    maxNativeZoom: 5,
    defaultOn: false,
    defaultOpacity: 0.6,
  },
]
