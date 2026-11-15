import { sig } from '../../../components/charts/ticks'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { SkyFrame } from '../../../api/sky'
import type { DiffCaveat, GaiaSource, Pair } from '../../../api/types'
import { drawDifference } from '../lib/frameDiff'
import GaiaOverlay from './GaiaOverlay'
import type { ViewMode } from './ViewModeBar'

const SPEEDS = [0.5, 1, 2]
const BASE_DELAY_MS = 900 // a velocidad 1x, una pasada cada 0.9 s (hay pocas pasadas)

/** Imagen de diferencia calibrada del backend (analysis.json) para un par de pasadas consecutivas. */
export type CalibratedDiff = { from: string; to: string; url: string; range: Pair; caveats: DiffCaveat[] }

type Props = {
  frames: SkyFrame[]
  imageSize: Pair
  detectorLabel: string
  /** Nombre del objeto o campo, para el pie de figura. */
  objectName?: string
  mode: ViewMode
  blinkA: number
  blinkB: number
  diffs: CalibratedDiff[]
  /** Clic sobre la imagen: píxel web (base 0, origen arriba a la izquierda). */
  onPickPixel?: (px: Pair) => void
  pickedPx?: Pair | null
  /** El objetivo tiene movimiento propio conocido (cambia el texto de la nota de saturación). */
  movingTarget?: boolean
  /** Estrellas Gaia DR3 del campo (ya filtradas) para dibujar sobre la imagen. */
  gaia?: GaiaSource[] | null
}

