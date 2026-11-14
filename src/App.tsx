import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './app/Layout'

// Cada página se carga con lazy(): three.js (≈700 kB) solo se descarga al entrar
// a la landing, y /sky o /body/:id (placeholders hoy, visores pesados mañana)
// no pagan ese costo ni se lo imponen a las demás.
const LandingPage = lazy(() => import('./pages/LandingPage'))
const SkyPage = lazy(() => import('./pages/SkyPage'))
const BodyPage = lazy(() => import('./pages/BodyPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <Suspense fallback={<p role="status" style={{ padding: 'var(--space-6) var(--gutter)' }}>Cargando…</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="sky" element={<SkyPage />} />
          <Route path="body/:id" element={<BodyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
