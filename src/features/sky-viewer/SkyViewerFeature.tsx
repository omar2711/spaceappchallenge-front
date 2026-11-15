import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dataUrl } from '../../api/client'
import { loadFields, type KnownField } from '../../api/fields'
import { getSkySeries, SkyJobError, type SkyRequest, type SkySeries } from '../../api/sky'
import type { CustomStatus } from '../../api/types'
import './sky-viewer.css'
import CoordForm, { type FormValues } from './components/CoordForm'
import DetectorBar from './components/DetectorBar'
import FieldInfo from './components/FieldInfo'
import FramePlayer, { type CalibratedDiff } from './components/FramePlayer'
import JobProgress from './components/JobProgress'
import PresetList from './components/PresetList'
import ViewModeBar, { type ViewMode } from './components/ViewModeBar'
import { DEFAULT_DETECTOR, defaultDetectorFor } from './lib/defaultDetector'
import { FOV_DEFAULT_ARCMIN } from './lib/parseCoords'
import { paramsFromRequest, requestFromParams, requestKey, type ParamsState } from './lib/skyParams'

type Result = { key: string; series?: SkySeries; error?: unknown }

const formFromUrl = (s: ParamsState): FormValues =>
  s.kind === 'ok'
    ? { ra: String(s.request.raDeg), dec: String(s.request.decDeg), fov: String(s.request.fovArcmin) }
    : { ra: '', dec: '', fov: String(FOV_DEFAULT_ARCMIN) }

function errorMessage(error: unknown): string {
  if (error instanceof SkyJobError) {
    if (error.status.error === 'no_coverage') return 'SPHEREx todavía no observó esa posición del cielo.'
    return `El servidor no pudo generar el campo: ${error.message}`
  }
  if (error instanceof TypeError) return 'No se pudo conectar con la API (¿sin internet o servidor despertando?).'
  return error instanceof Error ? error.message : 'Error desconocido.'
}

