import { MissionPanel } from '../surface/Missions'
import { focusMission } from '../surface/focusMission'
import type { Artifact } from '../abandoned/data/artifacts'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

  const [selected, setSelected] = useState<MoonSite | null>(null)
  const [compare, setCompare] = useState<MoonSite | null>(null)

  // /luna?sitio=<id>: entra con ese sitio ya elegido (lo usa el sistema solar). Sin el parámetro, nada cambia.
  const [params] = useSearchParams()
  const wanted = useRef(params.get('sitio'))
  const pendingFly = useRef<MoonSite | null>(null)

  // Sitios reales del backend (GET /moon/sites).
  const [sites, setSites] = useState<MoonSite[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    getMoonSites()
      .then((r) => {
        if (cancelled) return
        setSites(r.sites)
        setFailed(false)
        const site = wanted.current ? r.sites.find((s) => s.id === wanted.current) : undefined
        wanted.current = null
        if (site) {
          setSelected(site)
          pendingFly.current = site
        }
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [attempt])

  // Lleva el mapa al sitio pedido por URL en cuanto el mapa y los sitios están listos.
  useEffect(() => {
    const site = pendingFly.current
    if (!map || !site) return
    pendingFly.current = null
    map.setView([site.lat, site.lon], siteZoom(site))
  }, [map, sites])

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
        <h1 className="moonmap-title">Mapa de la Luna</h1>
        <p className="moonmap-lead">
          En el polo sur hay cráteres donde nunca llega el Sol y puede haber hielo. Artemis III quiere aterrizar
          cerca. Aquí puedes comparar esas regiones con los sitios Apollo: cuántas horas tienen Sol para la energía
          y cuántas ven la Tierra para comunicarse.
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
