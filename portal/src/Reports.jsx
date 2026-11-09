import { useMemo, useState } from 'react'
import { monthLabel, serviceLabel } from './lib.js'

// Groups leads by key and counts total / won / lost-or-spam
function tally(leads, key) {
  const m = new Map()
  for (const l of leads) {
    const k = key(l) || '(unknown)'
    const r = m.get(k) || { k, total: 0, won: 0, open: 0 }
    r.total++
    if (l.status === 'Won') r.won++
    if (!['Won', 'Lost', 'Spam'].includes(l.status)) r.open++
    m.set(k, r)
  }
  return [...m.values()].sort((a, b) => b.total - a.total)
}

function Table({ title, rows }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th></th><th>Leads</th><th>Open</th><th>Won</th><th>Win rate</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k}>
                <th scope="row">{r.k}</th>
                <td>{r.total}</td>
                <td>{r.open}</td>
                <td>{r.won}</td>
                <td>{r.total ? Math.round((r.won / r.total) * 100) + '%' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function Reports({ leads, statuses }) {
  const months = useMemo(() => [...new Set(leads.map((l) => l.date.slice(0, 7)).filter(Boolean))].sort().reverse(), [leads])
  const [month, setMonth] = useState(months[0] || '')
  const scoped = month ? leads.filter((l) => l.date.startsWith(month)) : leads
  const counts = Object.fromEntries(statuses.map((s) => [s, scoped.filter((l) => l.status === s).length]))

  return (
    <div className="stack">
      <section className="card">
        <div className="list-head">
          <h2>Summary</h2>
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Period">
            <option value="">All time</option>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
        <div className="stats">
          <div className="stat"><span className="stat-n">{scoped.length}</span><span className="muted small">Leads</span></div>
          {statuses.map((s) => (
            <div className="stat" key={s}><span className="stat-n">{counts[s]}</span><span className="muted small">{s}</span></div>
          ))}
        </div>
      </section>
      <Table title="By source (first visit)" rows={tally(scoped, (l) => l.first_source)} />
      <Table title="By service" rows={tally(scoped, (l) => serviceLabel(l.service))} />
      <Table title="By team member" rows={tally(scoped, (l) => l.assigned || 'Unassigned')} />
    </div>
  )
}
