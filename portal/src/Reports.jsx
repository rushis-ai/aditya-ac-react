import { useMemo, useState } from 'react'
import DateRange from './DateRange.jsx'
import LeadsTable from './LeadsTable.jsx'
import {
  SERVICES, CLOSED, serviceLabel, sourceOf, inRange, rangeLabel, daysBetween, shiftDay, parseDay, dateStr,
  todayStr, monthLabel, fmtDate, downloadCsv, rangeFrom
} from './lib.js'

const STAGES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam']
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

// ---------- grouping ----------
function breakdown(leads, keyOf, labelOf) {
  const m = new Map()
  for (const l of leads) {
    const k = keyOf(l) || '(unknown)'
    const r = m.get(k) || { k, label: labelOf ? labelOf(k) : k, total: 0, ...Object.fromEntries(STAGES.map((s) => [s, 0])) }
    r.total++
    r[l.status] = (r[l.status] || 0) + 1
    m.set(k, r)
  }
  return [...m.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
}

// Daily buckets up to ~2 months, weekly up to a year, monthly beyond
function buckets(leads, from, to) {
  const days = daysBetween(from, to)
  const unit = days <= 62 ? 'day' : days <= 370 ? 'week' : 'month'
  const keyOf = (day) => {
    if (unit === 'day') return day
    if (unit === 'month') return day.slice(0, 7)
    const d = parseDay(day)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Monday
    return dateStr(d)
  }
  const out = new Map()
  for (let d = from; d <= to; d = shiftDay(d, 1)) {
    const k = keyOf(d)
    if (!out.has(k)) out.set(k, { k, n: 0, won: 0 })
  }
  for (const l of leads) {
    const b = out.get(keyOf(l.date.slice(0, 10)))
    if (b) { b.n++; if (l.status === 'Won') b.won++ }
  }
  const label = (k) => (unit === 'month' ? monthLabel(k) : unit === 'week' ? 'Week of ' + fmtDate(k, { time: false }) : fmtDate(k, { time: false }))
  return { unit, list: [...out.values()].map((b) => ({ ...b, label: label(b.k) })) }
}

// ---------- pieces ----------
function Kpi({ label, value, sub, delta }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {delta !== undefined && delta !== null && (
        <span className={'kpi-delta ' + (delta > 0 ? 'up' : delta < 0 ? 'down' : '')}>
          {delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : ''}{delta === 0 ? 'Same as' : Math.abs(delta) + (delta > 0 ? ' more than' : ' fewer than')} previous period
        </span>
      )}
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  )
}

function TrendChart({ data, unit }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...data.map((d) => d.n))
  const step = max <= 4 ? 1 : Math.ceil(max / 4)
  const top = Math.ceil(max / step) * step
  const ticks = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  const every = Math.ceil(data.length / 8)

  return (
    <div className="chart">
      <div className="chart-plot">
        <div className="chart-y" aria-hidden="true">
          {ticks.slice().reverse().map((v) => <span key={v}>{v}</span>)}
        </div>
        <div className="chart-area">
          {ticks.map((v) => <div key={v} className="gridline" style={{ bottom: `${(v / top) * 100}%` }} />)}
          <div className="bars" onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <button
                key={d.k}
                type="button"
                className="bar-hit"
                aria-label={`${d.label}: ${d.n} leads, ${d.won} won`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <span className={'bar' + (hover === i ? ' hot' : '')} style={{ height: `${(d.n / top) * 100}%` }} />
              </button>
            ))}
          </div>
          {hover !== null && data[hover] && (
            <div className="tip" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
              <strong>{data[hover].label}</strong>
              <span>{data[hover].n} {data[hover].n === 1 ? 'lead' : 'leads'} · {data[hover].won} won</span>
            </div>
          )}
        </div>
      </div>
      <div className="chart-x" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.k}>{i % every === 0 ? (unit === 'month' ? d.label : fmtDate(d.k, { time: false })) : ''}</span>
        ))}
      </div>
    </div>
  )
}

