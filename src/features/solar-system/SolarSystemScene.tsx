import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import positions from '../../positions.json'
import { catalog, textures, detailFiles, type Body, type View } from '../../data/bodies'

// API pública de la escena: el padre solo necesita "ir a una vista".
// Usamos un handle imperativo (y no estado) porque el vuelo de cámara es una
// animación de Three.js; pasarla por el ciclo de render de React la haría saltar.
export type SceneHandle = { goTo: (view: View) => void }

type Props = {
  ref?: Ref<SceneHandle>
  // Avisa al padre cuando cambia la vista activa (para HUD y panel de datos).
  onViewChange?: (view: View) => void
  // Avisa si el navegador no puede crear un contexto WebGL.
  onError?: () => void
  // false = modo "hero": sin zoom por rueda ni desplazamiento lateral, y el
  // scroll de la página sigue funcionando sobre el 3D (ver efecto de abajo).
  interactive?: boolean
}

export default function SolarSystemScene({ ref, onViewChange, onError, interactive = true }: Props) {
  const host = useRef<HTMLDivElement>(null)
  // notify=false se usa solo en la vista inicial: no es una acción del usuario.
  const navigate = useRef<(v: View, notify?: boolean) => void>(() => {})
  const rig = useRef<{ controls: OrbitControls; canvas: HTMLCanvasElement } | null>(null)

  // Los callbacks se guardan en refs para que el efecto de montaje (que crea
  // el renderer WebGL, costoso) corra una sola vez aunque el padre re-renderice.
  const viewChangeRef = useRef(onViewChange)
  const errorRef = useRef(onError)
  useEffect(() => {
    viewChangeRef.current = onViewChange
    errorRef.current = onError
  })

  useImperativeHandle(ref, () => ({ goTo: (view) => navigate.current(view) }), [])

  useEffect(() => {
    const container = host.current!
    let renderer: T.WebGLRenderer
    try { renderer = new T.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true }) }
    catch { errorRef.current?.(); return }
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(42, 1, 1, 3e10)
    // El fondo del canvas lo pinta WebGL (negro por defecto), no el CSS: por eso
    // se veía una franja negra distinta del --bg de la página. Se lee el token en
    // vez de copiar el hex, así un cambio de paleta en index.css llega también aquí.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (bg) renderer.setClearColor(new T.Color(bg))
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    container.append(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.maxDistance = 1.4e10
    rig.current = { controls, canvas: renderer.domElement }
    const lamp = new T.PointLight(0xffffff, 2, 0, 0)
    scene.add(lamp, new T.AmbientLight(0xe6efff, 0.54))
    const loader = new T.TextureLoader()
    const bodies = catalog.map(([name, r, color]) => {
      const file = textures[name]
      const map = file ? loader.load(import.meta.env.BASE_URL + 'textures/' + file + '.jpg') : null
      if (map) { map.colorSpace = T.SRGBColorSpace; map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()) }
      const material = name === 'Sol' ? new T.MeshBasicMaterial({ color: 0xffffff, map }) : new T.MeshStandardMaterial({ color: map ? 'white' : color, map, roughness: 1 })
      const mesh = new T.Mesh(new T.SphereGeometry(r, 80, 48), material)
      const [x, y, z] = positions[name]
      mesh.position.set(x, z, -y)
      scene.add(mesh)
      // Las etiquetas son <button> reales del DOM (no sprites 3D) para que
      // sean accesibles por teclado y lector de pantalla.
      const label = document.createElement('button')
      label.className = 'marker'; label.textContent = name
      label.onclick = () => navigate.current(name)
      container.append(label)
      return { name, r, mesh, label, map }
    })
    const saturn = bodies.find(body => body.name === 'Saturno')!
    const rings = new T.RingGeometry(74500, 140220, 192)
    const vertices = rings.attributes.position
    for (let i = 0; i < vertices.count; i++) {
      const radius = Math.hypot(vertices.getX(i), vertices.getY(i))
      rings.attributes.uv.setXY(i, (radius - 74500) / (140220 - 74500), 0.5)
    }
    const ringMap = loader.load(import.meta.env.BASE_URL + 'textures/2k_saturn_ring_alpha.png')
    ringMap.colorSpace = T.SRGBColorSpace
    const ringMaterial = new T.MeshBasicMaterial({ map: ringMap, side: T.DoubleSide, transparent: true, depthWrite: false })
    const ring = new T.Mesh(rings, ringMaterial)
    ring.rotation.x = Math.PI / 2 - 0.47
    saturn.mesh.add(ring)
    const details = new Map<Body, T.Texture>()
    let disposed = false
    let active: View = 'Tierra', flight = 1
    const from = new T.Vector3(), end = new T.Vector3(), startFocus = new T.Vector3(), focus = new T.Vector3()
    navigate.current = (next, notify = true) => {
      active = next
      if (notify) viewChangeRef.current?.(next)
      if (next === 'Vuelo libre') { flight = 1; return }
      const body = bodies.find(b => b.name === next)
      const detail = body && detailFiles[body.name]
      if (body && detail && renderer.capabilities.maxTextureSize >= 8192 && !details.has(body.name)) {
        const texture = loader.load(import.meta.env.BASE_URL + 'textures/' + detail + '.jpg', loaded => {
          if (disposed) return
          loaded.colorSpace = T.SRGBColorSpace
          loaded.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
          body.mesh.material.map = loaded
          body.mesh.material.needsUpdate = true
        })
        details.set(body.name, texture)
      }
      focus.copy(body?.mesh.position ?? new T.Vector3())
      controls.minDistance = body ? body.r * 1.08 : 1
      const direction = body && next !== 'Sol' ? body.mesh.position.clone().negate().normalize() : new T.Vector3(0, 0, 1)
      direction.y += 0.52
      end.copy(focus).addScaledVector(direction.normalize(), body ? body.r * (next === 'Saturno' ? 7.5 : 4.3) : 1.3e10)
      from.copy(camera.position); startFocus.copy(controls.target); flight = 0
    }
    navigate.current('Tierra', false); camera.position.copy(end); controls.target.copy(focus); flight = 1
    const resize = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
    })
    resize.observe(container)
    const keys = new Set<string>()
    const down = (e: KeyboardEvent) => { if (!(e.target instanceof HTMLSelectElement)) keys.add(e.key.toLowerCase()) }
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
    const blur = () => keys.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    const ray = new T.Raycaster(), press = new T.Vector2()
    renderer.domElement.onpointerdown = e => press.set(e.clientX, e.clientY)
    renderer.domElement.onpointerup = e => {
      // Si el puntero se movió más de 5px fue un arrastre (rotar), no un toque.
      if (press.distanceTo(new T.Vector2(e.clientX, e.clientY)) > 5) return
      const rect = renderer.domElement.getBoundingClientRect()
      ray.setFromCamera(new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2), camera)
      const hit = ray.intersectObjects(bodies.map(b => b.mesh))[0]
      const body = bodies.find(b => b.mesh === hit?.object)
      if (body) navigate.current(body.name)
    }
    let last = performance.now()
    renderer.setAnimationLoop((time) => {
      const dt = Math.min(.05, (time - last) / 1000); last = time
      if (flight < 1) {
        flight = Math.min(1, flight + dt / 1.15)
        const t = flight * flight * (3 - 2 * flight)
        camera.position.lerpVectors(from, end, t); controls.target.lerpVectors(startFocus, focus, t)
      }
      if (active === 'Vuelo libre') {
        const forward = Number(keys.has('w')) - Number(keys.has('s')), right = Number(keys.has('d')) - Number(keys.has('a'))
        const shift = camera.getWorldDirection(new T.Vector3()).multiplyScalar(forward).addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), right)
        shift.multiplyScalar(camera.position.distanceTo(controls.target) * dt)
        camera.position.add(shift); controls.target.add(shift)
      }
      controls.update(); renderer.render(scene, camera)
      // Las etiquetas se ocultan si el cuerpo está detrás de la cámara, fuera
      // de pantalla o si se solaparían con otra ya colocada.
      const occupied: number[][] = []
      for (const b of bodies) {
        const p = b.mesh.position.clone().project(camera)
        const x = (p.x + 1) * container.clientWidth / 2, y = (1 - p.y) * container.clientHeight / 2
        const visible = b.name !== active && p.z > -1 && p.z < 1 && Math.abs(p.x) < .96 && Math.abs(p.y) < .92 && !occupied.some(([a, c]) => Math.abs(a - x) < 76 && Math.abs(c - y) < 25)
        b.label.hidden = !visible
        if (visible) { occupied.push([x, y]); b.label.style.transform = 'translate(' + x + 'px,' + y + 'px)' }
      }
    })
    // Limpieza completa: al cambiar de ruta (paso 3) el WebGL no debe quedar
    // vivo en segundo plano; el navegador limita los contextos simultáneos.
    return () => {
      rig.current = null
      renderer.setAnimationLoop(null); disposed = true
      for (const texture of details.values()) texture.dispose()
      rings.dispose(); ringMaterial.dispose(); ringMap.dispose()
      resize.disconnect(); controls.dispose()
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur)
      for (const b of bodies) { b.mesh.geometry.dispose(); b.mesh.material.dispose(); b.map?.dispose(); b.label.remove() }
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  // Modo interactivo como flags de OrbitControls, sin recrear la escena: alternar
  // entre hero y visor no debe reiniciar WebGL ni volver a descargar texturas.
  // Declarado DESPUÉS del efecto de montaje para que `rig` ya exista.
  useEffect(() => {
    const r = rig.current
    if (!r) return
    // OrbitControls consume la rueda (preventDefault) solo si enableZoom es true:
    // apagarlo devuelve el scroll a la página. El arrastre para rotar sigue activo.
    r.controls.enableZoom = interactive
    r.controls.enablePan = interactive
    // OrbitControls fuerza touch-action:none al conectarse, lo que en móvil
    // bloquea el scroll vertical con el dedo sobre el 3D. En el hero lo
    // relajamos a pan-y: deslizar arriba/abajo hace scroll, horizontal rota.
    r.canvas.style.touchAction = interactive ? 'none' : 'pan-y'
  }, [interactive])

  return <div className="space" ref={host} aria-label="Mapa tridimensional del sistema solar" />
}
