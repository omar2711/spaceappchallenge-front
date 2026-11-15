import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGaia } from '../../api/b3'
import { ApiError, dataUrl } from '../../api/client'
import { loadFields, type KnownField } from '../../api/fields'
import { getSkySeries, SkyJobError, type SkyRequest, type SkySeries } from '../../api/sky'
import { getSpectrumAt } from '../../api/spectrum'
import type { CustomStatus, GaiaField, Pair } from '../../api/types'
import './sky-viewer.css'
import CoordForm, { type FormValues } from './components/CoordForm'
import DetectorBar from './components/DetectorBar'
import FalseColor from './components/FalseColor'
import FieldInfo from './components/FieldInfo'
import FramePlayer, { type CalibratedDiff } from './components/FramePlayer'
import GaiaPanel from './components/GaiaPanel'
import JobProgress from './components/JobProgress'
import LightCurvePanel from './components/LightCurvePanel'
import PresetList from './components/PresetList'
import SkyPanorama from './components/SkyPanorama'
import SpectrumPanel, { type PickedSpectrum } from './components/SpectrumPanel'
import ViewModeBar, { type ViewMode } from './components/ViewModeBar'
import VisibilityCard from './components/VisibilityCard'
import { DEFAULT_DETECTOR, defaultDetectorFor } from './lib/defaultDetector'
import { FOV_DEFAULT_ARCMIN } from './lib/parseCoords'
import { FIELD_SHORTCUTS, type SkyShortcut } from './lib/shortcuts'
import { paramsFromRequest, requestFromParams, requestKey, type ParamsState } from './lib/skyParams'
import { skyToWebPx, webPxToSky } from './lib/wcs'

type Result = { key: string; series?: SkySeries; error?: unknown }
type Pick = { key: string; field: string; px: Pair; ra: number; dec: number; label?: string }

function spectrumError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) return 'Esa posición queda fuera del campo.'
    if (error.status === 409) return 'Este campo todavía no está preparado en el servidor para medir espectros.'
    return `El servidor no pudo medir el espectro: ${error.detail}`
  }
  if (error instanceof TypeError) return 'No se pudo conectar con la API.'
  return error instanceof Error ? error.message : 'Error desconocido.'
}

const formFromUrl = (s: ParamsState): FormValues =>
  s.kind === 'ok'
    ? { ra: String(s.request.raDeg), dec: String(s.request.decDeg), fov: String(s.request.fovArcmin) }
    : { ra: '', dec: '', fov: String(FOV_DEFAULT_ARCMIN) }

const series0 = (r: Result | null, key: string) => (r && r.key === key ? r.series : undefined)

