import TerrainPanel from './components/TerrainPanel'
import { MissionPanel } from '../surface/Missions'
import { focusMission } from '../surface/focusMission'
import type { Artifact } from '../abandoned/data/artifacts'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { latLngBounds, type Map as LeafletMap } from 'leaflet'
import { getMarsWalk } from '../../api/mars'
import type { MarsWalk } from '../../api/types'
import './mars-map.css'
import { marsLayers } from './data/layers'
import { hazardZones } from './data/marswalk'
import { findBlockedSegments, routeDistanceKm, type LatLng } from './lib/route'
import MarsMapView from './components/MarsMapView'
import LayerPanel, { type LayerState } from './components/LayerPanel'
import ObjectivePanel from './components/ObjectivePanel'
import RoutePanel from './components/RoutePanel'
import SafetyPanel from './components/SafetyPanel'
import WalkPanel from './components/WalkPanel'

export default function MarsMapFeature() {
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [mission, setMission] = useState<Artifact | null>(null)
  function chooseMission(item: Artifact) {
    setMission(item)
    focusMission(map, item)
  }
  const [layers, setLayers] = useState<Record<string, LayerState>>(() =>
    Object.fromEntries(
      marsLayers.map((l) => [l.id, { on: l.defaultOn, opacity: l.defaultOpacity }]),
    ),
  )
  const [points, setPoints] = useState<LatLng[]>([])

  // Caminata real de Jezero (GET /mars/marswalk): ruta, paradas y pendientes peligrosas.
  const [walk, setWalk] = useState<MarsWalk | null>(null)
  const [walkFailed, setWalkFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    getMarsWalk()
      .then((w) => !cancelled && (setWalk(w), setWalkFailed(false)))
      .catch(() => !cancelled && setWalkFailed(true))
    return () => {
      cancelled = true
    }
  }, [attempt])
  const [walkSelected, setWalkSelected] = useState(false)
  const [activeStop, setActiveStop] = useState<string | null>(null)

  const hazards = useMemo(() => (walk ? hazardZones(walk) : []), [walk])
  const blocked = useMemo(() => findBlockedSegments(points, hazards), [points, hazards])
  const distanceKm = useMemo(() => routeDistanceKm(points), [points])
  const blockedSegments = new Set(blocked.map((b) => b.index)).size

  const addPoint = (p: LatLng) => setPoints((prev) => [...prev, p])
  const addCenterPoint = () => {
    if (map) addPoint([map.getCenter().lat, map.getCenter().lng])
  }
  const showWalk = () => {
    if (!walk) return
    setWalkSelected(true)
    map?.flyToBounds(latLngBounds(walk.route.points.map((p) => [p.lat, p.lon] as LatLng)), {
      padding: [40, 40],
      maxZoom: 12,
    })
  }
  const chooseStop = (id: string) => {
    const s = walk?.stops.find((x) => x.id === id)
    if (!s) return
    setActiveStop(id)
    setWalkSelected(true)
    map?.flyTo([s.lat, s.lon], 12)
  }

  return (
    <section className="marsmap">
      <header className="marsmap-intro">
        <h1 className="marsmap-title">Mapa de Marte</h1>
        <p className="marsmap-lead">
          El cráter Jezero fue un lago. Perseverance lleva años recorriéndolo y aquí está su camino real, con las
          paradas donde encontró rastros de agua y las pendientes que un astronauta tendría que evitar.
        </p>
      </header>

      <div className="marsmap-body">
        <MarsMapView
          mission={mission}
          onMission={chooseMission}
          layers={layers}
          points={points}
          blocked={blocked}
          walk={walk}
          hazards={hazards}
          activeStop={activeStop}
          onStop={chooseStop}
          onMap={setMap}
          onAddPoint={addPoint}
        />
        <aside className="marsmap-side" aria-label="Controles del mapa">
          <MissionPanel body="mars" selected={mission} onSelect={chooseMission} />
          {walk && <TerrainPanel walk={walk} onStop={chooseStop} />}
          <ObjectivePanel
            walk={walk}
            walkSelected={walkSelected}
            onWalk={showWalk}
          />
          <WalkPanel
            walk={walk}
            failed={walkFailed}
            onRetry={() => setAttempt((n) => n + 1)}
            activeStop={activeStop}
            onStop={chooseStop}
            onShowWalk={showWalk}
          />
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
          <SafetyPanel walk={walk} />
        </aside>
      </div>
    </section>
  )
}
