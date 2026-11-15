import { focusMission, MissionPanel } from '../surface/Missions'
import type { Artifact } from '../abandoned/data/artifacts'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { getMoonSites } from '../../api/moon'
import type { MoonSite } from '../../api/types'
import './moon-map.css'
import { moonLayers } from './data/layers'
import { SOUTH_POLE_VIEW, siteZoom } from './data/sites'
import MoonMapView from './components/MoonMapView'
import LayerPanel, { type LayerState } from './components/LayerPanel'
import SitePanel from './components/SitePanel'
import SunEarthPanel from './components/SunEarthPanel'

export default function MoonMapFeature() {
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [mission, setMission] = useState<Artifact | null>(null)
  function chooseMission(item: Artifact) {
    setMission(item)
    focusMission(map, item)
  }
  const [layers, setLayers] = useState<Record<string, LayerState>>(() =>
    Object.fromEntries(
      moonLayers.map((l) => [l.id, { on: l.defaultOn, opacity: l.defaultOpacity }]),
    ),
  )

  // Sitios reales del backend (GET /moon/sites).
  const [sites, setSites] = useState<MoonSite[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    getMoonSites()
      .then((r) => !cancelled && (setSites(r.sites), setFailed(false)))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [attempt])

  const [selected, setSelected] = useState<MoonSite | null>(null)
  const [compare, setCompare] = useState<MoonSite | null>(null)

  // Elegir un sitio (desde la lista o tocando su marcador) lo selecciona y
  // mueve el mapa: así lista y mapa nunca muestran cosas distintas.
  const chooseSite = (site: MoonSite) => {
    setSelected(site)
    if (compare?.id === site.id) setCompare(null)
    map?.flyTo([site.lat, site.lon], siteZoom(site))
  }
  const goSouthPole = () => {
    setSelected(null)
    setCompare(null)
    map?.flyTo(SOUTH_POLE_VIEW.center, SOUTH_POLE_VIEW.zoom)
  }

  return (
    <section className="moonmap">
      <header className="moonmap-intro">
        <small className="moonmap-eyebrow">DESAFÍO · LUNAR LANDING SITE NAVIGATOR</small>
        <h1 className="moonmap-title">Mapa de la Luna</h1>
        <p className="moonmap-lead">
          Un mapa para elegir dónde aterrizar siguiendo el agua: hielo en los cráteres del polo sur
          que nunca reciben luz solar. Compara las regiones candidatas de Artemis III con los sitios
          Apollo: cuántas horas de Sol (energía) y de Tierra a la vista (comunicación) tiene cada una.
        </p>
      </header>

      <div className="moonmap-body">
        <MoonMapView
          mission={mission}
          onMission={chooseMission}
          layers={layers}
          sites={sites ?? []}
          selected={selected}
          compare={compare}
          onMap={setMap}
          onSelect={chooseSite}
        />
        <aside className="moonmap-side" aria-label="Controles del mapa">
          <SitePanel
            sites={sites}
            failed={failed}
            onRetry={() => setAttempt((n) => n + 1)}
            selected={selected}
            onSelect={chooseSite}
            onSouthPole={goSouthPole}
          />
          <MissionPanel body="moon" selected={mission} onSelect={chooseMission} />
          <LayerPanel
            state={layers}
            onChange={(id, patch) => setLayers((s) => ({ ...s, [id]: { ...s[id], ...patch } }))}
          />
        </aside>
      </div>

      {sites && <SunEarthPanel sites={sites} selected={selected} compare={compare} onCompare={setCompare} />}
    </section>
  )
}
