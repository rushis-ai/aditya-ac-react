import { useEffect, useRef, useState } from 'react'
import { StatusBadge } from './LeadRow.jsx'
import { addDays, fmtDate, serviceLabel, telLink, todayStr, waLink } from './lib.js'

function Field({ label, children }) {
  return (
    <div className="field">
      <dt>{label}</dt>
      <dd>{children || <span className="muted">—</span>}</dd>
    </div>
  )
}

// Quick answers after tapping Call or WhatsApp. Each one logs a note and moves a New lead along.
const OUTCOMES = {
  call: {
    ask: 'How did the call go?',
    options: [
      { label: 'Spoke to them', note: 'Call: spoke to them', contacted: true },
      { label: 'No answer', note: 'Call: no answer', retry: true },
      { label: 'Call back later', note: 'Call: asked to call back', contacted: true, retry: true }
    ]
  },
  wa: {
    ask: 'Did you send the WhatsApp message?',
    options: [{ label: 'Message sent', note: 'WhatsApp: message sent', contacted: true }]
  }
}

export default function LeadPanel({ lead, prompt, users, statuses, onUpdate, onNote, onClose }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState(prompt && lead.phone ? prompt : null)
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function addNote(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    if (await onNote(lead.id, text.trim())) setText('')
    setBusy(false)
  }

  function logOutcome(o) {
    setOutcome(null)
    onNote(lead.id, o.note)
    const changes = {}
    if (o.contacted && lead.status === 'New') changes.status = 'Contacted'
    // Try again tomorrow unless a later follow-up is already set
    if (o.retry && (!lead.followUp || lead.followUp <= todayStr())) changes.followUp = addDays(1)
    if (Object.keys(changes).length) onUpdate(lead.id, changes)
  }

  const save = (k) => (e) => onUpdate(lead.id, { [k]: e.target.value })
  const ask = outcome && OUTCOMES[outcome]

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label={`Lead: ${lead.name}`} onClick={(e) => e.stopPropagation()}>
        <header className="panel-head">
          <div>
            <h2>{lead.name || '(no name)'}</h2>
            <p className="muted small">Received {fmtDate(lead.date) || '—'}</p>
          </div>
          <button ref={closeRef} className="btn icon" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="panel-body">
          {lead.phone && (
            <div className="actions">
              <a className="btn primary" href={telLink(lead.phone)} onClick={() => setOutcome('call')}>Call {lead.phone}</a>
              <a className="btn wa" href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" onClick={() => setOutcome('wa')}>WhatsApp</a>
            </div>
          )}

          {ask && (
            <div className="outcome" role="group" aria-label={ask.ask}>
              <p><strong>{ask.ask}</strong></p>
              <div className="chips">
                {ask.options.map((o) => (
                  <button key={o.label} className="pill" onClick={() => logOutcome(o)}>{o.label}</button>
                ))}
                <button className="link small" onClick={() => setOutcome(null)}>Skip</button>
              </div>
            </div>
          )}

          <dl className="fields">
            <Field label="Service">{serviceLabel(lead.service)}</Field>
            <Field label="Message">{lead.message}</Field>
          </dl>

          <div className="controls">
            <label>
              Status <StatusBadge status={lead.status} />
              <select value={lead.status} onChange={save('status')}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Assigned to
              <select value={lead.assigned} onChange={save('assigned')}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u}>{u}</option>)}
                {lead.assigned && !users.includes(lead.assigned) && <option>{lead.assigned}</option>}
              </select>
            </label>
            <label>
              Follow-up date
              <input type="date" value={lead.followUp} onChange={save('followUp')} />
            </label>
            <div className="chips">
              <button className="chip" onClick={() => onUpdate(lead.id, { followUp: addDays(1) })}>Tomorrow</button>
              <button className="chip" onClick={() => onUpdate(lead.id, { followUp: addDays(3) })}>In 3 days</button>
              <button className="chip" onClick={() => onUpdate(lead.id, { followUp: addDays(7) })}>Next week</button>
              {lead.followUp && <button className="chip" onClick={() => onUpdate(lead.id, { followUp: '' })}>Clear</button>}
            </div>
          </div>

          <section>
            <h3>Notes and history</h3>
            <form className="note-form" onSubmit={addNote}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened on the call? Quote given, visit booked…" rows={3} maxLength={2000} />
              <button className="btn primary" disabled={busy || !text.trim()}>{busy ? 'Adding…' : 'Add note'}</button>
            </form>
            {lead.notes.length ? (
              <ol className="notes">
                {lead.notes.map((n, i) => (
                  <li key={i} className={n.kind === 'change' ? 'change' : undefined}>
                    <p>{n.text}</p>
                    <span className="muted small">{n.by} · {fmtDate(n.when)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty">No notes yet.</p>
            )}
          </section>

          <details className="source">
            <summary>Where this lead came from</summary>
            <dl className="fields">
              <Field label="First visit">{[lead.first_source, lead.first_medium].filter(Boolean).join(' / ')}</Field>
              <Field label="First page">{lead.first_landing}</Field>
              <Field label="Latest visit">{[lead.last_source, lead.last_medium].filter(Boolean).join(' / ')}</Field>
              <Field label="Campaign">{[lead.first_campaign, lead.last_campaign].filter((c) => c && c !== '(not set)').join(' → ')}</Field>
            </dl>
          </details>

          {lead.updatedBy && (
            <p className="muted small">Last updated by {lead.updatedBy}, {fmtDate(lead.updatedAt)}</p>
          )}
        </div>
      </aside>
    </div>
  )
}
