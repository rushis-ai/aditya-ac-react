import { useMemo, useState } from 'react'
import LeadsTable from './LeadsTable.jsx'
import DateRange from './DateRange.jsx'
import { SERVICES, CLOSED, downloadCsv, inRange, sourceOf, rangeFrom } from './lib.js'

const PAGE = 50

export default function Leads({ leads, statuses, users, onOpen }) {
  const [range, setRange] = useState(() => rangeFrom('all'))
  const [f, setF] = useState({ q: '', status: 'open', service: '', source: '', assigned: '' })
  const [shown, setShown] = useState(PAGE)
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setShown(PAGE) }

  const sources = useMemo(() => [...new Set(leads.map(sourceOf))].sort(), [leads])

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const qd = q.replace(/\D/g, '')
    const r = [range.from, range.to]
    return leads.filter((l) => {
      if (!inRange(l, r)) return false
      if (f.status === 'open' ? CLOSED.includes(l.status) : f.status && l.status !== f.status) return false
      if (f.service && l.service !== f.service) return false
      if (f.source && sourceOf(l) !== f.source) return false
      if (f.assigned && (f.assigned === '-' ? l.assigned : l.assigned !== f.assigned)) return false
      if (q && !(l.name.toLowerCase().includes(q) || l.message.toLowerCase().includes(q) || (qd.length >= 3 && l.phone.includes(qd)))) return false
      return true
    })
  }, [leads, f, range])

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p className="muted">Every enquiry from the website. Click a lead to call, update or add notes.</p>
        </div>
        <button className="btn" onClick={() => downloadCsv(list)} disabled={!list.length}>Export CSV</button>
      </div>

      <section className="card filters">
        <DateRange value={range} onChange={(v) => { setRange(v); setShown(PAGE) }} />
        <div className="filter-grid">
          <input type="search" placeholder="Search name, phone or message" value={f.q} onChange={set('q')} aria-label="Search" />
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
        </div>
      </section>

      <section className="card flush">
        <div className="card-head">
          <h2>{list.length} {list.length === 1 ? 'lead' : 'leads'}</h2>
        </div>
        {list.length ? (
          <LeadsTable leads={list.slice(0, shown)} onOpen={onOpen} />
        ) : (
          <p className="empty pad">No leads match these filters.</p>
        )}
        {list.length > shown && (
          <div className="pad">
            <button className="btn wide" onClick={() => setShown(shown + PAGE)}>Show more ({list.length - shown} left)</button>
          </div>
        )}
      </section>
    </div>
  )
}
