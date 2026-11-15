export type SkyRequest = { raDeg: number; decDeg: number; fovArcmin: number }
export type SkyFrame = {
  id: string; epochUT: string; bandLabel: string; imageUrl: string
  saturated?: number; contamination?: number; targetPx?: number[]
}
export type Detector = {
  id: number; wavelength_um: number[]
  frames: { epoch: string; file: string; date_mid: string; saturated_exposures: number; flags_fraction: number; target_px: number[] }[]
}
export type Manifest = {
  name: string; fov_arcmin: number; image_size_px: number[]; pixel_scale_arcsec: number
  detectors: Detector[]; ref_coord: { ra_deg: number; dec_deg: number; source: string }
  source: { collections: string[]; generated_at: string }
}
export type Analysis = {
  difference_images: { detector: number; from: string; to: string; file: string; caveats: string[] }[]
  deep_images: { detector: number; file: string }[]
  light_curves: { detector: number; usable: boolean; units: string; per_epoch: { epoch: string; mjd: number; flux: number | null; err: number | null; lower_limit: boolean }[] }[]
  spectra: unknown[]
}
export type SkySeries = {
  request: SkyRequest; frames: SkyFrame[]; source: 'mock' | 'live'
  manifest: Manifest; directory: string; analysis: Analysis | null
}
export type SkyTarget = { id: string; name: string; ra: number; dec: number; fov: number; manifest: string }
const root = import.meta.env.BASE_URL + 'data/'
async function json<T>(path: string): Promise<T> {
  const res = await fetch(root + path)
  if (!res.ok) throw new Error('No se pudo cargar ' + path + ' (' + res.status + ').')
  return res.json()
}
export async function getSkyTargets(): Promise<SkyTarget[]> {
  const [main, custom] = await Promise.all([
    json<{ targets: { target_id: string; name: string; ra_deg: number; dec_deg: number; manifest: string }[] }>('targets/index.json'),
    json<{ presets: { id: string; name: string; ra: number; dec: number; fov_arcmin: number; manifest: string }[] }>('custom/presets.json'),
  ])
  return [
    ...main.targets.map(t => ({ id: t.target_id, name: t.name, ra: t.ra_deg, dec: t.dec_deg, fov: 3.998, manifest: 'targets/' + t.manifest })),
    ...custom.presets.map(t => ({ id: t.id, name: t.name, ra: t.ra, dec: t.dec, fov: t.fov_arcmin, manifest: t.manifest })),
  ]
}
export function detectorFrames(manifest: Manifest, directory: string, detector: number): SkyFrame[] {
  const band = manifest.detectors.find(d => d.id === detector)
  return (band?.frames ?? []).map(f => ({
    id: f.epoch, epochUT: f.date_mid, bandLabel: 'D' + detector + ' · ' + band!.wavelength_um.join('–') + ' µm',
    imageUrl: directory + f.file, saturated: f.saturated_exposures, contamination: f.flags_fraction, targetPx: f.target_px,
  })).sort((a, b) => a.epochUT.localeCompare(b.epochUT))
}
export async function getSkySeries(req: SkyRequest): Promise<SkySeries> {
  const targets = await getSkyTargets()
  const target = targets.find(t => Math.abs(t.ra - req.raDeg) < 0.00002 && Math.abs(t.dec - req.decDeg) < 0.00002 && Math.abs(t.fov - req.fovArcmin) < 0.01)
  if (!target) throw new Error('No hay una serie precalculada para estas coordenadas y campo de visión. Elige un objetivo del catálogo; puedes explorar cualquier coordenada en el mapa panorámico.')
  const manifest = await json<Manifest>(target.manifest)
  const path = target.manifest.replace('manifest.json', '')
  const directory = root + path
  const analysis = target.manifest.startsWith('targets/') ? await json<Analysis>(path + 'analysis.json').catch(() => null) : null
  return { request: req, source: 'live', manifest, directory, analysis, frames: detectorFrames(manifest, directory, 1) }
}
