import type { SkySeries } from '../../../api/sky'
import FalseColor from './FalseColor'

export default function SciencePanel({ series, detector }: { series: SkySeries; detector: number }) {
  const analysis = series.analysis
  const curve = analysis?.light_curves.find(c => c.detector === detector)
  const deep = analysis?.deep_images.find(d => d.detector === detector)
  const differences = analysis?.difference_images.filter(d => d.detector === detector) ?? []
  const points = curve?.per_epoch.filter(p => p.flux !== null && Number.isFinite(p.flux)) ?? []
  return <section className="skyviewer-panel">
    <h2 className="skyviewer-panel-title">CIENCIA Y PROCEDENCIA · D{detector}</h2>
    <p className="skyviewer-note">{series.manifest.source.collections.join(' + ')} · Campo {series.manifest.fov_arcmin}′ · {series.manifest.image_size_px.join(' × ')} píxeles · {series.manifest.pixel_scale_arcsec}″/píxel.</p>
    <FalseColor key={series.directory} series={series} />
    <div className="skyviewer-analysis-images">
      {deep && <figure><img src={series.directory + deep.file} alt={'Imagen profunda del detector ' + detector} /><figcaption>Imagen profunda · pasadas combinadas</figcaption></figure>}
      {differences.map(d => <figure key={d.file}><img src={series.directory + d.file} alt={'Resta científica ' + d.to + ' menos ' + d.from} /><figcaption>{d.from} → {d.to} · resta calibrada</figcaption>{d.caveats.length > 0 && <p className="skyviewer-note">Precauciones: {d.caveats.join(', ')}</p>}</figure>)}
    </div>
    {curve && <><h3>Brillo entre pasadas</h3>
      <p className="skyviewer-note">Fotometría corregida por forma espectral · {curve.units}. {curve.usable ? 'Consulta los errores y límites antes de interpretar cambios.' : 'Medición no utilizable para conclusiones científicas.'}</p>
      <div className="skyviewer-table-wrap"><table className="skyviewer-table"><thead><tr><th>Pasada</th><th>Fecha UT</th><th>Flujo ({curve.units})</th><th>Error</th><th>Calidad</th></tr></thead>
        <tbody>{points.map(p => <tr key={p.epoch}><td>{p.epoch}</td><td>{new Date((p.mjd - 40587) * 86400000).toISOString().slice(0, 10)}</td><td>{p.flux?.toFixed(3)}</td><td>{p.err?.toFixed(3) ?? '—'}</td><td>{p.lower_limit ? 'Límite inferior (saturación)' : 'Medición'}</td></tr>)}</tbody></table></div>
      {!points.length && <p className="skyviewer-note">No hay mediciones válidas de brillo para este detector.</p>}
    </>}
    <p className="skyviewer-note">Las restas calibradas muestran azul = menor brillo/posición anterior y rojo = mayor brillo/posición nueva. Diferencias de longitud de onda y saturación pueden producir residuos; no demuestran variabilidad por sí solas.</p>
    <p className="skyviewer-note">El espectro y el catálogo de hielo aún no están disponibles en estos productos. Las bandas de referencia del mapa son orientativas; no se ha confirmado agua en estos objetivos.</p>
    <a href={series.directory + 'manifest.json'} target="_blank" rel="noreferrer">Ver metadatos originales ↗</a>
  </section>
}
