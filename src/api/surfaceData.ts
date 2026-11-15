/** Los dos mapas incluyen una copia de los productos geográficos del backend. */
export async function surfaceData<T>(file: string, fromApi: () => Promise<T>): Promise<T> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/surface/${file}`)
    if (response.ok) return await response.json() as T
  } catch {
    // Una instalación sin el archivo local todavía puede consultar la API.
  }
  return fromApi()
}
