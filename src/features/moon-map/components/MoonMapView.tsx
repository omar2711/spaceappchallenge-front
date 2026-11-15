import { useEffect, useState } from 'react'
import { CRS, type Map as LeafletMap } from 'leaflet'
import {
  AttributionControl,
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { MAX_ZOOM, moonLayers, tileUrl } from '../data/layers'
import type { MoonSite } from '../../../api/types'
import type { LayerState } from './LayerPanel'

// Con CRS.EPSG4326 el mundo mide 512 x 256 px en zoom 0 y se duplica en cada zoom.
// Fija como zoom mínimo el menor entero con el que el mundo llena el contenedor
// y lo recalcula cuando cambia el tamaño. (Copia del mapa de Marte: no se exporta
// de allí para no editar /marte.)
function FitMinZoom() {
  const map = useMap()
  useEffect(() => {
    const update = () => {
      const { x, y } = map.getSize()
      if (!x || !y) return
      const z = Math.min(MAX_ZOOM, Math.max(0, Math.ceil(Math.log2(Math.max(x / 512, y / 256)))))
      map.setMinZoom(z)
      if (map.getZoom() < z) map.setZoom(z)
    }
    update()
    map.on('resize', update)
    return () => {
      map.off('resize', update)
    }
  }, [map])
  return null
}

// Apollo en gris claro y Artemis III en el acento (--accent); el borde usa --bg.
const SITE_COLORS = { apollo: '#d0d0d0', artemis: '#ffb36b', selected: '#ffffff', outline: '#0a0a0a' }

type Props = {
  layers: Record<string, LayerState>
  sites: MoonSite[]
  selected: MoonSite | null
  compare: MoonSite | null
  onMap: (m: LeafletMap | null) => void
  onSelect: (site: MoonSite) => void
}

export default function MoonMapView({ layers, sites, selected, compare, onMap, onSelect }: Props) {
  const [tilesDown, setTilesDown] = useState(false)
  return (
    <div className="moonmap-mapwrap">
      <MapContainer
        ref={onMap}
        className="moonmap-map"
        crs={CRS.EPSG4326}
        center={[0, 0]}
        zoom={1}
        minZoom={0}
        maxZoom={MAX_ZOOM}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1}
        attributionControl={false}
      >
        <AttributionControl
          prefix={'<a href="https://trek.nasa.gov/moon/">Mapas: NASA/JPL Moon Trek</a> · <a href="https://leafletjs.com">Leaflet</a>'}
        />
        <FitMinZoom />
        {/* zIndex = posición en moonLayers (no en las activas): WAC < LOLA siempre. */}
        {moonLayers.map(
          (l, i) =>
            layers[l.id].on && (
              <TileLayer
                key={l.id}
                url={tileUrl(l)}
                zIndex={i + 1}
                opacity={layers[l.id].opacity}
                maxNativeZoom={l.maxNativeZoom}
                maxZoom={MAX_ZOOM}
                noWrap
                eventHandlers={{ tileerror: () => setTilesDown(true), tileload: () => setTilesDown(false) }}
              />
            ),
        )}
        {sites.map((s) => {
          const fill = s.group === 'apollo' ? SITE_COLORS.apollo : SITE_COLORS.artemis
          const isSel = selected?.id === s.id
          const isCmp = compare?.id === s.id
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lon]}
              radius={isSel || isCmp ? 9 : 6}
              // react-leaflet aplica pathOptions con setStyle (sin className): por eso colores explícitos.
              pathOptions={{
                color: isSel ? SITE_COLORS.selected : isCmp ? SITE_COLORS.artemis : SITE_COLORS.outline,
                weight: isSel || isCmp ? 3 : 1.5,
                fillColor: fill,
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => onSelect(s) }}
            >
              <Tooltip>{s.name}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
      {tilesDown && (
        <p className="moonmap-badge moonmap-offline" role="status">
          Sin conexión con Moon Trek, así que no se ve el mapa de fondo. Los sitios y los cálculos de Sol y Tierra funcionan igual.
        </p>
      )}
      <span className="moonmap-badge">
        <span className="moonmap-dot moonmap-dot--apollo" /> Apollo · <span className="moonmap-dot moonmap-dot--artemis" />{' '}
        Artemis III
      </span>
    </div>
  )
}
