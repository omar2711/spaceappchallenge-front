import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import './moon-map.css'
import { moonLayers } from './data/layers'
import { SOUTH_POLE_VIEW, type LandingSite } from './data/sites'
import MoonMapView from './components/MoonMapView'
import LayerPanel, { type LayerState } from './components/LayerPanel'
import SitePanel from './components/SitePanel'

export default function MoonMapFeature() {
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [layers, setLayers] = useState<Record<string, LayerState>>(() =>
    Object.fromEntries(
      moonLayers.map((l) => [l.id, { on: l.defaultOn, opacity: l.defaultOpacity }]),
    ),
  )
  const [selected, setSelected] = useState<LandingSite | null>(null)

  // Elegir un sitio (desde la lista o tocando su marcador) lo selecciona y
  // mueve el mapa: así lista y mapa nunca muestran cosas distintas.
  const chooseSite = (site: LandingSite) => {
    setSelected(site)
    map?.flyTo(site.center, site.zoom)
  }
  const goSouthPole = () => {
    setSelected(null)
    map?.flyTo(SOUTH_POLE_VIEW.center, SOUTH_POLE_VIEW.zoom)
  }

  return (
    <section className="moonmap">
      <header className="moonmap-intro">
        <small className="moonmap-eyebrow">DESAFÍO · LUNAR LANDING SITE NAVIGATOR</small>
        <h1 className="moonmap-title">Mapa de la Luna</h1>
        <p className="moonmap-lead">
          Un mapa para elegir dónde aterrizar siguiendo el agua: hielo en los cráteres del polo sur
          que nunca reciben luz solar.
        </p>
      </header>

      <div className="moonmap-body">
        <MoonMapView layers={layers} selected={selected} onMap={setMap} onSelect={chooseSite} />
        <aside className="moonmap-side" aria-label="Controles del mapa">
          <SitePanel selected={selected} onSelect={chooseSite} onSouthPole={goSouthPole} />
          <LayerPanel
            state={layers}
            onChange={(id, patch) => setLayers((s) => ({ ...s, [id]: { ...s[id], ...patch } }))}
          />
        </aside>
      </div>
    </section>
  )
}