const CAVEAT_TEXT: Record<DiffCaveat, string> = {
  moving_target: 'El objetivo se mueve, así que debería verse una mancha azul donde estaba y una roja donde está ahora.',
  wavelength_mismatch:
    'Las dos pasadas midieron longitudes de onda un poco distintas dentro del detector. Parte de lo que se ve puede venir de eso y no de un cambio real.',
  saturated_target: 'El centro del objetivo está saturado, así que lo que queda en el medio no es fiable.',
  few_reference_stars: 'Hay pocas estrellas de referencia en el campo y no se pudo igualar el brillo entre pasadas.',
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const formatDate = (iso: string) => (iso ? `${iso.slice(0, 10)} UT` : '')

/** Marca de la posición esperada del objetivo (coordenadas WebP: centro del píxel en x + 0.5). */
function TargetMarker({ px, size, pick }: { px: Pair; size: Pair; pick?: boolean }) {
  const [x, y] = [px[0] + 0.5, px[1] + 0.5]
  const r = Math.max(1.6, size[0] / 18)
  if (pick) {
    const h = r * 0.8
    return (
      <svg className="skyviewer-overlay skyviewer-overlay--pick" viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        <rect x={x - h} y={y - h} width={h * 2} height={h * 2} />
      </svg>
    )
  }
  return (
    <svg className="skyviewer-overlay" viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
      <circle cx={x} cy={y} r={r} />
      <line x1={x - r * 1.9} y1={y} x2={x - r * 1.25} y2={y} />
      <line x1={x + r * 1.25} y1={y} x2={x + r * 1.9} y2={y} />
      <line x1={x} y1={y - r * 1.9} x2={x} y2={y - r * 1.25} />
      <line x1={x} y1={y + r * 1.25} x2={x} y2={y + r * 1.9} />
    </svg>
  )
}

// Este componente se monta de nuevo (key) con cada serie o detector, así que su estado parte limpio.
export default function FramePlayer({
  frames,
  imageSize,
  detectorLabel,
  objectName,
  mode,
  blinkA,
  blinkB,
  diffs,
  onPickPixel,
  pickedPx,
  movingTarget,
  gaia,
}: Props) {
  const count = frames.length
  const [reduced] = useState(prefersReducedMotion)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const [playing, setPlaying] = useState(() => !reduced) // sin autoplay con movimiento reducido
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(true)
  const [blinkOn, setBlinkOn] = useState(false)
  const [showTarget, setShowTarget] = useState(true)
  const [showGaia, setShowGaia] = useState(true)
  const [diffError, setDiffError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const images = useRef(new Map<string, Promise<HTMLImageElement>>())

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(count - 1, i))
    indexRef.current = clamped
    setIndex(clamped)
  }

  // Reproducción: avanza de pasada (normal / diferencia) o alterna A/B (blink).
  useEffect(() => {
    if (!playing || count < 2) return
    const move = (i: number) => {
      indexRef.current = i
      setIndex(i)
    }
    const id = window.setInterval(() => {
      if (mode === 'blink') {
        setBlinkOn((v) => !v)
        return
      }
      const next = indexRef.current + 1
      if (next < count) move(next)
      else if (loop) move(mode === 'diff' ? 1 : 0)
      else setPlaying(false)
    }, BASE_DELAY_MS / speed)
    return () => window.clearInterval(id)
  }, [playing, speed, loop, mode, count])

  const calibrated =
    mode === 'diff' && index > 0
      ? diffs.find((d) => d.from === frames[index - 1].epoch && d.to === frames[index].epoch)
      : undefined

  // Respaldo sin diferencia calibrada: |pasada_n − pasada_n−1| en canvas (los WebP llegan con CORS).
  useEffect(() => {
    if (mode !== 'diff' || calibrated) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (index === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    const load = (url: string) => {
      let p = images.current.get(url)
      if (!p) {
        p = new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = url
        })
        images.current.set(url, p)
      }
      return p
    }
    let cancelled = false
    Promise.all([load(frames[index].imageUrl), load(frames[index - 1].imageUrl)])
      .then(([cur, prev]) => {
        if (cancelled) return
        drawDifference(ctx, cur, prev)
        setDiffError(false)
      })
      .catch(() => {
        if (!cancelled) setDiffError(true)
      })
    return () => {
      cancelled = true
    }
  }, [mode, index, frames, calibrated])

  const shownIndex = mode === 'blink' ? (blinkOn ? blinkB : blinkA) : index
  const frame = frames[shownIndex]
  if (!frame) return null

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName
    if (e.key === ' ') {
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return // conservan su comportamiento
      e.preventDefault()
      setPlaying((p) => !p)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (tag === 'INPUT' || tag === 'SELECT' || mode === 'blink') return
      e.preventDefault()
      goTo(index + (e.key === 'ArrowRight' ? 1 : -1))
    }
  }

  const pick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onPickPixel) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * imageSize[0] - 0.5
    const y = ((e.clientY - r.top) / r.height) * imageSize[1] - 0.5
    onPickPixel([Math.round(x * 100) / 100, Math.round(y * 100) / 100])
  }

  const prev = index > 0 ? frames[index - 1] : null
  const saturated = frame.saturatedExposures > 0

  return (
    <div
      className="skyviewer-player"
      role="group"
      aria-label="Reproductor de imágenes. Espacio: reproducir o pausar. Flechas: cambiar de pasada."
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={`skyviewer-stage${onPickPixel ? ' skyviewer-stage--pick' : ''}`} onClick={pick}>
        {mode === 'diff' ? (
          calibrated ? (
            <img
              className="skyviewer-image"
              src={calibrated.url}
              alt={`Diferencia calibrada ${calibrated.to} − ${calibrated.from}, ${detectorLabel}`}
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="skyviewer-canvas"
              role="img"
              aria-label={`Diferencia entre la pasada ${index + 1} y la anterior`}
            />
          )
        ) : (
          <img
            className="skyviewer-image"
            src={frame.imageUrl}
            alt={`SPHEREx ${detectorLabel}, pasada ${frame.epoch} (${formatDate(frame.epochUT)})`}
          />
        )}
        {showTarget && !(mode === 'diff' && index === 0) && <TargetMarker px={frame.targetPx} size={imageSize} />}
        {gaia && showGaia && mode !== 'diff' && (
          <GaiaOverlay sources={gaia} epoch={frame.epoch} epochs={frames.map((f) => f.epoch)} size={imageSize} />
        )}
        {pickedPx && <TargetMarker px={pickedPx} size={imageSize} pick />}
        {mode === 'diff' && index === 0 && (
          <p className="skyviewer-stage-note">
            Es la primera pasada y no hay otra anterior para comparar. Avanza a la pasada 2.
          </p>
        )}
        {mode === 'diff' && !calibrated && diffError && (
          <p className="skyviewer-stage-note" role="alert">
            No se pudo calcular la diferencia con estas imágenes.
          </p>
        )}
      </div>

      <p className="fig-caption">
        Fig. · {objectName ? `${objectName}, ` : ''}SPHEREx <span className="num">{detectorLabel}</span>,{' '}
        {mode === 'diff' && prev ? `diferencia ${frame.epoch} menos ${prev.epoch}` : `pasada ${frame.epoch}`}{' '}
        <span className="num">{formatDate(frame.epochUT)}</span> · {shownIndex + 1} de {count} ·{' '}
        <span className="num">{frame.nImages}</span> exposiciones
        {mode === 'blink' && ` · imagen ${blinkOn ? 'B' : 'A'}`}
      </p>

      {mode === 'diff' && index > 0 && (
        <div className="skyviewer-diffinfo">
          {calibrated ? (
            <>
              <p className="skyviewer-note">
                <span className="skyviewer-legend skyviewer-legend--neg" /> más débil o donde estaba ·{' '}
                <span className="skyviewer-legend skyviewer-legend--zero" /> sin cambio ·{' '}
                <span className="skyviewer-legend skyviewer-legend--pos" /> más brillante o donde está ahora · escala
                de <span className="num">±{sig(calibrated.range[1], 3)} MJy/sr</span>. Es una resta calibrada en el
                servidor: el brillo de las dos pasadas se igualó con las estrellas del campo.
              </p>
              {calibrated.caveats.length > 0 && (
                <ul className="skyviewer-caveats">
                  {calibrated.caveats.map((c) => (
                    <li key={c}>{CAVEAT_TEXT[c] ?? c}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="skyviewer-note">
              Resta simple hecha en el navegador con el brillo de pantalla. No está calibrada.
            </p>
          )}
        </div>
      )}
      {saturated && mode !== 'diff' && (
        <p className="skyviewer-note">
          {movingTarget ? 'El objetivo está saturado' : 'La posición marcada está saturada'} en{' '}
          <span className="num">{frame.saturatedExposures}</span> de <span className="num">{frame.nImages}</span>{' '}
          exposiciones de esta pasada, así que su brillo real es mayor que el medido
          {movingTarget ? '. El movimiento sí se puede medir' : ''}.
        </p>
      )}

      <div className="skyviewer-controls">
        <button type="button" className="skyviewer-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pausa' : 'Reproducir'}
        </button>
        <button
          type="button"
          className="skyviewer-btn"
          aria-label="Pasada anterior"
          disabled={mode === 'blink' || index === 0}
          onClick={() => goTo(index - 1)}
        >
          ◀
        </button>
        <button
          type="button"
          className="skyviewer-btn"
          aria-label="Pasada siguiente"
          disabled={mode === 'blink' || index === count - 1}
          onClick={() => goTo(index + 1)}
        >
          ▶
        </button>
        {mode === 'blink' && (
          <button type="button" className="skyviewer-btn" onClick={() => setBlinkOn((v) => !v)}>
            Alternar A/B
          </button>
        )}
        <label className="skyviewer-inline">
          Velocidad
          <select className="skyviewer-select" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </label>
        <label className="skyviewer-inline">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Repetir
        </label>
        <label className="skyviewer-inline">
          <input type="checkbox" checked={showTarget} onChange={(e) => setShowTarget(e.target.checked)} />
          Marcar objetivo
        </label>
        {gaia && (
          <label className="skyviewer-inline">
            <input type="checkbox" checked={showGaia} onChange={(e) => setShowGaia(e.target.checked)} />
            Estrellas Gaia
          </label>
        )}
      </div>

      <input
        type="range"
        className="skyviewer-slider"
        min={0}
        max={count - 1}
        value={index}
        disabled={mode === 'blink'}
        aria-label="Pasada"
        aria-valuetext={`Pasada ${index + 1} de ${count}`}
        onChange={(e) => goTo(Number(e.target.value))}
      />

      {reduced && (
        <p className="skyviewer-note">
          La reproducción automática está desactivada porque tu dispositivo pide menos movimiento.
        </p>
      )}
    </div>
  )
}