function errorMessage(error: unknown): string {
  if (error instanceof SkyJobError) {
    if (error.status.error === 'no_coverage') return 'SPHEREx todavía no observó esa posición del cielo.'
    return `El servidor no pudo generar el campo: ${error.message}`
  }
  if (error instanceof TypeError) return 'No se pudo conectar con el servidor. Revisa la conexión o espera unos segundos si estaba dormido.'
  if (error instanceof ApiError && error.status === 503 && /offline/i.test(error.detail))
    return 'Estás en modo demo sin internet. Solo se abren los campos de la lista; una coordenada nueva necesita conexión con IRSA.'
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

  // Espectro de una posición elegida con un clic (GET /spectrum).
  const [pick, setPick] = useState<Pick | null>(null)
  const [picked, setPicked] = useState<{ pick: Pick; data: PickedSpectrum } | null>(null)
  const activePick = pick && pick.key === queryKey ? pick : null
  useEffect(() => {
    if (!activePick) return
    const ctrl = new AbortController()
    const started = Date.now()
    const base = { ra: activePick.ra, dec: activePick.dec, label: activePick.label }
    const set = (data: Omit<PickedSpectrum, 'ra' | 'dec' | 'label' | 'elapsedS'>) =>
      setPicked({ pick: activePick, data: { ...base, ...data, elapsedS: Math.round((Date.now() - started) / 1000) } })
    const tick = window.setInterval(() => set({ state: 'loading' }), 1000)
    getSpectrumAt(activePick.field, activePick.ra, activePick.dec, activePick.label, ctrl.signal)
      .then((r) =>
        set({ state: 'ready', spectra: r.spectra, referenceBands: r.reference_bands, nExposures: r.n_exposures, flags: r.flags }),
      )
      .catch((error) => {
        if (!ctrl.signal.aborted) set({ state: 'error', error: spectrumError(error) })
      })
      .finally(() => window.clearInterval(tick))
    return () => {
      ctrl.abort()
      window.clearInterval(tick)
    }
  }, [activePick])
  const pickedSpectrum: PickedSpectrum | null = activePick
    ? picked?.pick === activePick
      ? picked.data
      : { ra: activePick.ra, dec: activePick.dec, label: activePick.label, state: 'loading', elapsedS: 0 }
    : null

  // Estrellas Gaia DR3 del campo conocido (GET /gaia).
  const gaiaField = series0(result, queryKey)?.field.known?.id ?? null
  const [gaia, setGaia] = useState<{ field: string; data?: GaiaField; failed?: boolean } | null>(null)
  useEffect(() => {
    if (!gaiaField) return
    let cancelled = false
    getGaia(gaiaField)
      .then((data) => !cancelled && setGaia({ field: gaiaField, data }))
      .catch(() => !cancelled && setGaia({ field: gaiaField, failed: true }))
    return () => {
      cancelled = true
    }
  }, [gaiaField])
  const gaiaCur = gaia && gaia.field === gaiaField ? gaia : null
  const gaiaOverlay = useMemo(() => {
    if (!gaiaCur?.data) return null
    const still = gaiaCur.data.sources.filter((s) => !s.arrow && s.g_mag < 17).slice(0, 40)
    return [...still, ...gaiaCur.data.sources.filter((s) => s.arrow)]
  }, [gaiaCur])

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
        Elige un objeto de la lista o escribe unas coordenadas para ver sus imágenes de SPHEREx.
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
        Cargando imágenes de SPHEREx…{elapsed > 4 && ' Si el servidor estaba dormido, tarda unos 30 s en responder.'}
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
    const known = series.field.known
    const canPick = !!known // /spectrum solo mide los campos preparados (objetivos y presets)
    const pickPixel = (px: Pair) => {
      if (!known) return
      const [w, h] = series.imageSize
      if (px[0] < -0.5 || px[1] < -0.5 || px[0] > w - 0.5 || px[1] > h - 0.5) return
      const { ra, dec } = webPxToSky(series.manifest.grid_wcs, px)
      setPick({ key: queryKey, field: known.id, px, ra, dec })
    }
    const pickShortcut = (s: SkyShortcut) => {
      if (!known) return
      setPick({ key: queryKey, field: known.id, px: skyToWebPx(series.manifest.grid_wcs, s.ra, s.dec), ...s })
    }
    const analysis = series.analysis
    const variable = !!analysis?.light_curves.some((c) => c.usable !== false && c.variability.significant)
    const pmTotal = Math.hypot(series.manifest.proper_motion_mas_yr.pmra, series.manifest.proper_motion_mas_yr.pmdec)
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
          objectName={series.field.name}
          mode={mode}
          blinkA={a}
          blinkB={b}
          diffs={diffs}
          onPickPixel={canPick ? pickPixel : undefined}
          pickedPx={activePick?.px}
          movingTarget={pmTotal > 50}
          gaia={gaiaOverlay}
        />
        {known && (
          <GaiaPanel
            gaia={gaiaCur?.data ?? null}
            failed={!!gaiaCur?.failed}
            pixelScale={series.manifest.pixel_scale_arcsec}
            epochs={frames.map((f) => f.epoch)}
            targetMovesFast={pmTotal > 1000}
          />
        )}
        <SpectrumPanel
          key={current?.key}
          targetName={series.field.name}
          baseSpectra={analysis?.spectra ?? null}
          referenceBands={analysis?.reference_bands ?? []}
          variable={variable}
          canPick={canPick}
          picked={pickedSpectrum}
          onClearPick={() => setPick(null)}
          shortcuts={known ? FIELD_SHORTCUTS[known.id] : undefined}
          onShortcut={pickShortcut}
        />
        {analysis && analysis.light_curves.length > 0 && (
          <LightCurvePanel curves={analysis.light_curves} detector={detector} onDetector={setDetector} />
        )}
        <FalseColor key={current?.key} series={series} />
        <VisibilityCard ra={series.manifest.grid_wcs.CRVAL1} dec={series.manifest.grid_wcs.CRVAL2} name={series.field.name} />
      </>
    )
  }

  return (
    <section className="skyviewer">
      <header className="skyviewer-intro">
        <h1 className="skyviewer-title">Cielo SPHEREx</h1>
        <p className="skyviewer-lead">
          SPHEREx pasa por el mismo lugar del cielo cada seis meses. Al poner sus fotos una tras otra se nota qué se
          movió o cambió de brillo. Elige un objeto de la lista o escribe sus coordenadas.
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

      <SkyPanorama request={request} />
    </section>
  )
}
