import { createStarfield, starCount } from './starfield'
import { apolloSites, missionSites, normalAt, roverPath, roverSites, type SurfaceSite } from './surfaceScene'
import { getMoonSites } from '../../api/moon'
import { getMarsWalk } from '../../api/mars'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import positions from './data/positions.json'
import './solar-system.css'

type Body = keyof typeof positions
type View = Body | 'Sistema solar' | 'Vuelo libre'
const catalog: [Body, number, string][] = [
  ['Sol',695700,'#ffda88'],['Mercurio',2439.4,'#bcb4ab'],['Venus',6051.8,'#e8ce9d'],
  ['Tierra',6371,'#86c4ed'],['Luna',1737.4,'#cecac6'],['Marte',3389.5,'#cf8667'],
  ['Júpiter',69911,'#d6ba98'],['Saturno',58232,'#decfa3'],['Urano',25362,'#9fdbe0'],['Neptuno',24622,'#779cd7']]
const textures: Record<Body,string> = {
  Sol:'2k_sun', Mercurio:'2k_mercury', Venus:'2k_venus_atmosphere', Tierra:'tierra',
  Luna:'luna', Marte:'marte', Júpiter:'2k_jupiter', Saturno:'2k_saturn', Urano:'2k_uranus', Neptuno:'2k_neptune'
}
const format = (n:number) => n.toLocaleString('es-BO',{maximumFractionDigits:0})

