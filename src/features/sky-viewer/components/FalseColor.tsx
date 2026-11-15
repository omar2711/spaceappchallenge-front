import { useEffect, useRef, useState } from 'react'
import type { SkySeries } from '../../../api/sky'

export default function FalseColor({ series }: { series: SkySeries }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)
  // One common pass for every channel; never mix dates to make a colour image.
  const bands = [6, 4, 1].map(id => series.manifest.detectors.find(d => d.id === id))
  const epoch = bands[0]?.frames.find(f => bands.every(b => b?.frames.some(other => other.epoch === f.epoch)))?.epoch
  const files = bands.map(b => b?.frames.find(f => f.epoch === epoch)?.file)
  const key = files.join('|')
  useEffect(() => {
    if (!epoch || files.some(f => !f)) return
    let active = true
    Promise.all(files.map(file => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = series.directory + file
    }))).then(images => {
      if (!active || !canvas.current) return
      const [width, height] = series.manifest.image_size_px
      canvas.current.width = width
      canvas.current.height = height
      const context = canvas.current.getContext('2d')
      if (!context) throw new Error('Canvas no disponible')
      const channels = images.map(image => {
        const scratch = document.createElement('canvas')
        scratch.width = width
        scratch.height = height
        const ctx = scratch.getContext('2d')!
        ctx.drawImage(image, 0, 0)
        return ctx.getImageData(0, 0, width, height).data
      })
      const output = context.createImageData(width, height)
      for (let i = 0; i < output.data.length; i += 4) {
        for (let channel = 0; channel < 3; channel++) output.data[i + channel] = channels[channel][i]
        output.data[i + 3] = 255
      }
      context.putImageData(output, 0, 0)
      setError(false)
    }).catch(() => { if (active) setError(true) })
    return () => { active = false }
    // Stable image filenames identify the selected pass.
  }, [series, key, epoch])
  if (!epoch) return null
  return <figure className="skyviewer-color">
    <canvas ref={canvas} role="img" aria-label="Composición infrarroja en falso color, rojo D6, verde D4 y azul D1" />
    <figcaption>Falso color · {epoch}<br />Rojo D6 · verde D4 · azul D1</figcaption>
    <p className="skyviewer-note">{error ? 'No se pudo crear la composición.' : 'Composición visual con escalas por detector. Los colores no representan lo que vería el ojo ni identifican moléculas.'}</p>
  </figure>
}
