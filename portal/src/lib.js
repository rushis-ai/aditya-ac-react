// Same slugs as the website's lead form
export const SERVICES = {
  'ac-installation': 'AC Installation',
  'ac-repair': 'AC Repair',
  'ac-cleaning': 'AC Deep Cleaning',
  'gas-refill': 'Gas Refill',
  refrigeration: 'Refrigeration Repair',
  amc: 'Annual Maintenance (AMC)',
  other: 'Other'
}
export const serviceLabel = (s) => SERVICES[s] || s || '—'

export const CLOSED = ['Won', 'Lost', 'Spam']
export const isOpen = (l) => !CLOSED.includes(l.status)

const pad = (n) => String(n).padStart(2, '0')
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function dateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayStr = () => dateStr(new Date())
export function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return dateStr(d)
}

// Badge on the Today tab: uncalled new leads + follow-ups due
export function dueCount(leads) {
  const t = todayStr()
  return leads.filter((l) => (l.status === 'New' && !l.followUp) || (isOpen(l) && l.followUp && l.followUp <= t)).length
}

// "2026-11-09T18:05" -> "9 Nov, 6:05 pm" (year shown only if not this year)
export function fmtDate(s, { time = true } = {}) {
  if (!s) return ''
  const [d, t] = s.split('T')
  const [y, m, dd] = d.split('-').map(Number)
  if (!y || !m || !dd) return s
  let out = `${dd} ${MON[m - 1]}`
  if (y !== new Date().getFullYear()) out += ` ${y}`
  if (time && t) {
    const [h, mi] = t.split(':').map(Number)
    out += `, ${h % 12 || 12}:${pad(mi)} ${h < 12 ? 'am' : 'pm'}`
  }
  return out
}

export function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number)
  return `${MON[m - 1]} ${y}`
}

const EMPTY = ['', '(none)', '(not set)']
export function sourceOf(l) {
  const s = l.last_source || l.first_source
  const m = l.last_medium || l.first_medium
  if (!s) return '—'
  return EMPTY.includes(m || '') ? s : `${s} / ${m}`
}

const digits = (p) => String(p).replace(/\D/g, '')
export const telLink = (p) => 'tel:' + (digits(p).length === 10 ? '+91' + digits(p) : '+' + digits(p))
export const waLink = (p) => 'https://wa.me/' + (digits(p).length === 10 ? '91' + digits(p) : digits(p))

// CSV download. Cells starting with = + - @ get a leading ' so spreadsheets don't run them as formulas.
export function downloadCsv(leads) {
  const cols = [
    ['Received', (l) => l.date.replace('T', ' ')], ['Name', (l) => l.name], ['Phone', (l) => l.phone],
    ['Service', (l) => serviceLabel(l.service)], ['Message', (l) => l.message], ['Status', (l) => l.status],
    ['Assigned To', (l) => l.assigned], ['Follow-up', (l) => l.followUp], ['First Source', (l) => l.first_source],
    ['First Medium', (l) => l.first_medium], ['Last Source', (l) => l.last_source], ['Last Medium', (l) => l.last_medium],
    ['Campaign', (l) => l.last_campaign || l.first_campaign], ['Latest Note', (l) => l.notes[0]?.text || '']
  ]
  const cell = (v) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return '"' + s.replace(/"/g, '""') + '"'
  }
  const csv = [cols.map(([h]) => cell(h)), ...leads.map((l) => cols.map(([, f]) => cell(f(l))))].map((r) => r.join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `leads-${todayStr()}.csv` })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
