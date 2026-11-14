import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import './mars-map.css'
import { marsLayers } from './data/layers'
import { obstacles } from './data/obstacles'
import type { Objective } from './data/objectives'
import { findBlockedSegments, routeDistanceKm, type LatLng } from './lib/route'
import MarsMapView from './components/MarsMapView'
import LayerPanel, { type LayerState } from './components/LayerPanel'
import ObjectivePanel from './components/ObjectivePanel'
import RoutePanel from './components/RoutePanel'
import SafetyPanel from './components/SafetyPanel'

export default function MarsMapFeature() {
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [layers, setLayers] = useState<Record<string, LayerState>>(() =>
    Object.fromEntries(
      marsLayers.map((l) => [l.id, { on: l.defaultOn, opacity: l.defaultOpacity }]),
    ),
  )
  const [objective, setObjective] = useState<Objective | null>(null)
  const [points, setPoints] = useState<LatLng[]>([])

  const blocked = useMemo(() => findBlockedSegments(points, obstacles), [points])
  const distanceKm = useMemo(() => routeDistanceKm(points), [points])
  const blockedSegments = new Set(blocked.map((b) => b.index)).size

  const addPoint = (p: LatLng) => setPoints((prev) => [...prev, p])
  const addCenterPoint = () => {
    if (map) addPoint([map.getCenter().lat, map.getCenter().lng])
  }
  const chooseObjective = (o: Objective | null) => {
    setObjective(o)
    if (o && map) map.flyTo(o.center, o.zoom)
  }

  return (
    <section className="marsmap">
      <header className="marsmap-intro">
        <small className="marsmap-eyebrow">
          DESAFÍO · INTERPLANETARY SURVIVAL GUIDE: MARTIAN MAP
        </small>
        <h1 className="marsmap-title">Mapa de Marte</h1>
        <p className="marsmap-lead">
          Un mapa para un astronauta en una misión de superficie, con varias capas de datos y una
          ruta segura.
        </p>
      </header>

      <div className="marsmap-body">
        <MarsMapView
          layers={layers}
          points={points}
          blocked={blocked}
          onMap={setMap}
          onAddPoint={addPoint}
        />
        <aside className="marsmap-side" aria-label="Controles del mapa">
          <ObjectivePanel selected={objective} onSelect={chooseObjective} />
          <LayerPanel
            state={layers}
            onChange={(id, patch) => setLayers((s) => ({ ...s, [id]: { ...s[id], ...patch } }))}
          />
          <RoutePanel
            points={points}
            distanceKm={distanceKm}
            blockedCount={blockedSegments}
            onAddCenter={addCenterPoint}
            onUndo={() => setPoints((p) => p.slice(0, -1))}
            onClear={() => setPoints([])}
          />
          <SafetyPanel />
        </aside>
      </div>
    </section>
  )
}
