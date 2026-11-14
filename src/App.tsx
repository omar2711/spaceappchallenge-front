import { useRef, useState } from 'react'
import positions from './positions.json'
import { catalog, format, type View } from './data/bodies'
import SolarSystemScene, { type SceneHandle } from './features/solar-system/SolarSystemScene'
import './App.css'

// En este paso App conserva el HUD original; la escena 3D ya vive aparte.
export default function App() {
  const scene = useRef<SceneHandle>(null)
  const [view, setView] = useState<View>('Tierra')
  const [credits, setCredits] = useState(false)
  const [error, setError] = useState(false)
  const goTo = (v: View) => scene.current?.goTo(v)
  const body = catalog.find(b => b[0] === view)
  return <main><SolarSystemScene ref={scene} onViewChange={setView} onError={() => setError(true)} /><header><b>◉ &nbsp; Ruta del Agua</b><select aria-label="Ir a un destino" value="" onChange={e => goTo(e.target.value as View)}><option value="" disabled>Ir a un destino ↓</option>{catalog.map(([n]) => <option key={n}>{n}</option>)}</select></header>
  <section><small>EXPLORADOR DEL SISTEMA SOLAR</small><h1>{view}</h1>{body ? <p>Radio medio · {format(body[1])} km<br />Distancia al Sol · {format(Math.hypot(...positions[body[0]]))} km</p> : <p>{view === 'Vuelo libre' ? 'W/S para avanzar y retroceder · A/D para desplazarte' : 'Selecciona un cuerpo para acercarte'}</p>}</section>
  {error && <aside>El visor requiere WebGL. Activa la aceleración gráfica para abrir el mapa.</aside>}
  <footer><nav>{(['Sistema solar', 'Tierra', 'Luna', 'Marte', 'Vuelo libre'] as View[]).map(n => <button key={n} aria-pressed={view === n} onClick={() => goTo(n)}>{n}</button>)}</nav><div className="meta"><span>14 NOV 2026 · 00:00 TDB</span><button onClick={() => setCredits(!credits)}>Datos y créditos {credits ? '−' : '+'}</button></div>{credits && <div className="sources">Posiciones heliocéntricas · eclíptica J2000 · <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a>. Texturas: <a href="https://threejs.org/examples/textures/planets/">Tierra / Three.js</a>, <a href="https://svs.gsfc.nasa.gov/4720/">Luna / NASA</a>, <a href="https://www.solarsystemscope.com/textures/">Sol, planetas y anillos / Solar System Scope (CC BY 4.0)</a>. Orientación de las superficies ilustrativa.</div>}</footer></main>
}
