import type { Map as LeafletMap } from 'leaflet'
import type { Artifact } from '../abandoned/data/artifacts'
import { missionPositions } from './missionPositions'

/** Centra el mapa en el lugar de aterrizaje de una misión, si hay coordenadas. */
export function focusMission(map: LeafletMap | null, item: Artifact) {
  const position = missionPositions[item.id]
  if (position) map?.flyTo(position, 8)
}
