import { useEffect, useRef, useState } from 'react'
import type { SkyRequest } from '../../../api/sky'

const HIPS = 'https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube'
type Layer = { setSliceNumber: (n: number) => void }
type Atlas = {
  gotoRaDec: (ra: number, dec: number) => void
  newImageSurvey: (url: string, options?: object) => Layer
  setImageLayer: (layer: Layer) => void
}
type AladinAPI = { init: Promise<void>; aladin: (element: HTMLElement, options: object) => Atlas }
let loader: Promise<AladinAPI> | undefined
function loadAtlas() {
  if (!loader) loader = new Promise<AladinAPI>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js'
    script.onload = () => {
      const api = (window as unknown as { A: AladinAPI }).A
      if (!api) { reject(new Error('Aladin no disponible')); return }
      api.init.then(() => resolve(api), reject)
    }
    script.onerror = () => reject(new Error('No se pudo descargar Aladin'))
    document.head.appendChild(script)
  }).catch(error => { loader = undefined; throw error })
  return loader
}

export default function SkyPanorama({ request }: { request: SkyRequest | null }) {
  const host = useRef<HTMLDivElement>(null)
  const atlas = useRef<Atlas | null>(null)
  const layer = useRef<Layer | null>(null)
  const [status, setStatus] = useState('Cargando mapa del cielo…')
  const [retry, setRetry] = useState(0)
  const [slice, setSlice] = useState(62)
  const [wavelengths, setWavelengths] = useState<number[]>([])
  useEffect(() => {
    const controller = new AbortController()
    fetch(HIPS + '/properties', { signal: controller.signal }).then(r => {
      if (!r.ok) throw new Error('Metadatos no disponibles')
      return r.text()
    }).then(text => {
      const values = text.split('\n').find(l => l.trim().startsWith('data_cube_crval3_arr'))?.split('=')[1]
      if (values) setWavelengths(values.trim().split(/\s+/).map(Number))
    }).catch(() => {})
    return () => controller.abort()
  }, [])
  useEffect(() => {
    let active = true
    const element = host.current
    const timer = window.setTimeout(() => { if (active) setStatus('El mapa está tardando en responder. Puedes continuar con las observaciones precalculadas.') }, 20000)
    loadAtlas().then(A => {
      if (!active || !element) return
      const viewer = A.aladin(element, {
        survey: HIPS, target: '83.82 -5.39', fov: 12,
        showCooGridControl: true, showFullscreenControl: true,
      })
      atlas.current = viewer
      const survey = viewer.newImageSurvey(HIPS)
      survey.setSliceNumber(62)
      viewer.setImageLayer(survey)
      layer.current = survey
      setStatus('')
      window.clearTimeout(timer)
    }).catch(() => { if (active) setStatus('No se pudo abrir el mapa. Revisa la conexión o abre el visor oficial de IRSA.') })
    return () => {
      active = false
      window.clearTimeout(timer)
      atlas.current = null
      layer.current = null
      element?.replaceChildren()
    }
  }, [retry])
  useEffect(() => {
    if (request) atlas.current?.gotoRaDec(request.raDeg, request.decDeg)
  }, [request, status])
  useEffect(() => { layer.current?.setSliceNumber(slice) }, [slice, status])
  const changeSlice = (value: number) => {
    setSlice(value)
    layer.current?.setSliceNumber(value)
  }
  return <section className="skyviewer-panel skyviewer-panorama">
    <div className="skyviewer-panorama-heading">
      <div><h2>Explora la ruta del agua</h2><p className="skyviewer-note">Arrastra el cielo y acerca regiones de formación estelar. Mosaico infrarrojo SPHEREx · IRSA.</p></div>
      <a href="https://irsa.ipac.caltech.edu/irsaviewer/" target="_blank" rel="noreferrer">Visor oficial ↗</a>
    </div>
    <div ref={host} className="skyviewer-atlas" aria-label="Mapa panorámico infrarrojo SPHEREx" />
    {status && <p role="status" className="skyviewer-note">{status} <button className="skyviewer-btn" onClick={() => { setStatus('Cargando mapa…'); setRetry(n => n + 1) }}>Reintentar mapa</button></p>}
    <label className="skyviewer-field">
      <span>Canal espectral {slice + 1}/102 {Number.isFinite(wavelengths[slice]) && ' · ' + wavelengths[slice].toFixed(3) + ' µm'}</span>
      <input type="range" min="0" max="101" value={slice} aria-label="Canal espectral del mosaico" onChange={e => changeSlice(Number(e.target.value))} />
    </label>
    <p className="skyviewer-note">{slice === 50 || slice === 51 ? 'Este canal está vacío en el mosaico publicado por IRSA. Selecciona otro.' : 'Cada canal muestra una longitud de onda distinta. Este mosaico combina observaciones; no representa una fecha individual.'}</p>
    <p className="skyviewer-note">Agua helada: banda de referencia alrededor de 3,0 µm. CO₂: 4,27 µm. CO: 4,67 µm. Estas referencias orientan la exploración; una imagen por sí sola no confirma ninguna molécula.</p>
  </section>
}
