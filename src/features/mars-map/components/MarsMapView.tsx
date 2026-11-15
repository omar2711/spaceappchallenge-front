import { useEffect } from 'react'
import { CRS, type Map as LeafletMap } from 'leaflet'
import {
  AttributionControl,
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { MAX_ZOOM, marsLayers, tileUrl } from '../data/layers'
import { OBSTACLES_LABEL, obstacles } from '../data/obstacles'
import { marsKmToLeafletMeters, type BlockedSegment, type LatLng } from '../lib/route'
import type { LayerState } from './LayerPanel'

function ClickToAdd({ onAdd }: { onAdd: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onAdd([e.latlng.lat, e.latlng.lng]) })
  return null
}

// Con CRS.EPSG4326 el mundo mide 512 x 256 px en zoom 0 y se duplica en cada zoom.
// Fija como zoom mínimo el menor entero con el que el mundo llena el contenedor
// (zoomSnap por defecto = 1) y lo recalcula cuando cambia el tamaño.
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
  points: LatLng[]
  blocked: BlockedSegment[]
  onMap: (m: LeafletMap | null) => void
  onAddPoint: (p: LatLng) => void
}

export default function MarsMapView({ layers, points, blocked, onMap, onAddPoint }: Props) {
  const blockedIdx = new Set(blocked.map((b) => b.index))
  return (
    <div className="marsmap-mapwrap">
      <MapContainer
        ref={onMap}
        className="marsmap-map"
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
          prefix={'<a href="https://trek.nasa.gov/mars/">Mapas: NASA/JPL Mars Trek</a> · <a href="https://leafletjs.com">Leaflet</a>'}
        />
        <FitMinZoom />
        {/* zIndex = posición en marsLayers (no en las activas): Viking < MOLA < THEMIS siempre. */}
        {marsLayers.map(
          (l, i) =>
            layers[l.id].on && (
              <TileLayer
                key={l.id}
                url={tileUrl(l)}
                zIndex={i + 1}
                opacity={layers[l.id].opacity}
                maxNativeZoom={l.maxNativeZoom}
                maxZoom={MAX_ZOOM}
                bounds={l.bounds}
                noWrap
              />
            ),
        )}
        {obstacles.map((o) => (
          <Circle
            key={o.id}
            center={o.center}
            radius={marsKmToLeafletMeters(o.radiusKm)}
            pathOptions={{ className: 'marsmap-obstacle' }}
          >
            <Tooltip>{OBSTACLES_LABEL}</Tooltip>
          </Circle>
        ))}
        {points.slice(1).map((p, i) => (
          <Polyline
            key={i}
            positions={[points[i], p]}
            pathOptions={{
              className: blockedIdx.has(i) ? 'marsmap-route marsmap-route--blocked' : 'marsmap-route',
            }}
          />
        ))}
        {points.map((p, i) => (
          <CircleMarker key={i} center={p} radius={6} pathOptions={{ className: 'marsmap-waypoint' }}>
            <Tooltip>
              {i === 0 ? 'Inicio' : i === points.length - 1 ? 'Destino' : `Punto ${i + 1}`}
            </Tooltip>
          </CircleMarker>
        ))}
        <ClickToAdd onAdd={onAddPoint} />
      </MapContainer>
      <span className="marsmap-badge">{OBSTACLES_LABEL}</span>
    </div>
  )
}
