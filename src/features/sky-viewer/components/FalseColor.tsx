import { useEffect, useRef, useState } from 'react'
import type { SkySeries } from '../../../api/sky'

const CHANNELS = [6, 4, 1] // rojo, verde, azul

export default function FalseColor({ series }: { series: SkySeries }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)
  // Una sola pasada común para los tres canales: nunca se mezclan fechas para hacer una imagen en color.
  const bands = CHANNELS.map((id) => series.detectors.find((d) => d.id === id))
  const epoch = bands[0]?.frames.find((f) => bands.every((b) => b?.frames.some((o) => o.epoch === f.epoch)))?.epoch
  const urls = bands.map((b) => b?.frames.find((f) => f.epoch === epoch)?.imageUrl)
  const key = urls.join('|')
  const [width, height] = series.imageSize
  useEffect(() => {
    if (!epoch) return
    const sources = key.split('|')
    if (sources.some((u) => !u)) return
    let active = true
    Promise.all(
      sources.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            image.crossOrigin = 'anonymous'
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = src
          }),
      ),
    )
      .then((images) => {
        if (!active || !canvas.current) return
        canvas.current.width = width
        canvas.current.height = height
        const context = canvas.current.getContext('2d')
        if (!context) throw new Error('Canvas no disponible')
        const channels = images.map((image) => {
          const scratch = document.createElement('canvas')
          scratch.width = width
          scratch.height = height
          const ctx = scratch.getContext('2d')!
          ctx.drawImage(image, 0, 0, width, height)
          return ctx.getImageData(0, 0, width, height).data
        })
        const output = context.createImageData(width, height)
        for (let i = 0; i < output.data.length; i += 4) {
          for (let c = 0; c < 3; c++) output.data[i + c] = channels[c][i]
          output.data[i + 3] = 255
        }
        context.putImageData(output, 0, 0)
        setError(false)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [key, epoch, width, height])
  if (!epoch) return null
  return (
    <section className="skyviewer-panel" aria-labelledby="fc-title">
      <h2 id="fc-title" className="skyviewer-panel-title">
        FALSO COLOR · {epoch}
      </h2>
      <figure className="skyviewer-color">
        <canvas ref={canvas} role="img" aria-label="Composición infrarroja en falso color: rojo D6, verde D4 y azul D1" />
        <figcaption>
          Rojo D6 · verde D4 · azul D1
          <br />
          misma pasada ({epoch}) en los tres canales
        </figcaption>
        <p className="skyviewer-note">
          {error
            ? 'No se pudo crear la composición.'
            : 'Composición visual con la escala de cada detector. Los colores no son los que vería el ojo ni identifican moléculas.'}
        </p>
      </figure>
    </section>
  )
}
