// Capas verificadas con curl (200 + CORS *) y con su WMTSCapabilities.xml.
export type LayerKind = 'optical' | 'topographic' | 'thermal'

export type MarsLayer = {
  id: string // identificador de capa en NASA/JPL Mars Trek
  title: string
  kind: LayerKind
  ext: 'jpg' | 'png'
  maxNativeZoom: number
  bounds?: [[number, number], [number, number]]
  defaultOn: boolean
  defaultOpacity: number
}

export const KIND_LABEL: Record<LayerKind, string> = {
  optical: 'imagen óptica',
  topographic: 'relieve',
  thermal: 'temperatura',
}

// 12 permite ver la caminata de Jezero (~27 km); por encima de maxNativeZoom las teselas se amplían.
export const MAX_ZOOM = 12
const TILE_BASE = 'https://trek.nasa.gov/tiles/Mars/EQ'

// Leaflet {y} = fila contando desde arriba (CRS.EPSG4326): coincide con TileRow de WMTS.
export const tileUrl = (l: MarsLayer) =>
  `${TILE_BASE}/${l.id}/1.0.0/default/default028mm/{z}/{y}/{x}.${l.ext}`

// El orden de este arreglo define el apilado: la primera capa queda debajo.
export const marsLayers: MarsLayer[] = [
  {
    id: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    title: 'Viking · mosaico global en color',
    kind: 'optical',
    ext: 'jpg',
    maxNativeZoom: 7,
    defaultOn: true,
    defaultOpacity: 1,
  },
  {
    id: 'Mars_MGS_MOLA_ClrShade_merge_global_463m',
    title: 'MOLA · relieve sombreado en color',
    kind: 'topographic',
    ext: 'jpg',
    maxNativeZoom: 7,
    defaultOn: false,
    defaultOpacity: 0.6,
  },
  {
    // Solo cubre entre 65°N y 65°S.
    id: 'THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018',
    title: 'THEMIS · infrarrojo térmico de día',
    kind: 'thermal',
    ext: 'png',
    maxNativeZoom: 9,
    bounds: [[-65, -180], [65, 180]],
    defaultOn: false,
    defaultOpacity: 0.6,
  },
  {
    // De noche, lo cálido es roca expuesta (alta inercia térmica) y lo frío, polvo o arena fina.
    // Verificada por el backend (GET /mars/marswalk, layers[].verified) y con curl: 200 image/png.
    id: 'THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018',
    title: 'THEMIS · infrarrojo térmico de noche (lo cálido es roca)',
    kind: 'thermal',
    ext: 'png',
    maxNativeZoom: 9,
    bounds: [[-65, -180], [65, 180]],
    defaultOn: false,
    defaultOpacity: 0.6,
  },
]
