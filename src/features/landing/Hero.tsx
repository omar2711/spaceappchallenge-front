import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { type View } from '../../data/bodies'
import SolarSystemScene, { type SceneHandle } from '../solar-system/SolarSystemScene'
import SceneHud from '../solar-system/SceneHud'
import BodyPanel from '../solar-system/BodyPanel'
import './Hero.css'

// Hero de la landing: el visor 3D es el fondo y el texto va encima.
//
// Decisión clave: dos modos. Por defecto la rueda del ratón hace SCROLL de la
// página (si el 3D la capturara, el usuario quedaría "atrapado" en el hero y
// no llegaría al contenido). Quien quiere explorar el sistema solar lo activa
// con un botón explícito y puede salir con "Volver".
export default function Hero() {
  const scene = useRef<SceneHandle>(null)
  const [view, setView] = useState<View>('Tierra')
  const [error, setError] = useState(false)
  const [interactive, setInteractive] = useState(false)
  // El panel solo aparece tras tocar un cuerpo: al cargar, el hero debe mostrar
  // el titular y no datos de la Tierra que nadie pidió.
  const [picked, setPicked] = useState(false)
  const handleViewChange = (v: View) => { setView(v); setPicked(true) }

  const enterBtn = useRef<HTMLButtonElement>(null)
  const exitBtn = useRef<HTMLButtonElement>(null)
  const mounted = useRef(false)

  // Al cambiar de modo el botón pulsado desaparece; sin devolver el foco, quien
  // navega con teclado lo perdería y tendría que empezar la página de nuevo.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    ;(interactive ? exitBtn : enterBtn).current?.focus()
  }, [interactive])

  const exit = () => {
    setInteractive(false)
    setPicked(false)
    // Volver restaura la vista inicial: el hero siempre se reabre igual de limpio.
    scene.current?.goTo('Tierra')
  }

  return (
    <section className={interactive ? 'hero hero--interactive' : 'hero'} aria-labelledby="hero-title">
      <SolarSystemScene ref={scene} interactive={interactive} onViewChange={handleViewChange} onError={() => setError(true)} />

      {/* En modo interactivo el panel siempre informa de la vista activa; en el
          hero solo si el usuario tocó un cuerpo, y puede cerrarse. */}
      {(interactive || picked) && <BodyPanel view={view} onClose={interactive ? undefined : () => setPicked(false)} />}

      {interactive ? (
        <>
          <SceneHud view={view} error={error} onGo={v => scene.current?.goTo(v)} />
          <button ref={exitBtn} type="button" className="btn btn--ghost hero__exit" onClick={exit}>← Volver</button>
        </>
      ) : (
        <>
          {/* Velo de degradado: asegura contraste del texto sin tapar el 3D de la derecha. */}
          <div className="hero__shade" aria-hidden="true" />
          <div className="hero__content">
            <p className="hero__eyebrow">NASA Space Apps 2026 · Planet X y SPHEREx</p>
            <h1 id="hero-title" className="hero__title">Sigue el agua por el cielo, la Luna y Marte</h1>
            <p className="hero__lead">
              Un solo visor para recorrer el cielo, la Luna y Marte siguiendo la pista del agua.
              Arrastra para girar el sistema solar.
            </p>
            <div className="hero__actions">
              <Link to="/sky" className="btn btn--primary">Abrir el visor del cielo</Link>
              <a href="#tres-mundos" className="btn btn--ghost">Ver los tres mundos</a>
            </div>
          </div>
          {/* Fuera de la fila de CTAs: es una acción sobre el 3D, no una ruta de
              la página. Así la fila queda con los dos destinos y no se parte en
              dos líneas. Sigue siendo un <button> real de 44px de alto. */}
          <button ref={enterBtn} type="button" className="btn btn--ghost hero__explore" onClick={() => setInteractive(true)}>
            Explorar el sistema solar
          </button>
          {error && <p className="hud__error" role="alert">El visor requiere WebGL. Activa la aceleración gráfica para abrir el mapa.</p>}
        </>
      )}
    </section>
  )
}
