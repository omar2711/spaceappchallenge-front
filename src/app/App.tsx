import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../layouts/SiteLayout'
import LandingPage from '../pages/landing/LandingPage'

const SkyPage = lazy(() => import('../pages/sky/SkyPage'))
const MarsPage = lazy(() => import('../pages/mars/MarsPage'))
const AbandonedPage = lazy(() => import('../pages/abandoned/AbandonedPage'))
const SolarSystemPage = lazy(() => import('../features/solar-system/SolarSystemPage'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cielo" element={<SkyPage />} />
          <Route path="/marte" element={<MarsPage />} />
          <Route path="/abandonados" element={<AbandonedPage />} />
        </Route>
        {/* Pantalla completa: fuera del layout */}
        <Route path="/sistema-solar" element={<SolarSystemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
