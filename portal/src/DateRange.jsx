import { PRESETS, rangeFrom } from './lib.js'

// value: { preset, from, to }. Picking a preset fills the dates; editing a date switches to "custom".
export default function DateRange({ value, onChange }) {
  return (
    <div className="range">
      <div className="range-presets" role="group" aria-label="Date range">
        {PRESETS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={'pill' + (value.preset === k ? ' on' : '')}
            aria-pressed={value.preset === k}
            onClick={() => onChange(rangeFrom(k))}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="range-custom">
        <label>
          <span>From</span>
          <input type="date" value={value.from} max={value.to || undefined}
            onChange={(e) => onChange({ preset: 'custom', from: e.target.value, to: value.to })} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={value.to} min={value.from || undefined}
            onChange={(e) => onChange({ preset: 'custom', from: value.from, to: e.target.value })} />
        </label>
      </div>
    </div>
  )
}
