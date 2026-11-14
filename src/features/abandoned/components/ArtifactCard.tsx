import { BODY_LABEL, TBD, type Artifact } from '../data/artifacts'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="abandoned-field">
      <dt className="abandoned-field-label">{label}</dt>
      <dd className={value === TBD ? 'abandoned-field-value abandoned-tbd' : 'abandoned-field-value'}>
        {value}
      </dd>
    </div>
  )
}

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="abandoned-source" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="abandoned-sr"> (se abre en una pestaña nueva)</span>
    </a>
  )
}

export default function ArtifactCard({ artifact: a }: { artifact: Artifact }) {
  return (
    <article className="abandoned-card">
      <span className="abandoned-tag">{BODY_LABEL[a.body].toUpperCase()}</span>
      <h2 className="abandoned-card-title">{a.name}</h2>
      <dl className="abandoned-fields">
        <Field label={a.arrivalLabel} value={a.arrival} />
        <Field label="Lugar" value={a.place} />
        <Field label="Coordenadas" value={a.coords} />
        <Field label="Estado actual" value={a.status} />
        <Field label="Qué pasó" value={a.whatHappened} />
        <Field label="Fin" value={a.endDate} />
        {a.note && <Field label="Nota" value={a.note} />}
      </dl>
      <div className="abandoned-sources">
        <SourceLink href={a.sourceUrl}>Fuente: NASA</SourceLink>
        {a.extraSources?.map((s) => (
          <SourceLink key={s.url} href={s.url}>
            {`Fuente adicional: ${s.label}`}
          </SourceLink>
        ))}
      </div>
    </article>
  )
}
