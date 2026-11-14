import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import positions from './positions.json'
import './App.css'

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

export default function App(){
  const host = useRef<HTMLDivElement>(null)
  const navigate = useRef<(v:View)=>void>(()=>{})
  const [view,setView] = useState<View>('Tierra')
  const [credits,setCredits] = useState(false)
  const [error,setError] = useState(false)
  useEffect(()=>{
    const container=host.current!
    let renderer:T.WebGLRenderer
    try { renderer=new T.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true}) }
    catch {setError(true); return}
    const scene=new T.Scene(), camera=new T.PerspectiveCamera(42,1,1,3e10)
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
      const mesh=new T.Mesh(new T.SphereGeometry(r,80,48),material)
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
      active=next; setView(next)
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
      controls.update();renderer.render(scene,camera)
      const occupied:number[][]=[]
      for(const b of bodies){
        const p=b.mesh.position.clone().project(camera)
        const x=(p.x+1)*container.clientWidth/2,y=(1-p.y)*container.clientHeight/2
        const visible=b.name!==active && p.z>-1 && p.z<1 && Math.abs(p.x)<.96 && Math.abs(p.y)<.92 && !occupied.some(([a,c])=>Math.abs(a-x)<76 && Math.abs(c-y)<25)
        b.label.hidden=!visible
        if(visible){occupied.push([x,y]);b.label.style.transform='translate('+x+'px,'+y+'px)'}
      }
    })
    return ()=>{renderer.setAnimationLoop(null);disposed=true;for(const texture of details.values())texture.dispose();rings.dispose();ringMaterial.dispose();ringMap.dispose();resize.disconnect();controls.dispose();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);for(const b of bodies){b.mesh.geometry.dispose();b.mesh.material.dispose();b.map?.dispose();b.label.remove()}renderer.dispose();renderer.domElement.remove()}
  },[])
  const body=catalog.find(b=>b[0]===view)
  return <main><div className="space" ref={host} aria-label="Mapa tridimensional del sistema solar"/><header><b>◉ &nbsp; Ruta del Agua</b><select aria-label="Ir a un destino" value="" onChange={e=>navigate.current(e.target.value as View)}><option value="" disabled>Ir a un destino ↓</option>{catalog.map(([n])=><option key={n}>{n}</option>)}</select></header>
  <section><small>EXPLORADOR DEL SISTEMA SOLAR</small><h1>{view}</h1>{body?<p>Radio medio · {format(body[1])} km<br/>Distancia al Sol · {format(Math.hypot(...positions[body[0]]))} km</p>:<p>{view==='Vuelo libre'?'W/S para avanzar y retroceder · A/D para desplazarte':'Selecciona un cuerpo para acercarte'}</p>}</section>
  {error&&<aside>El visor requiere WebGL. Activa la aceleración gráfica para abrir el mapa.</aside>}
  <footer><nav>{(['Sistema solar','Tierra','Luna','Marte','Vuelo libre'] as View[]).map(n=><button key={n} aria-pressed={view===n} onClick={()=>navigate.current(n)}>{n}</button>)}</nav><div className="meta"><span>14 NOV 2026 · 00:00 TDB</span><button onClick={()=>setCredits(!credits)}>Datos y créditos {credits?'−':'+'}</button></div>{credits&&<div className="sources">Posiciones heliocéntricas · eclíptica J2000 · <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a>. Texturas: <a href="https://threejs.org/examples/textures/planets/">Tierra / Three.js</a>, <a href="https://svs.gsfc.nasa.gov/4720/">Luna / NASA</a>, <a href="https://www.solarsystemscope.com/textures/">Sol, planetas y anillos / Solar System Scope (CC BY 4.0)</a>. Orientación de las superficies ilustrativa.</div>}</footer></main>
}


