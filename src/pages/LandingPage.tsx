import { useRef, useState } from 'react'
import { type View } from '../data/bodies'
import SolarSystemScene, { type SceneHandle } from '../features/solar-system/SolarSystemScene'
import SceneHud from '../features/solar-system/SceneHud'
import './landing-page.css'

// Versión transitoria (paso 3): el visor ocupa la pantalla con su HUD.
// El paso 4 lo convierte en el hero de la landing.
export default function LandingPage() {
  const scene = useRef<SceneHandle>(null)
  const [view, setView] = useState<View>('Tierra')
  const [error, setError] = useState(false)
  return (
    <div className="scene-host">
      <SolarSystemScene ref={scene} onViewChange={setView} onError={() => setError(true)} />
      <SceneHud view={view} error={error} onGo={v => scene.current?.goTo(v)} />
    </div>
  )
}
