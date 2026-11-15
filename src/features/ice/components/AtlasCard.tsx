import type { AtlasCatalog } from '../../../api/types'
import { highlightEs, periodEs } from '../data/texts'

const Ext = ({ href, children }: { href: string; children: string }) => (
  <a className="ice-link" href={href} target="_blank" rel="noopener noreferrer">
    {children}
    <span className="ice-sr"> (se abre en una pestaña nueva)</span>
  </a>
)

/** 3I/ATLAS: agua de fuera del sistema solar vista por SPHEREx (resultados publicados, citados). */
export default function AtlasCard({ atlas }: { atlas: AtlasCatalog }) {
  const obs = atlas.spherex_observations
  return (
    <section className="ice-panel" aria-labelledby="atlas-title">
      <h2 id="atlas-title" className="ice-h2">
        {atlas.name}, un cometa de otra estrella
      </h2>
      <p className="ice-lead">
        Es el tercer objeto que vemos llegar desde fuera del sistema solar. SPHEREx encontró hielo y vapor de agua en
        él, rodeados de una nube enorme de dióxido de carbono.
      </p>

      <dl className="ice-stats">
        {obs.periods.map((p) => (
          <div key={p.label}>
            <dt>{periodEs(p.label)}</dt>
            <dd>
              <span className="num">{p.n_spectral_images}</span> imágenes
            </dd>
          </div>
        ))}
        <div>
          <dt>Total</dt>
          <dd>
            <span className="num">{obs.n_spectral_images_total}</span> imágenes
          </dd>
        </div>
      </dl>

      {atlas.spherex_results.map((r) => (
        <article key={r.url} className="ice-result">
          <h3 className="ice-h3">
            <Ext href={r.url}>{r.title}</Ext>
          </h3>
          <p className="ice-ref">{r.reference}</p>
          <ul>
            {r.highlights.map((h) => (
              <li key={h}>{highlightEs(h)}</li>
            ))}
          </ul>
        </article>
      ))}

      <p className="ice-callout">
        {atlas.processed_by_us ? null : (
          <>
            <strong>Estas imágenes no las procesamos nosotros.</strong> Resumimos lo que publicó el equipo de SPHEREx
            y copiamos las cifras tal cual de sus artículos (revisados el{' '}
            <span className="num">{atlas.sources_checked.slice(0, 10)}</span>).{' '}
          </>
        )}
        Las {obs.n_spectral_images_total} imágenes y la posición del cometa en cada una están en{' '}
        <Ext href={atlas.irsa.page}>la página de IRSA</Ext> y se pueden abrir en el{' '}
        <Ext href={atlas.irsa.irsa_viewer}>IRSA Viewer</Ext>.
      </p>
      {atlas.news.map((n) => (
        <p key={n.url} className="ice-note">
          Noticia: <Ext href={n.url}>{n.title}</Ext>
        </p>
      ))}
    </section>
  )
}