function BreakdownTable({ title, rows, total, onPick, picked, firstCol }) {
  const max = Math.max(1, ...rows.map((r) => r.total))
  return (
    <section className="card flush">
      <div className="card-head"><h2>{title}</h2></div>
      <div className="table-scroll">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">{firstCol}</th>
              <th scope="col" className="num">Leads</th>
              <th scope="col" className="share-col">Share</th>
              <th scope="col" className="num">Contacted</th>
              <th scope="col" className="num">Quoted</th>
              <th scope="col" className="num">Won</th>
              <th scope="col" className="num">Lost</th>
              <th scope="col" className="num">Spam</th>
              <th scope="col" className="num">Win rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className={picked === r.k ? 'picked' : ''}>
                <th scope="row">
                  {onPick ? (
                    <button className="link-btn" onClick={() => onPick(picked === r.k ? '' : r.k)} title="Show only these leads below">
                      {r.label}
                    </button>
                  ) : r.label}
                </th>
                <td className="num strong">{r.total}</td>
                <td className="share-col">
                  <span className="share">
                    <span className="share-track"><span className="share-fill" style={{ width: `${(r.total / max) * 100}%` }} /></span>
                    <span className="share-pct">{pct(r.total, total)}%</span>
                  </span>
                </td>
                <td className="num">{r.Contacted}</td>
                <td className="num">{r.Quoted}</td>
                <td className="num">{r.Won}</td>
                <td className="num">{r.Lost}</td>
                <td className="num">{r.Spam}</td>
                <td className="num strong">{r.total - r.Spam ? pct(r.Won, r.total - r.Spam) + '%' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ---------- page ----------
export default function Reports({ leads, onOpen }) {
  const [range, setRange] = useState(() => rangeFrom('30d'))
  const [service, setService] = useState('')

  const r = [range.from, range.to]
  const firstDay = useMemo(() => leads.reduce((m, l) => (l.date && (!m || l.date < m) ? l.date.slice(0, 10) : m), ''), [leads])
  const from = range.from || firstDay || todayStr()
  const to = range.to || todayStr()

  const scoped = leads.filter((l) => inRange(l, r))
  const shown = service ? scoped.filter((l) => (l.service || '(unknown)') === service) : scoped

  // Previous period of the same length, for comparison
  let prev = null
  if (range.from && range.to) {
    const n = daysBetween(range.from, range.to)
    prev = leads.filter((l) => inRange(l, [shiftDay(range.from, -n), shiftDay(range.from, -1)]))
  }

  const total = scoped.length
  const spam = scoped.filter((l) => l.status === 'Spam').length
  const won = scoped.filter((l) => l.status === 'Won').length
  const open = scoped.filter((l) => !CLOSED.includes(l.status)).length
  const uncontacted = scoped.filter((l) => l.status === 'New').length
  const real = total - spam
  const days = daysBetween(from, to)

  const services = breakdown(scoped, (l) => l.service, (k) => (SERVICES[k] ? serviceLabel(k) : k))
  const sources = breakdown(scoped, (l) => sourceOf(l))
  const trend = buckets(scoped, from, to)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Lead report</h1>
          <p className="muted">{rangeLabel(r)} · leads by service, source and outcome</p>
        </div>
        <button className="btn" onClick={() => downloadCsv(shown)} disabled={!shown.length}>Export CSV</button>
      </div>

      <section className="card">
        <DateRange value={range} onChange={(v) => { setRange(v); setService('') }} />
      </section>

      <div className="kpis">
        <Kpi label="Leads" value={total} delta={prev ? total - prev.length : null}
          sub={`${(total / Math.max(1, days)).toFixed(1)} per day`} />
        <Kpi label="Won" value={won} delta={prev ? won - prev.filter((l) => l.status === 'Won').length : null}
          sub={real ? `${pct(won, real)}% win rate` : 'No leads yet'} />
        <Kpi label="Still open" value={open} sub={`${uncontacted} not contacted yet`} />
        <Kpi label="Spam" value={spam} sub={total ? `${pct(spam, total)}% of all leads` : '—'} />
      </div>

      <section className="card">
        <div className="card-head inline">
          <h2>Leads over time</h2>
          <span className="muted small">per {trend.unit} · hover a bar for details</span>
        </div>
        {total ? <TrendChart data={trend.list} unit={trend.unit} /> : <p className="empty">No leads in this period.</p>}
      </section>

      {total > 0 && (
        <BreakdownTable title="By service" firstCol="Service" rows={services} total={total} onPick={setService} picked={service} />
      )}
      {total > 0 && <BreakdownTable title="By source" firstCol="Source" rows={sources} total={total} />}

      <section className="card flush">
        <div className="card-head inline">
          <h2>
            {service ? `${services.find((s) => s.k === service)?.label || service} leads` : 'All leads in this period'}
            <span className="count-pill">{shown.length}</span>
          </h2>
          {service && <button className="btn sm" onClick={() => setService('')}>Show all services</button>}
        </div>
        {shown.length ? <LeadsTable leads={shown} onOpen={onOpen} compact /> : <p className="empty pad">No leads in this period.</p>}
      </section>
    </div>
  )
}
