import { useEffect, useState } from 'react'
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
import type { MarsWalk } from '../../../api/types'
import type { Obstacle } from '../data/obstacles'
import { stopEs } from '../data/marswalk'
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
  walk: MarsWalk | null
  hazards: Obstacle[]
  activeStop: string | null
  onStop: (id: string) => void
  onMap: (m: LeafletMap | null) => void
  onAddPoint: (p: LatLng) => void
}

// react-leaflet aplica pathOptions con setStyle (sin className), así que los estilos van explícitos.
// Mismos valores que --mint, --mint-ink y --sun de styles/index.css.
const C = { route: '#c1ebdf', ink: '#11271f', perseverance: '#ffb36b', hazard: '#ff6b6b', blocked: '#ff6b6b' }

export default function MarsMapView({ layers, points, blocked, walk, hazards, activeStop, onStop, onMap, onAddPoint }: Props) {
  const blockedIdx = new Set(blocked.map((b) => b.index))
  const [tilesDown, setTilesDown] = useState(false)
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
                eventHandlers={{ tileerror: () => setTilesDown(true), tileload: () => setTilesDown(false) }}
              />
            ),
        )}
        {walk && (
          <Polyline
            positions={walk.route.points.map((p) => [p.lat, p.lon] as LatLng)}
            pathOptions={{ color: C.perseverance, weight: 3, opacity: 0.9 }}
          >
            <Tooltip sticky>
              Ruta real de Perseverance · {walk.route.length_km.toFixed(1)} km · soles {walk.route.sols[0]}–
              {walk.route.sols[1]}
            </Tooltip>
          </Polyline>
        )}
        {walk &&
          hazards.map((o, i) => (
            <Circle
              key={o.id}
              center={o.center}
              radius={marsKmToLeafletMeters(o.radiusKm)}
              pathOptions={{ color: C.hazard, fillColor: C.hazard, fillOpacity: 0.3, weight: 1.5 }}
            >
              <Tooltip>
                Pendiente fuerte: {Math.abs(walk.hazards.steep_segments[i].grade_percent).toFixed(1)} % en{' '}
                {walk.hazards.steep_segments[i].segment_m.toFixed(0)} m (sol {walk.hazards.steep_segments[i].sol})
              </Tooltip>
            </Circle>
          ))}
        {walk?.stops.map((s, i) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lon]}
            radius={activeStop === s.id ? 10 : 7}
            pathOptions={{
              color: activeStop === s.id ? '#ffffff' : C.ink,
              weight: activeStop === s.id ? 3 : 1.5,
              fillColor: C.perseverance,
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onStop(s.id) }}
            bubblingMouseEvents={false}
          >
            <Tooltip>
              {i + 1}. {stopEs(s).title}
            </Tooltip>
          </CircleMarker>
        ))}
        {points.slice(1).map((p, i) => (
          <Polyline
            key={i}
            positions={[points[i], p]}
            pathOptions={
              blockedIdx.has(i)
                ? { color: C.blocked, weight: 5, dashArray: '8 6' }
                : { color: C.route, weight: 3, dashArray: undefined }
            }
          />
        ))}
        {points.map((p, i) => (
          <CircleMarker
            key={i}
            center={p}
            radius={6}
            pathOptions={{ color: C.ink, weight: 1.5, fillColor: C.route, fillOpacity: 1 }}
            bubblingMouseEvents={false}
          >
            <Tooltip>
              {i === 0 ? 'Inicio' : i === points.length - 1 ? 'Destino' : `Punto ${i + 1}`}
            </Tooltip>
          </CircleMarker>
        ))}
        <ClickToAdd onAdd={onAddPoint} />
      </MapContainer>
      {tilesDown && (
        <p className="marsmap-badge marsmap-offline" role="status">
          Sin conexión con Mars Trek: el mapa base no carga. La ruta, las paradas y las pendientes sí (datos de la API).
        </p>
      )}
      <span className="marsmap-badge">
        <span className="marsmap-key marsmap-key--walk" /> Perseverance · <span className="marsmap-key marsmap-key--hazard" />{' '}
        pendiente &gt; {walk?.hazards.steep_threshold_percent ?? 15} % · <span className="marsmap-key" /> tu ruta
      </span>
    </div>
  )
}
