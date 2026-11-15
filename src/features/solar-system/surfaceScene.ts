import * as T from 'three'
import type { MarsWalk, MoonSites } from '../../api/types'
import { artifacts } from '../abandoned/data/artifacts'
import { missionPositions } from '../surface/missionPositions'
import { historyEs } from '../moon-map/data/sites'
import { stopEs } from '../mars-map/data/marswalk'

export type SurfaceSite = {
  id: string; body: 'Marte' | 'Luna'; name: string; lat: number; lon: number
  story: string; source: string; kind: 'mission' | 'route'
}

// UV de SphereGeometry: meridiano cero en u=0.5 y longitud este creciente.
export function normalAt(lat: number, lon: number) {
  const phi = T.MathUtils.degToRad(lat), lambda = T.MathUtils.degToRad(lon)
  return new T.Vector3(Math.cos(phi)*Math.cos(lambda), Math.sin(phi), -Math.cos(phi)*Math.sin(lambda))
}

export function missionSites(): SurfaceSite[] {
  return artifacts.flatMap(item => {
    const coords = missionPositions[item.id]
    if (!coords || item.body === 'beyond') return []
    return [{id:item.id, body:item.body === 'moon' ? 'Luna' : 'Marte', name:item.name,
      lat:coords[0], lon:coords[1], kind:'mission', source:item.sourceUrl,
      story:[item.place, item.arrival, item.status, item.whatHappened, item.endDate].join(' · ')}]
  })
}

export function apolloSites(data: MoonSites): SurfaceSite[] {
  return data.sites.filter(s => s.group === 'apollo' && !['apollo12','apollo15'].includes(s.id)).map(s => ({
    id:s.id, body:'Luna', name:s.name, lat:s.lat, lon:s.lon, kind:'mission', source:s.source,
    story:[s.landing_date_utc,s.place,s.crew_on_surface,historyEs(s)].filter(Boolean).join(' · ')
  }))
}

export function roverSites(walk: MarsWalk): SurfaceSite[] {
  return walk.stops.map(s => ({id:s.id, body:'Marte', name:stopEs(s).title, lat:s.lat, lon:s.lon,
    kind:'route', source:walk.sources.waypoints, story:stopEs(s).date+' · '+stopEs(s).why}))
}

// Cada vértice está en el sistema local de la esfera, incluso con Marte lejos del origen.
export function roverPath(walk: MarsWalk, radius: number) {
  const positions = walk.route.points.map(p => normalAt(p.lat,p.lon).multiplyScalar(radius * 1.00005))
  return new T.Line(new T.BufferGeometry().setFromPoints(positions), new T.LineBasicMaterial({color:0xffaa55}))
}

