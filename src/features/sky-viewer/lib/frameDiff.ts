// Dibuja |a − b| (valor absoluto de la diferencia por canal) en el canvas del contexto dado.
// `gain` amplifica la diferencia para que se note.
// CORS: leer píxeles (getImageData) falla si las imágenes vienen de otro origen sin CORS.
export function drawDifference(
  target: CanvasRenderingContext2D,
  a: HTMLImageElement,
  b: HTMLImageElement,
  gain = 4,
): void {
  const w = a.naturalWidth
  const h = a.naturalHeight
  target.canvas.width = w
  target.canvas.height = h

  const read = (img: HTMLImageElement): ImageData => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas 2D no disponible')
    ctx.drawImage(img, 0, 0, w, h)
    return ctx.getImageData(0, 0, w, h)
  }

  const da = read(a).data
  const db = read(b).data
  const out = target.createImageData(w, h)
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = Math.min(255, Math.abs(da[i] - db[i]) * gain)
    out.data[i + 1] = Math.min(255, Math.abs(da[i + 1] - db[i + 1]) * gain)
    out.data[i + 2] = Math.min(255, Math.abs(da[i + 2] - db[i + 2]) * gain)
    out.data[i + 3] = 255
  }
  target.putImageData(out, 0, 0)
}
