/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Ruta del Agua API. Defaults to the public deployment (see src/api/client.ts). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
