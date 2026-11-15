import type { SkyRequest } from '../../../api/sky'
import { FOV_DEFAULT_ARCMIN, parseDec, parseFov, parseRA } from './parseCoords'

// Estado compartible en la URL: ?ra=&dec=&fov= (siempre en grados decimales; fov en arcmin).
export type ParamsState =
  | { kind: 'none' }
  | { kind: 'invalid'; message: string }
  | { kind: 'ok'; request: SkyRequest }

const round5 = (n: number) => Number(n.toFixed(5))

export function requestFromParams(p: URLSearchParams): ParamsState {
  const raS = p.get('ra')
  const decS = p.get('dec')
  const fovS = p.get('fov')
  if (raS === null && decS === null && fovS === null) return { kind: 'none' }
  if (raS === null || decS === null) {
    return { kind: 'invalid', message: 'Al enlace le falta "ra" o "dec".' }
  }
  const ra = parseRA(raS)
  if (!ra.ok) return { kind: 'invalid', message: `Enlace con RA no válida: ${ra.error}` }
  const dec = parseDec(decS)
  if (!dec.ok) return { kind: 'invalid', message: `Enlace con Dec no válida: ${dec.error}` }
  const fov = fovS === null ? null : parseFov(fovS)
  if (fov && !fov.ok) return { kind: 'invalid', message: `Enlace con FOV no válido: ${fov.error}` }
  return {
    kind: 'ok',
    request: {
      raDeg: round5(ra.deg),
      decDeg: round5(dec.deg),
      fovArcmin: fov ? fov.deg : FOV_DEFAULT_ARCMIN,
    },
  }
}

export const paramsFromRequest = (r: SkyRequest) =>
  new URLSearchParams({
    ra: String(round5(r.raDeg)),
    dec: String(round5(r.decDeg)),
    fov: String(r.fovArcmin),
  })

export const requestKey = (r: SkyRequest) => `${r.raDeg}|${r.decDeg}|${r.fovArcmin}`
