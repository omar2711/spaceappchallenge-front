import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getSkySeries, detectorFrames, type SkyTarget, type SkyRequest, type SkySeries } from '../../api/sky'
import './sky-viewer.css'
import CoordForm, { type FormValues } from './components/CoordForm'
import FramePlayer from './components/FramePlayer'
import PresetList from './components/PresetList'
import ViewModeBar, { type ViewMode } from './components/ViewModeBar'
import SkyPanorama from './components/SkyPanorama'
import SciencePanel from './components/SciencePanel'
import { FOV_DEFAULT_ARCMIN } from './lib/parseCoords'
import { paramsFromRequest, requestFromParams, requestKey, type ParamsState } from './lib/skyParams'

type Result = { key: string; series?: SkySeries; failed?: string }

const formFromUrl = (s: ParamsState): FormValues =>
  s.kind === 'ok'
    ? { ra: String(s.request.raDeg), dec: String(s.request.decDeg), fov: String(s.request.fovArcmin) }
    : { ra: '', dec: '', fov: String(FOV_DEFAULT_ARCMIN) }

export default function SkyViewerFeature() {
  const [params, setParams] = useSearchParams()
  const fromUrl = useMemo(() => requestFromParams(params), [params])
  const urlKey = fromUrl.kind === 'ok' ? requestKey(fromUrl.request) : ''

  // El formulario conserva lo que escribe la persona; solo se reescribe cuando la URL cambia
  // por fuera (por ejemplo, con atrás/adelante del navegador).
  const [form, setForm] = useState<FormValues>(() => formFromUrl(fromUrl))
  const [syncedKey, setSyncedKey] = useState(urlKey)
  if (syncedKey !== urlKey) {
    setSyncedKey(urlKey)
    if (fromUrl.kind === 'ok') setForm(formFromUrl(fromUrl))
  }

  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const queryKey = fromUrl.kind === 'ok' ? `${urlKey}#${attempt}` : ''

  // Consulta: se repite cuando cambia la solicitud o se pide reintentar (queryKey incluye el intento).
  const request = fromUrl.kind === 'ok' ? fromUrl.request : null
  useEffect(() => {
    if (!request) return
    let cancelled = false
    getSkySeries(request)
      .then((series) => {
        if (!cancelled) setResult({ key: queryKey, series })
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ key: queryKey, failed: error instanceof Error ? error.message : 'No se pudieron cargar las imágenes.' })
      })
    return () => {
      cancelled = true
    }
  }, [request, queryKey])

  const [detector, setDetector] = useState(1)
  const [mode, setMode] = useState<ViewMode>('normal')
  const [blink, setBlink] = useState({ a: 0, b: 1 })

  const handleSubmit = (req: SkyRequest) => {
    const next = paramsFromRequest(req)
    const canonical = requestFromParams(next)
    if (canonical.kind !== 'ok') return
    setSyncedKey(requestKey(canonical.request)) // evita reescribir lo que la persona tecleó
    setAttempt((a) => a + 1)
    setParams(next)
  }

  const pickPreset = (p: SkyTarget) => {
    setForm({ ra: String(p.ra), dec: String(p.dec), fov: String(p.fov) })
    handleSubmit({ raDeg: p.ra, decDeg: p.dec, fovArcmin: p.fov })
  }

  // Estado derivado de la consulta.
  const current = result && result.key === queryKey ? result : null
  const series = current?.series
  const loading = fromUrl.kind === 'ok' && !current
  const frames = series ? detectorFrames(series.manifest, series.directory, detector) : []
  const frameCount = frames.length

  let content
  if (fromUrl.kind === 'none') {
    content = (
      <p className="skyviewer-empty">
        Escribe las coordenadas de un parche de cielo o elige un objetivo del catálogo para empezar.
      </p>
    )
  } else if (fromUrl.kind === 'invalid') {
    content = (
      <p className="skyviewer-error" role="alert">
        {fromUrl.message} Corrige los valores y pulsa «Ver imágenes».
      </p>
    )
  } else if (loading) {
    content = (
      <p className="skyviewer-empty" role="status">
        Cargando imágenes…
      </p>
    )
  } else if (current?.failed) {
    content = (
      <div role="alert" className="skyviewer-error-box">
        <p className="skyviewer-error">{current.failed}</p>
        <button type="button" className="skyviewer-btn" onClick={() => setAttempt((a) => a + 1)}>
          Reintentar
        </button>
      </div>
    )
  } else if (series && frameCount === 0) {
    content = <p className="skyviewer-empty">No hay imágenes para ese parche de cielo.</p>
  } else if (series) {
    const a = Math.min(blink.a, frameCount - 1)
    const b = Math.min(blink.b, frameCount - 1)
    content = (
      <>
        <div className="skyviewer-panel">
          <h2>{series.manifest.name}</h2>
          <label className="skyviewer-field"><span>Rango infrarrojo</span>
            <select className="skyviewer-select" value={detector} onChange={e => setDetector(Number(e.target.value))}>
              {series.manifest.detectors.map(d => <option key={d.id} value={d.id}>Detector {d.id} · {d.wavelength_um.join('–')} µm</option>)}
            </select>
          </label>
          <p className="skyviewer-note">Comparamos únicamente pasadas del mismo detector, con la misma escala de brillo.</p>
        </div>
        <ViewModeBar
          mode={mode}
          onModeChange={setMode}
          count={frameCount}
          blinkA={a}
          blinkB={b}
          onBlinkChange={(na, nb) => setBlink({ a: na, b: nb })}
        />
        <FramePlayer
          key={current?.key + ':' + detector}
          frames={frames}
          mode={mode}
          blinkA={a}
          blinkB={b}
          isMock={series.source === 'mock'}
        />
        <SciencePanel series={series} detector={detector} />
      </>
    )
  }

  return (
    <section className="skyviewer">
      <header className="skyviewer-intro">
        <small className="skyviewer-eyebrow">DESAFÍO · PLANET X AND SPHEREX</small>
        <h1 className="skyviewer-title">Cielo SPHEREx</h1>
        <p className="skyviewer-lead">
          Explora el cielo infrarrojo y compara observaciones reales entre fechas. Sigue estrellas en
          movimiento y regiones donde nacen sistemas planetarios.
        </p>
      </header>

      <SkyPanorama request={request} />
      <div className="skyviewer-body">
        <div className="skyviewer-side">
          <PresetList onPick={pickPreset} />
          <CoordForm
            values={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            onSubmit={handleSubmit}
            busy={loading}
          />
        </div>
        <div className="skyviewer-main">{content}</div>
      </div>
    </section>
  )
}
