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

// ---------- date ranges (shared by Leads and Reports) ----------
export const PRESETS = [
  ['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'],
  ['month', 'This month'], ['lastmonth', 'Last month'], ['year', 'This year'], ['all', 'All time']
]

export const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const shiftDay = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return dateStr(d) }
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5) + 1

// -> [from, to] as YYYY-MM-DD; '' means open-ended
export function presetRange(key) {
  const t = new Date()
  const today = todayStr()
  switch (key) {
    case 'today': return [today, today]
    case 'yesterday': return [addDays(-1), addDays(-1)]
    case '7d': return [addDays(-6), today]
    case '30d': return [addDays(-29), today]
    case 'month': return [dateStr(new Date(t.getFullYear(), t.getMonth(), 1)), today]
    case 'lastmonth': return [dateStr(new Date(t.getFullYear(), t.getMonth() - 1, 1)), dateStr(new Date(t.getFullYear(), t.getMonth(), 0))]
    case 'year': return [dateStr(new Date(t.getFullYear(), 0, 1)), today]
    default: return ['', '']
  }
}

export function rangeFrom(preset) {
  const [from, to] = presetRange(preset)
  return { preset, from, to }
}

export function inRange(l, [from, to]) {
  const d = l.date.slice(0, 10)
  if (!d) return !from && !to
  return (!from || d >= from) && (!to || d <= to)
}

export function rangeLabel([from, to]) {
  if (!from && !to) return 'All time'
  if (from === to) return fmtDate(from, { time: false })
  return `${from ? fmtDate(from, { time: false }) : 'Start'} – ${to ? fmtDate(to, { time: false }) : 'today'}`
}

// A past customer whose next-service reminder date is set (a Won lead with a follow-up)
export const isRepeat = (l) => l.status === 'Won' && Boolean(l.followUp)

// Badge on the Today tab: uncalled new leads + follow-ups due + repeat-service reminders due
export function dueCount(leads) {
  const t = todayStr()
  return leads.filter((l) => (l.status === 'New' && !l.followUp) || ((isOpen(l) || isRepeat(l)) && l.followUp && l.followUp <= t)).length
}

// Fallback if the server doesn't send its list
export const LOST_REASONS = ['Price too high', 'Went with someone else', 'No response', 'Outside service area', 'Only enquiring', 'Other']

// Typed value -> whole rupees, or '' (same rule as the server)
export function money(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v) : ''
  const s = String(v ?? '').replace(/[^\d.]/g, '')
  if (!/\d/.test(s)) return ''
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : ''
}

// 12500 -> "₹12,500"; '' -> ''
export const fmtMoney = (n) => (n === '' || n == null ? '' : '₹' + Number(n).toLocaleString('en-IN'))

// Minutes from receiving a website lead to the first call, note or change by the team.
// null for hand-added leads (they're logged after the call) and leads nobody has touched yet.
export function firstResponseMins(l) {
  if (!l.date || l.notes.some((n) => n.text.startsWith('Added by hand'))) return null
  const first = l.notes.map((n) => n.when).filter((w) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(w) && w >= l.date).sort()[0]
  return first ? Math.max(0, Math.round((new Date(first) - new Date(l.date)) / 6e4)) : null
}

// 45 -> "45 min", 150 -> "2.5 h", 3000 -> "2.1 days"
export function fmtDuration(m) {
  if (m == null) return '—'
  if (m < 60) return `${m} min`
  if (m < 1440) return `${Math.round(m / 6) / 10} h`
  return `${Math.round(m / 144) / 10} days`
}

export function median(nums) {
  if (!nums.length) return null
  const s = [...nums].sort((a, b) => a - b)
  const h = s.length >> 1
  return s.length % 2 ? s[h] : Math.round((s[h - 1] + s[h]) / 2)
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
export const waLink = (p, text = '') =>
  'https://wa.me/' + (digits(p).length === 10 ? '91' + digits(p) : digits(p)) + (text ? '?text=' + encodeURIComponent(text) : '')

// First WhatsApp message, pre-filled so it only needs a quick check before sending
export function waGreeting(l) {
  const first = l.name.trim().split(/\s+/)[0]
  const svc = SERVICES[l.service] && l.service !== 'other' ? ` about ${SERVICES[l.service]}` : ''
  return `Hi${first ? ' ' + first : ''}, thank you for your enquiry${svc}. When would be a good time to call you?`
}

// Same number, ignoring spaces and the country code (compares the last 10 digits)
export function samePhone(a, b) {
  const x = digits(a), y = digits(b)
  return x.length >= 7 && y.length >= 7 && x.slice(-10) === y.slice(-10)
}

// Notes typed by people (the rest of lead.notes is change history)
export const typedNotes = (l) => l.notes.filter((n) => n.kind !== 'change')

// CSV download. Cells starting with = + - @ get a leading ' so spreadsheets don't run them as formulas.
export function downloadCsv(leads) {
  const cols = [
    ['Received', (l) => l.date.replace('T', ' ')], ['Name', (l) => l.name], ['Phone', (l) => l.phone],
    ['Service', (l) => serviceLabel(l.service)], ['Message', (l) => l.message], ['Status', (l) => l.status],
    ['Assigned To', (l) => l.assigned], ['Follow-up', (l) => l.followUp], ['Value', (l) => l.value ?? ''],
    ['Lost Reason', (l) => l.lostReason || ''], ['First Source', (l) => l.first_source],
    ['First Medium', (l) => l.first_medium], ['Last Source', (l) => l.last_source], ['Last Medium', (l) => l.last_medium],
    ['Campaign', (l) => l.last_campaign || l.first_campaign], ['Latest Note', (l) => typedNotes(l)[0]?.text || '']
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
