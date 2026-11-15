import { BODY_LABEL, type Body } from '../data/artifacts'

export type Filter = 'all' | Body

const options: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'moon', label: BODY_LABEL.moon },
  { value: 'mars', label: BODY_LABEL.mars },
  { value: 'beyond', label: BODY_LABEL.beyond },
]

type Props = { value: Filter; onChange: (f: Filter) => void; shown: number; total: number }

export default function FilterBar({ value, onChange, shown, total }: Props) {
  return (
    <div className="abandoned-filters">
      <div role="group" aria-label="Filtrar por lugar" className="abandoned-filter-buttons">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="abandoned-filter"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="abandoned-count" aria-live="polite">
        {shown} de {total} fichas
      </p>
    </div>
  )
}
