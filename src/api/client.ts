// Cliente HTTP de la API Ruta del Agua (backend: spaceappchallenge-back, contrato en su docs/API_FRONTEND.md).
// La base se configura con VITE_API_URL; por defecto, el despliegue público.

export const DEFAULT_API_URL = 'https://ruta-del-agua-api.onrender.com'

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

/** URL absoluta de una ruta de la API (`/health`) o de un archivo estático relativo a /data (`targets/index.json`). */
export const apiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
export const dataUrl = (relative: string) => apiUrl(`/data/${relative.replace(/^\/+/, '')}`)

export class ApiError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(detail || `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

const withQuery = (path: string, query?: Query) => {
  if (!query) return apiUrl(path)
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) params.set(k, String(v))
  const qs = params.toString()
  return qs ? `${apiUrl(path)}?${qs}` : apiUrl(path)
}

async function parse<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T
  let detail = ''
  try {
    const body = (await res.json()) as { detail?: unknown }
    detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? '')
  } catch {
    detail = res.statusText
  }
  throw new ApiError(res.status, detail)
}

export async function getJson<T>(path: string, query?: Query, signal?: AbortSignal): Promise<T> {
  return parse<T>(await fetch(withQuery(path, query), { signal }))
}

export async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return parse<T>(
    await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }),
  )
}

/** Estático de /data (manifest, analysis.json, catálogos), con caché en memoria por URL. */
const staticCache = new Map<string, Promise<unknown>>()
export function getData<T>(relative: string): Promise<T> {
  const url = dataUrl(relative)
  let p = staticCache.get(url) as Promise<T> | undefined
  if (!p) {
    p = fetch(url).then((r) => parse<T>(r))
    p.catch(() => staticCache.delete(url)) // un fallo no queda cacheado
    staticCache.set(url, p)
  }
  return p
}
