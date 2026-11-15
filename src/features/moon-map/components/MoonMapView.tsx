import { useEffect } from 'react'
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
import { landingSites, type LandingSite } from '../data/sites'
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

type Props = {
  layers: Record<string, LayerState>
  selected: LandingSite | null
  onMap: (m: LeafletMap | null) => void
  onSelect: (site: LandingSite) => void
}

export default function MoonMapView({ layers, selected, onMap, onSelect }: Props) {
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
              />
            ),
        )}
        {landingSites.map((s) => (
          <CircleMarker
            key={s.id}
            center={s.center}
            radius={selected?.id === s.id ? 9 : 6}
            pathOptions={{
              className: selected?.id === s.id ? 'moonmap-site moonmap-site--selected' : 'moonmap-site',
            }}
            eventHandlers={{ click: () => onSelect(s) }}
          >
            <Tooltip>{s.name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <span className="moonmap-badge">DATOS DE EJEMPLO: sitios</span>
    </div>
  )
}
