import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { SkyFrame } from '../../../api/sky'
import { drawDifference } from '../lib/frameDiff'
import type { ViewMode } from './ViewModeBar'

const SPEEDS = [0.5, 1, 2]
const BASE_DELAY_MS = 600 // a velocidad 1x, un frame cada 600 ms

type Props = {
  frames: SkyFrame[]
  mode: ViewMode
  blinkA: number
  blinkB: number
  isMock: boolean
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const formatUT = (iso: string) => `${iso.replace('T', ' ').slice(0, 16)} UT`

// Este componente se monta de nuevo (key) con cada serie nueva, así que su estado parte limpio.
export default function FramePlayer({ frames, mode, blinkA, blinkB, isMock }: Props) {
  const count = frames.length
  const [reduced] = useState(prefersReducedMotion)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const [playing, setPlaying] = useState(() => !reduced) // sin autoplay con movimiento reducido
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(true)
  const [blinkOn, setBlinkOn] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [diffError, setDiffError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const images = useRef(new Map<string, Promise<HTMLImageElement>>())

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(count - 1, i))
    indexRef.current = clamped
    setIndex(clamped)
  }

  // Reproducción: avanza de frame (normal / diferencia) o alterna A/B (blink).
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
      else if (loop) move(0)
      else setPlaying(false)
    }, BASE_DELAY_MS / speed)
    return () => window.clearInterval(id)
  }, [playing, speed, loop, mode, count])

  // Modo diferencia: |frame_n − frame_n−1| en el canvas.
  useEffect(() => {
    if (mode !== 'diff') return
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
          img.crossOrigin = 'anonymous' // ver nota de CORS en src/api/sky.ts
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
  }, [mode, index, frames])

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

  return (
    <div
      className="skyviewer-player"
      role="group"
      aria-label="Reproductor de imágenes. Espacio: reproducir o pausar. Flechas: cambiar de frame."
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="skyviewer-stage">
        {mode === 'diff' ? (
          <canvas
            ref={canvasRef}
            className="skyviewer-canvas"
            role="img"
            aria-label={`Diferencia entre el frame ${index + 1} y el anterior`}
          />
        ) : (
          <img
            className="skyviewer-image"
            src={frame.imageUrl}
            onLoad={() => setImageError(false)}
            onError={() => setImageError(true)}
            alt={`Parche de cielo, frame ${shownIndex + 1} de ${count}, ${formatUT(frame.epochUT)}`}
          />
        )}
        {mode === 'diff' && index === 0 && (
          <p className="skyviewer-stage-note">
            Frame 1: todavía no hay un frame anterior con el que comparar. Avanza al frame 2.
          </p>
        )}
        {mode === 'diff' && diffError && (
          <p className="skyviewer-stage-note" role="alert">
            No se pudo calcular la diferencia con estas imágenes.
          </p>
        )}
        {imageError && <p className="skyviewer-stage-note" role="alert">No se pudo cargar esta imagen.</p>}
        {isMock && <span className="skyviewer-badge">DATOS DE EJEMPLO</span>}
      </div>

      {!isMock && <p className="skyviewer-note">
        SPHEREx · observaciones reales. {frame.saturated ? 'Objetivo saturado en ' + frame.saturated + ' exposiciones; el núcleo interpolado no permite fotometría fiable. ' : ''}
        {(frame.contamination ?? 0) > 0.1 ? 'Contaminación elevada en este campo. ' : ''}
        {mode === 'diff' ? 'Diferencia visual de imágenes WebP, amplificada ×4; consulta las restas calibradas debajo para el análisis científico.' : ''}
      </p>}
      <p className="skyviewer-counter">
        {shownIndex + 1}/{count} · {formatUT(frame.epochUT)} · {frame.bandLabel}
        {mode === 'blink' && ` · ${blinkOn ? 'B' : 'A'}`}
      </p>

      <div className="skyviewer-controls">
        <button type="button" className="skyviewer-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pausa' : 'Reproducir'}
        </button>
        <button
          type="button"
          className="skyviewer-btn"
          aria-label="Frame anterior"
          disabled={mode === 'blink' || index === 0}
          onClick={() => goTo(index - 1)}
        >
          ◀
        </button>
        <button
          type="button"
          className="skyviewer-btn"
          aria-label="Frame siguiente"
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
          <select
            className="skyviewer-select"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
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
      </div>

      <input
        type="range"
        className="skyviewer-slider"
        min={0}
        max={count - 1}
        value={index}
        disabled={mode === 'blink'}
        aria-label="Frame"
        aria-valuetext={`Frame ${index + 1} de ${count}`}
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