export default function SkyViewerFeature() {
  const [params, setParams] = useSearchParams()
  const fromUrl = useMemo(() => requestFromParams(params), [params])
  const urlKey = fromUrl.kind === 'ok' ? requestKey(fromUrl.request) : ''
  const detParam = Number(params.get('det')) || null

  // Catálogo de campos conocidos (objetivos y presets reales del backend).
  const [fields, setFields] = useState<KnownField[] | null>(null)
  const [fieldsFailed, setFieldsFailed] = useState(false)
  const [fieldsAttempt, setFieldsAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    loadFields()
      .then((f) => !cancelled && (setFields(f), setFieldsFailed(false)))
      .catch(() => !cancelled && setFieldsFailed(true))
    return () => {
      cancelled = true
    }
  }, [fieldsAttempt])

  // El formulario conserva lo que escribe la persona; solo se reescribe cuando la URL cambia por fuera.
  const [form, setForm] = useState<FormValues>(() => formFromUrl(fromUrl))
  const [syncedKey, setSyncedKey] = useState(urlKey)
  if (syncedKey !== urlKey) {
    setSyncedKey(urlKey)
    if (fromUrl.kind === 'ok') setForm(formFromUrl(fromUrl))
  }

  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [progress, setProgress] = useState<{ key: string; status: CustomStatus } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const queryKey = fromUrl.kind === 'ok' ? `${urlKey}#${attempt}` : ''

  const request = fromUrl.kind === 'ok' ? fromUrl.request : null
  useEffect(() => {
    if (!request) return
    const ctrl = new AbortController()
    const started = Date.now()
    const tick = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000)
    getSkySeries(request, {
      signal: ctrl.signal,
      onProgress: (status) => setProgress({ key: queryKey, status }),
    })
      .then((series) => setResult({ key: queryKey, series }))
      .catch((error) => {
        if (!ctrl.signal.aborted) setResult({ key: queryKey, error })
      })
      .finally(() => window.clearInterval(tick))
    return () => {
      ctrl.abort()
      window.clearInterval(tick)
    }
  }, [request, queryKey])

  const [mode, setMode] = useState<ViewMode>('normal')
  const [blink, setBlink] = useState({ a: 0, b: 1 })

  const submit = (req: SkyRequest, det?: number) => {
    const next = paramsFromRequest(req)
    const canonical = requestFromParams(next)
    if (canonical.kind !== 'ok') return
    if (det) next.set('det', String(det))
    setSyncedKey(requestKey(canonical.request)) // evita reescribir lo que la persona tecleó
    setAttempt((a) => a + 1)
    setElapsed(0)
    setParams(next)
  }

  const pickField = (f: KnownField) => {
    setForm({ ra: String(f.request.raDeg), dec: String(f.request.decDeg), fov: String(f.request.fovArcmin) })
    submit(f.request)
  }

  // Estado derivado de la consulta.
  const current = result && result.key === queryKey ? result : null
  const series = current?.series
  const loading = fromUrl.kind === 'ok' && !current
  const jobStatus = loading && progress?.key === queryKey ? progress.status : null

  const recommended = series ? defaultDetectorFor(series.field.id, series.detectors) : 1
  const detector =
    series && detParam && series.detectors.some((d) => d.id === detParam && d.frames.length) ? detParam : recommended
  const detSeries = series?.detectors.find((d) => d.id === detector)
  const frames = detSeries?.frames ?? []
  const frameCount = frames.length

  const setDetector = (id: number) => {
    const next = new URLSearchParams(params)
    next.set('det', String(id))
    setParams(next, { replace: true })
  }

  const diffs: CalibratedDiff[] =
    series?.analysis && series.analysisBase
      ? series.analysis.difference_images
          .filter((d) => d.detector === detector)
          .map((d) => ({
            from: d.from,
            to: d.to,
            url: dataUrl(`${series.analysisBase}${d.file}`),
            range: d.range,
            caveats: d.caveats,
          }))
      : []

  let content
  if (fromUrl.kind === 'none') {
    content = (
      <p className="skyviewer-empty">
        Elige un objetivo de prueba o escribe las coordenadas de un parche de cielo para ver las imágenes reales de
        SPHEREx.
      </p>
    )
  } else if (fromUrl.kind === 'invalid') {
    content = (
      <p className="skyviewer-error" role="alert">
        {fromUrl.message} Corrige los valores y pulsa «Ver imágenes».
      </p>
    )
  } else if (loading) {
    content = jobStatus ? (
      <JobProgress status={jobStatus} elapsedS={elapsed} />
    ) : (
      <p className="skyviewer-empty" role="status">
        Cargando imágenes de SPHEREx…{elapsed > 4 && ' (el servidor público puede tardar ~30 s en despertar)'}
      </p>
    )
  } else if (current?.error) {
    content = (
      <div role="alert" className="skyviewer-error-box">
        <p className="skyviewer-error">{errorMessage(current.error)}</p>
        <button type="button" className="skyviewer-btn" onClick={() => setAttempt((a) => a + 1)}>
          Reintentar
        </button>
      </div>
    )
  } else if (series && frameCount === 0) {
    content = <p className="skyviewer-empty">No hay imágenes de SPHEREx para ese parche de cielo.</p>
  } else if (series && detSeries) {
    const a = Math.min(blink.a, frameCount - 1)
    const b = Math.min(blink.b, frameCount - 1)
    const label = `D${detSeries.id} · ${detSeries.wavelengthUm[0].toFixed(2)}–${detSeries.wavelengthUm[1].toFixed(2)} µm`
    content = (
      <>
        <FieldInfo series={series} />
        <DetectorBar
          detectors={series.detectors}
          value={detector}
          recommended={recommended}
          recommendedReason={DEFAULT_DETECTOR[series.field.id]?.reason}
          onChange={setDetector}
        />
        <ViewModeBar
          mode={mode}
          onModeChange={setMode}
          count={frameCount}
          blinkA={a}
          blinkB={b}
          onBlinkChange={(na, nb) => setBlink({ a: na, b: nb })}
        />
        <FramePlayer
          key={`${current?.key}-D${detector}`}
          frames={frames}
          imageSize={series.imageSize}
          detectorLabel={label}
          mode={mode}
          blinkA={a}
          blinkB={b}
          diffs={diffs}
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
          Ingresa las coordenadas de un parche de cielo (ascensión recta y declinación) y mira las imágenes reales de
          SPHEREx de cada pasada como un pequeño video, para detectar objetos que se mueven o cambian de brillo.
        </p>
      </header>

      <div className="skyviewer-body">
        <div className="skyviewer-side">
          <PresetList
            fields={fields}
            failed={fieldsFailed}
            activeId={series?.field.known?.id}
            onPick={pickField}
            onRetry={() => setFieldsAttempt((n) => n + 1)}
          />
          <CoordForm
            values={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            onSubmit={(req) => submit(req)}
            busy={loading}
          />
        </div>
        <div className="skyviewer-main">{content}</div>
      </div>
    </section>
  )
}
