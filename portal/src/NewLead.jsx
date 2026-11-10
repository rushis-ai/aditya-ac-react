import { useEffect, useMemo, useRef, useState } from 'react'
import { StatusBadge } from './LeadRow.jsx'
import { SERVICES, fmtDate, samePhone } from './lib.js'

// Side panel for adding a lead that didn't come through the website
export default function NewLead({ leads, me, users, channels, onSave, onOpen, onClose }) {
  const [f, setF] = useState({ name: '', phone: '', channel: channels[0], service: '', message: '', assigned: users.includes(me) ? me : '', followUp: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Same number already in the list? Show it so nobody adds the same person twice.
  const existing = useMemo(() => leads.filter((l) => samePhone(l.phone, f.phone)).slice(0, 3), [leads, f.phone])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const err = await onSave(f)
    if (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Add a lead" onClick={(e) => e.stopPropagation()}>
        <header className="panel-head">
          <div>
            <h2>New lead</h2>
            <p className="muted small">For calls, walk-ins and referrals</p>
          </div>
          <button className="btn icon" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <form className="panel-body form" onSubmit={submit}>
          <label>
            Name
            <input ref={firstRef} value={f.name} onChange={set('name')} required maxLength={100} autoComplete="off" />
          </label>
          <label>
            Phone
            <input type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} required maxLength={16} autoComplete="off" />
          </label>

          {existing.length > 0 && (
            <div className="dupe" role="status">
              <strong>This number is already a lead</strong>
              {existing.map((l) => (
                <button type="button" key={l.id} className="dupe-row" onClick={() => onOpen(l.id)}>
                  <span>{l.name || '(no name)'} · {fmtDate(l.date, { time: false }) || 'no date'}</span>
                  <StatusBadge status={l.status} />
                </button>
              ))}
            </div>
          )}

          <fieldset className="chips-field">
            <legend>How did they reach you?</legend>
            <div className="chips">
              {channels.map((c) => (
                <button type="button" key={c} className={'pill' + (f.channel === c ? ' on' : '')} aria-pressed={f.channel === c} onClick={() => setF({ ...f, channel: c })}>
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            Service
            <select value={f.service} onChange={set('service')}>
              <option value="">Not sure yet</option>
              {Object.entries(SERVICES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>
            What do they need?
            <textarea value={f.message} onChange={set('message')} rows={3} maxLength={2000} />
          </label>
          <div className="two">
            <label>
              Assigned to
              <select value={f.assigned} onChange={set('assigned')}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u}>{u}</option>)}
              </select>
            </label>
            <label>
              Follow-up date
              <input type="date" value={f.followUp} onChange={set('followUp')} />
            </label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary wide" disabled={busy}>{busy ? 'Adding…' : 'Add lead'}</button>
        </form>
      </aside>
    </div>
  )
}
