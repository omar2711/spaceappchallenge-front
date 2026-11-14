import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getSkySeries, type SkyRequest, type SkySeries } from '../../api/sky'
import './sky-viewer.css'
import CoordForm, { type FormValues } from './components/CoordForm'
import FramePlayer from './components/FramePlayer'
import PresetList from './components/PresetList'
import ViewModeBar, { type ViewMode } from './components/ViewModeBar'
import type { Preset } from './data/presets'
import { FOV_DEFAULT_ARCMIN } from './lib/parseCoords'
import { paramsFromRequest, requestFromParams, requestKey, type ParamsState } from './lib/skyParams'

type Result = { key: string; series?: SkySeries; failed?: boolean }

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
      .catch(() => {
        if (!cancelled) setResult({ key: queryKey, failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [request, queryKey])

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

  const pickPreset = (p: Preset) => setForm((f) => ({ ...f, ra: p.ra, dec: p.dec }))

  // Estado derivado de la consulta.
  const current = result && result.key === queryKey ? result : null
  const series = current?.series
  const loading = fromUrl.kind === 'ok' && !current
  const frameCount = series?.frames.length ?? 0

  let content
  if (fromUrl.kind === 'none') {
    content = (
      <p className="skyviewer-empty">
        Escribe las coordenadas de un parche de cielo o elige un objetivo de prueba para empezar.
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
        <p className="skyviewer-error">No se pudieron cargar las imágenes.</p>
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
        <ViewModeBar
          mode={mode}
          onModeChange={setMode}
          count={frameCount}
          blinkA={a}
          blinkB={b}
          onBlinkChange={(na, nb) => setBlink({ a: na, b: nb })}
        />
        <FramePlayer
          key={current?.key}
          frames={series.frames}
          mode={mode}
          blinkA={a}
          blinkB={b}
          isMock={series.source === 'mock'}
        />
      </>
    )
  }

  return (
    <section className="skyviewer">
      <header className="skyviewer-intro">
        <small className="skyviewer-eyebrow">DESAFÍO · PLANET X AND SPHEREX</small>
        <h1 className="skyviewer-title">Cielo SPHEREx</h1>
        <p className="skyviewer-lead">
          Ingresa las coordenadas de un parche de cielo (Ascensión Recta y declinación) y mira una
          serie de imágenes como un pequeño video para detectar objetos en movimiento.
        </p>
      </header>

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
