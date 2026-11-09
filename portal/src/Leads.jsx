import { useMemo, useState } from 'react'
import LeadRow from './LeadRow.jsx'
import { SERVICES, downloadCsv, sourceOf } from './lib.js'

const PAGE = 100

export default function Leads({ leads, statuses, users, onOpen }) {
  const [f, setF] = useState({ q: '', status: 'open', service: '', source: '', assigned: '', from: '', to: '' })
  const [shown, setShown] = useState(PAGE)
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setShown(PAGE) }

  const sources = useMemo(() => [...new Set(leads.map(sourceOf))].sort(), [leads])

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const qd = q.replace(/\D/g, '')
    return leads.filter((l) => {
      if (f.status === 'open' ? ['Won', 'Lost', 'Spam'].includes(l.status) : f.status && l.status !== f.status) return false
      if (f.service && l.service !== f.service) return false
      if (f.source && sourceOf(l) !== f.source) return false
      if (f.assigned && (f.assigned === '-' ? l.assigned : l.assigned !== f.assigned)) return false
      const day = l.date.slice(0, 10)
      if (f.from && day < f.from) return false
      if (f.to && day > f.to) return false
      if (q && !(l.name.toLowerCase().includes(q) || l.message.toLowerCase().includes(q) || (qd.length >= 3 && l.phone.includes(qd)))) return false
      return true
    })
  }, [leads, f])

  return (
    <div className="stack">
      <section className="card filters">
        <input type="search" placeholder="Search name, phone or message" value={f.q} onChange={set('q')} aria-label="Search" />
        <div className="filter-grid">
          <select value={f.status} onChange={set('status')} aria-label="Status">
            <option value="open">Open leads</option>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={f.service} onChange={set('service')} aria-label="Service">
            <option value="">All services</option>
            {Object.entries(SERVICES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={f.source} onChange={set('source')} aria-label="Source">
            <option value="">All sources</option>
            {sources.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={f.assigned} onChange={set('assigned')} aria-label="Assigned to">
            <option value="">Anyone</option>
            <option value="-">Unassigned</option>
            {users.map((u) => <option key={u}>{u}</option>)}
          </select>
          <label className="date-field">From <input type="date" value={f.from} onChange={set('from')} /></label>
          <label className="date-field">To <input type="date" value={f.to} onChange={set('to')} /></label>
        </div>
      </section>

      <section className="card">
        <div className="list-head">
          <h2>{list.length} {list.length === 1 ? 'lead' : 'leads'}</h2>
          <button className="btn" onClick={() => downloadCsv(list)} disabled={!list.length}>Export CSV</button>
        </div>
        {list.length ? (
          <ul className="list">{list.slice(0, shown).map((l) => <LeadRow key={l.id} lead={l} onOpen={onOpen} />)}</ul>
        ) : (
          <p className="empty">No leads match these filters.</p>
        )}
        {list.length > shown && (
          <button className="btn wide" onClick={() => setShown(shown + PAGE)}>Show more ({list.length - shown} left)</button>
        )}
      </section>
    </div>
  )
}