export default function SolarSystemPage(){
  const host = useRef<HTMLDivElement>(null)
  const navigate = useRef<(v:View)=>void>(()=>{})
  const [view,setView] = useState<View>('Tierra')
  const [sites,setSites] = useState<SurfaceSite[]>(missionSites)
  const [site,setSite] = useState<SurfaceSite | null>(null)
  const [pathKm,setPathKm] = useState<number | null>(null)
  const [loadError,setLoadError] = useState('')
  const visit = useRef<(s:SurfaceSite)=>void>(()=>{})
  const [credits,setCredits] = useState(false)
  const [error,setError] = useState(false)
  useEffect(()=>{
    const container=host.current!
    let renderer:T.WebGLRenderer
    try { renderer=new T.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true}) }
    catch {setError(true); return}
    const scene=new T.Scene(), camera=new T.PerspectiveCamera(42,1,1,3e10)
    const stars=createStarfield()
    scene.add(stars)
    renderer.setPixelRatio(Math.min(devicePixelRatio,2))
    container.append(renderer.domElement)
    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.maxDistance=1.4e10
    const lamp=new T.PointLight(0xffffff,2,0,0)
    scene.add(lamp,new T.AmbientLight(0xe6efff,0.54))
    const loader=new T.TextureLoader()
    const bodies=catalog.map(([name,r,color])=>{
      const file=textures[name]
      const map=file ? loader.load(import.meta.env.BASE_URL+'textures/'+file+'.jpg') : null
      if(map){map.colorSpace=T.SRGBColorSpace; map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}
      const material=name==='Sol'?new T.MeshBasicMaterial({color:0xffffff,map}):new T.MeshStandardMaterial({color:map?'white':color,map,roughness:1})
      const mesh=new T.Mesh(new T.SphereGeometry(r,name==='Marte'||name==='Luna'?256:80,name==='Marte'||name==='Luna'?160:48),material)
      const [x,y,z]=positions[name]
      mesh.position.set(x,z,-y)
      scene.add(mesh)
      const label=document.createElement('button')
      label.className='marker'; label.textContent=name
      label.onclick=()=>navigate.current(name)
      container.append(label)
      return {name,r,mesh,label,map}
    })
    const saturn=bodies.find(body=>body.name==='Saturno')!
    const rings=new T.RingGeometry(74500,140220,192)
    const vertices=rings.attributes.position
    for(let i=0;i<vertices.count;i++){
      const radius=Math.hypot(vertices.getX(i),vertices.getY(i))
      rings.attributes.uv.setXY(i,(radius-74500)/(140220-74500),0.5)
    }
    const ringMap=loader.load(import.meta.env.BASE_URL+'textures/2k_saturn_ring_alpha.png')
    ringMap.colorSpace=T.SRGBColorSpace
    const ringMaterial=new T.MeshBasicMaterial({map:ringMap,side:T.DoubleSide,transparent:true,depthWrite:false})
    const ring=new T.Mesh(rings,ringMaterial)
    ring.rotation.x=Math.PI/2-0.47
    saturn.mesh.add(ring)
    const detailFiles: Partial<Record<Body,string>>={Tierra:'8k_earth_daymap',Marte:'8k_mars'}
    const details=new Map<Body,T.Texture>()
    let disposed=false
    let active:View='Tierra', flight=1
    const from=new T.Vector3(), end=new T.Vector3(), startFocus=new T.Vector3(), focus=new T.Vector3()
    navigate.current=(next)=>{
      active=next; setView(next); setSite(null)
      controls.enablePan=true
      if(next==='Vuelo libre'){flight=1;return}
      const body=bodies.find(b=>b.name===next)
      const detail=body && detailFiles[body.name]
      if(body && detail && renderer.capabilities.maxTextureSize>=8192 && !details.has(body.name)){
        const texture=loader.load(import.meta.env.BASE_URL+'textures/'+detail+'.jpg',loaded=>{
          if(disposed)return
          loaded.colorSpace=T.SRGBColorSpace
          loaded.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())
          body.mesh.material.map=loaded
          body.mesh.material.needsUpdate=true
        })
        details.set(body.name,texture)
      }
      focus.copy(body?.mesh.position??new T.Vector3())
      controls.minDistance=body?body.r*1.08:1
      const direction=body && next!=='Sol'?body.mesh.position.clone().negate().normalize():new T.Vector3(0,0,1)
      direction.y+=0.52
      end.copy(focus).addScaledVector(direction.normalize(),body?body.r*(next==='Saturno'?7.5:4.3):1.3e10)
      from.copy(camera.position);startFocus.copy(controls.target);flight=0
    }
    const pins: {site: SurfaceSite; button: HTMLButtonElement; normal:T.Vector3}[]=[]
    const allSites=missionSites()
    let trail: ReturnType<typeof roverPath> | undefined
    const addPins=(items: SurfaceSite[])=>{
      for (const item of items) {
        const button=document.createElement('button')
        button.className='surface-pin '+item.kind
        button.title=item.name
        button.setAttribute('aria-label',item.name)
        button.hidden=true
        button.onclick=()=>visit.current(item)
        container.append(button)
        pins.push({site:item,button,normal:normalAt(item.lat,item.lon)})
      }
    }
    const loadSites=(extra: SurfaceSite[])=>{
      addPins(extra)
      allSites.push(...extra)
      setSites([...allSites])
    }
    addPins(allSites)
    getMoonSites().then(data=>{if(!disposed)loadSites(apolloSites(data))})
      .catch(()=>{if(!disposed)setLoadError('No se pudo cargar el catálogo Apollo.')})
    getMarsWalk().then(walk=>{
      if(disposed)return
      const mars=bodies.find(b=>b.name==='Marte')!
      trail=roverPath(walk,mars.r)
      mars.mesh.add(trail)
      setPathKm(walk.route.length_km)
      loadSites(roverSites(walk))
    }).catch(()=>{if(!disposed)setLoadError('No se pudo cargar el recorrido de Jezero.')})
    visit.current=item=>{
      navigate.current(item.body)
      setSite(item)
      const body=bodies.find(b=>b.name===item.body)!
      controls.minDistance=body.r+1
      const altitude=item.kind==='route'?65:body.r*0.14
      end.copy(body.mesh.position).addScaledVector(normalAt(item.lat,item.lon),body.r+altitude)
    }
    navigate.current('Tierra');camera.position.copy(end);controls.target.copy(focus);flight=1
    const resize=new ResizeObserver(()=>{
      const w=container.clientWidth,h=container.clientHeight
      renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()
    })
    resize.observe(container)
    const keys=new Set<string>()
    const down=(e:KeyboardEvent)=>{if(!(e.target instanceof HTMLSelectElement))keys.add(e.key.toLowerCase())}
    const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
    const blur=()=>keys.clear()
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur)
    const ray=new T.Raycaster(), press=new T.Vector2()
    renderer.domElement.onpointerdown=e=>press.set(e.clientX,e.clientY)
    renderer.domElement.onpointerup=e=>{
      if(press.distanceTo(new T.Vector2(e.clientX,e.clientY))>5)return
      const rect=renderer.domElement.getBoundingClientRect()
      ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera)
      const hit=ray.intersectObjects(bodies.map(b=>b.mesh))[0]
      const body=bodies.find(b=>b.mesh===hit?.object)
      if(body)navigate.current(body.name)
    }
    let last=performance.now()
    renderer.setAnimationLoop((time)=>{
      const dt=Math.min(.05,(time-last)/1000);last=time
      if(flight<1){
        flight=Math.min(1,flight+dt/1.15)
        const t=flight*flight*(3-2*flight)
        camera.position.lerpVectors(from,end,t); controls.target.lerpVectors(startFocus,focus,t)
      }
      if(active==='Vuelo libre'){
        const forward=Number(keys.has('w'))-Number(keys.has('s')), right=Number(keys.has('d'))-Number(keys.has('a'))
        const shift=camera.getWorldDirection(new T.Vector3()).multiplyScalar(forward).addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),right)
        shift.multiplyScalar(camera.position.distanceTo(controls.target)*dt)
        camera.position.add(shift); controls.target.add(shift)
      }
      controls.update()
      stars.position.copy(camera.position)
      renderer.render(scene,camera)
      const selectedBody=bodies.find(b=>b.name===active)
      for(const pin of pins){
        const match=selectedBody && pin.site.body===active
        if(!match){pin.button.hidden=true;continue}
        const world=pin.normal.clone().multiplyScalar(selectedBody.r).add(selectedBody.mesh.position)
        const facing=camera.position.clone().sub(world).dot(pin.normal)>0
        const projected=world.project(camera)
        pin.button.hidden=!facing || projected.z<=-1 || projected.z>=1 || Math.abs(projected.x)>1 || Math.abs(projected.y)>1
        if(!pin.button.hidden){
          pin.button.style.left=(50+50*projected.x)+'%'
          pin.button.style.top=(50-50*projected.y)+'%'
        }
      }
      const occupied:number[][]=[]
      for(const b of bodies){
        const p=b.mesh.position.clone().project(camera)
        const x=(p.x+1)*container.clientWidth/2,y=(1-p.y)*container.clientHeight/2
        const visible=b.name!==active && p.z>-1 && p.z<1 && Math.abs(p.x)<.96 && Math.abs(p.y)<.92 && !occupied.some(([a,c])=>Math.abs(a-x)<76 && Math.abs(c-y)<25)
        b.label.hidden=!visible
        if(visible){occupied.push([x,y]);b.label.style.transform='translate('+x+'px,'+y+'px)'}
      }
    })
    return ()=>{renderer.setAnimationLoop(null);disposed=true;for(const pin of pins)pin.button.remove();trail?.geometry.dispose();trail?.material.dispose();for(const child of stars.children){const points=child as T.Points<T.BufferGeometry,T.PointsMaterial>;points.geometry.dispose();points.material.dispose()}for(const texture of details.values())texture.dispose();rings.dispose();ringMaterial.dispose();ringMap.dispose();resize.disconnect();controls.dispose();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);for(const b of bodies){b.mesh.geometry.dispose();b.mesh.material.dispose();b.map?.dispose();b.label.remove()}renderer.dispose();renderer.domElement.remove()}
  },[])
  const body=catalog.find(b=>b[0]===view)
  return <main className="sky"><div className="space" ref={host} aria-label="Mapa tridimensional del sistema solar"/><header><Link to="/" className="brand">◉ &nbsp; Ruta del Agua</Link><select aria-label="Ir a un destino" value="" onChange={e=>navigate.current(e.target.value as View)}><option value="" disabled>Ir a un destino ↓</option>{catalog.map(([n])=><option key={n}>{n}</option>)}</select></header>
  <section><small>EXPLORADOR DEL SISTEMA SOLAR</small><h1>{view}</h1>{body?<p>Radio medio · {format(body[1])} km<br/>Distancia al Sol · {format(Math.hypot(...positions[body[0]]))} km</p>:<p>{view==='Vuelo libre'?'W/S para avanzar y retroceder · A/D para desplazarte':'Selecciona un cuerpo para acercarte'}</p>}</section>
  {(view==='Marte' || view==='Luna') && <div className="mission-inspector">
    <label>Misiones en {view}
      <select value={site?.id??''} onChange={e=>{const item=sites.find(s=>s.id===e.target.value);if(item)visit.current(item)}}>
        <option value="" disabled>Explorar un lugar</option>
        {sites.filter(s=>s.body===view).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </label>
    {site && <div aria-live="polite"><strong>{site.name}</strong><p>{site.story}</p>
      <a href={site.source} target="_blank" rel="noreferrer">Fuente de la misión</a></div>}
    {view==='Marte' && pathKm!==null && <button className="trail-link" onClick={()=>{const start=sites.find(s=>s.id==='landing');if(start)visit.current(start)}}>Ver ruta de Perseverance · {pathKm.toFixed(1)} km</button>}
    <Link to={view==='Marte'?'/marte':'/luna'}>Abrir mapa de superficie →</Link>
    {loadError && <p>{loadError}</p>}
  </div>}
  {error&&<aside>El visor requiere WebGL. Activa la aceleración gráfica para abrir el mapa.</aside>}
  <footer><nav>{(['Sistema solar','Tierra','Luna','Marte','Vuelo libre'] as View[]).map(n=><button key={n} aria-pressed={view===n} onClick={()=>navigate.current(n)}>{n}</button>)}</nav><div className="meta"><span>14 NOV 2026 · 00:00 TDB</span><button onClick={()=>setCredits(!credits)}>Datos y créditos {credits?'−':'+'}</button></div>{credits&&<div className="sources">Fondo estelar · {starCount.hipparcos.toLocaleString('es')} estrellas de <a href="https://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=I/239">Hipparcos</a> (V &lt; 6,5) y {starCount.gaia.toLocaleString('es')} fuentes de los campos locales de <a href="https://gea.esac.esa.int/archive/">Gaia DR3</a>. Se representan direcciones celestes. Posiciones heliocéntricas · eclíptica J2000 · <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a>. Texturas: <a href="https://threejs.org/examples/textures/planets/">Tierra / Three.js</a>, <a href="https://svs.gsfc.nasa.gov/4720/">Luna / NASA</a>, <a href="https://www.solarsystemscope.com/textures/">Sol, planetas y anillos / Solar System Scope (CC BY 4.0)</a>. Orientación de las superficies ilustrativa.</div>}</footer></main>
}


