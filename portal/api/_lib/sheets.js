// Google Sheet as the lead database, via a service account (server-side only).
//   GOOGLE_SERVICE_ACCOUNT = the service account's JSON key (raw JSON or base64 of it)
//   SHEET_ID               = the long ID from the Sheet's URL
//   LEADS_TAB              = optional, tab the website writes to (default: first tab)
//   NOTES_TAB              = optional, default "Notes" (created automatically)
//   PORTAL_TZ              = optional, default Asia/Kolkata
// On first use it adds the portal's columns to the right of the existing ones
// (Lead ID, Status, Assigned To, Follow-up, Updated By, Updated At). Existing columns are never moved.
import crypto from 'node:crypto'

export const STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam']
// How a hand-added lead reached us (stored as its source)
export const CHANNELS = ['Phone call', 'Walk-in', 'Referral', 'Other']
const CRM_COLS = ['Lead ID', 'Status', 'Assigned To', 'Follow-up', 'Updated By', 'Updated At']
const NOTES_TAB = process.env.NOTES_TAB || 'Notes'
// Kind: "note" (typed by a person) or "change" (status / assignee / follow-up history)
const NOTES_HEAD = ['When', 'Lead ID', 'By', 'Note', 'Kind']
const TZ = process.env.PORTAL_TZ || 'Asia/Kolkata'

// Header names accepted for each field (compared lowercase, letters/digits only)
const FIELDS = {
  ts: ['timestamp', 'date', 'time', 'datetime', 'submitted', 'submittedat', 'createdat', 'received'],
  name: ['name', 'fullname', 'customername'],
  phone: ['phone', 'mobile', 'phonenumber', 'mobilenumber', 'contact'],
  service: ['service', 'servicetype'],
  message: ['message', 'msg', 'enquiry', 'query', 'details'],
  first_source: ['firstsource', 'source', 'utmsource'],
  first_medium: ['firstmedium', 'medium'],
  first_campaign: ['firstcampaign', 'campaign'],
  first_landing: ['firstlanding', 'landing', 'landingpage'],
  last_source: ['lastsource'],
  last_medium: ['lastmedium'],
  last_campaign: ['lastcampaign'],
  id: ['leadid'],
  status: ['status'],
  assigned: ['assignedto'],
  followUp: ['followup'],
  updatedBy: ['updatedby'],
  updatedAt: ['updatedat']
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
const quote = (tab) => `'${tab.replace(/'/g, "''")}'`
const enc = encodeURIComponent

export function colLetter(i) {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

const localFmt = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
})
export const nowLocal = () => localFmt.format(new Date()).replace(' ', 'T')

// Sheet cell -> "YYYY-MM-DDTHH:mm" (sheet-local time) or ''
export function cellDate(v) {
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    // Serial date: days since 1899-12-30, already in the sheet's timezone
    return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 16)
  }
  if (typeof v === 'string' && v.trim()) {
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(v.trim())) return v.trim()
    const d = new Date(v)
    if (!isNaN(d)) return localFmt.format(d).replace(' ', 'T')
  }
  return ''
}

// ---------- Google auth (service account JWT, no SDK needed) ----------
let token = null
let tokenExp = 0

function credentials() {
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT || '').trim()
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT is not set')
  return JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'))
}

async function accessToken() {
  if (token && Date.now() < tokenExp - 60_000) return token
  const { client_email, private_key } = credentials()
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  })
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` })
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('Google auth failed: ' + (d.error_description || d.error || r.status))
  token = d.access_token
  tokenExp = Date.now() + d.expires_in * 1000
  return token
}

async function api(path, { method = 'GET', body } = {}) {
  if (!process.env.SHEET_ID) throw new Error('SHEET_ID is not set')
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}${path}`, {
    method,
    headers: { Authorization: 'Bearer ' + (await accessToken()), 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body)
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Sheets API ${r.status}: ${d.error?.message || 'unknown error'}`)
  return d
}

const writeCells = (data) => api('/values:batchUpdate', { method: 'POST', body: { valueInputOption: 'RAW', data } })

// ---------- one-time setup per server instance ----------
async function setup() {
  const { sheets } = await api('?fields=sheets.properties(sheetId,title,gridProperties)')
  const tabs = sheets.map((s) => s.properties)
  const leads = process.env.LEADS_TAB ? tabs.find((t) => t.title === process.env.LEADS_TAB) : tabs[0]
  if (!leads) throw new Error(`Leads tab "${process.env.LEADS_TAB}" not found`)
  const hasNotes = tabs.some((t) => t.title === NOTES_TAB)

  const head = (await api(`/values/${enc(quote(leads.title) + '!1:1')}`)).values?.[0] || []
  if (!head.length) throw new Error('The leads tab has no header row')
  const keys = head.map(norm)
  const missing = CRM_COLS.filter((c) => !keys.includes(norm(c)))

  // Older Notes tabs were made without the Kind column
  const notesHead = hasNotes ? (await api(`/values/${enc(quote(NOTES_TAB) + '!1:1')}`)).values?.[0] || [] : []

  const requests = []
  if (!hasNotes) requests.push({ addSheet: { properties: { title: NOTES_TAB } } })
  const extra = head.length + missing.length - leads.gridProperties.columnCount
  if (extra > 0) requests.push({ appendDimension: { sheetId: leads.sheetId, dimension: 'COLUMNS', length: extra } })
  if (requests.length) await api(':batchUpdate', { method: 'POST', body: { requests } })

  const data = []
  if (missing.length) data.push({ range: `${quote(leads.title)}!${colLetter(head.length)}1`, values: [missing] })
  if (!hasNotes) data.push({ range: `${quote(NOTES_TAB)}!A1`, values: [NOTES_HEAD] })
  else if (!notesHead[4]) data.push({ range: `${quote(NOTES_TAB)}!E1`, values: [['Kind']] })
  if (data.length) await writeCells(data)
  return leads.title
}

let ready = null
const leadsTab = () => (ready ||= setup().catch((e) => { ready = null; throw e }))

function mapHeader(head) {
  const keys = head.map(norm)
  const m = {}
  for (const [field, names] of Object.entries(FIELDS)) {
    const i = names.map((n) => keys.indexOf(n)).find((i) => i >= 0)
    if (i !== undefined) m[field] = i
  }
  return m
}

// Stable ID from the submission itself, so two servers reading at once agree on it
const leadId = (ts, phone, name) =>
  crypto.createHash('sha1').update(`${ts}|${phone}|${name}`).digest('hex').slice(0, 10)

async function readLeadsTab(tab) {
  const d = await api(`/values/${enc(quote(tab))}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`)
  const rows = d.values || []
  const m = mapHeader(rows[0] || [])
  for (const f of ['id', 'status', 'assigned', 'followUp', 'updatedBy', 'updatedAt']) {
    if (m[f] === undefined) { ready = null; throw new Error('Portal columns are missing; they will be re-added on the next request') }
  }
  return { rows, m }
}

// ---------- public ----------
export async function loadLeads() {
  const tab = await leadsTab()
  const [{ rows, m }, notesRes] = await Promise.all([
    readLeadsTab(tab),
    api(`/values/${enc(quote(NOTES_TAB))}?valueRenderOption=UNFORMATTED_VALUE`)
  ])

  const notesById = {}
  for (const [when = '', id = '', by = '', text = '', kind = ''] of (notesRes.values || []).slice(1)) {
    if (!id) continue
    ;(notesById[id] ||= []).push({
      when: cellDate(when) || String(when), by: String(by), text: String(text), kind: kind === 'change' ? 'change' : 'note'
    })
  }

  const leads = []
  const newIds = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] || []
    if (!row.some((v) => v !== '' && v != null)) continue
    const get = (f) => (m[f] === undefined ? '' : row[m[f]] ?? '')
    const str = (f) => String(get(f)).trim()
    let id = str('id')
    if (!id) {
      id = leadId(get('ts'), get('phone'), get('name'))
      newIds.push({ range: `${quote(tab)}!${colLetter(m.id)}${r + 1}`, values: [[id]] })
    }
    leads.push({
      id,
      date: cellDate(get('ts')),
      name: str('name'),
      phone: str('phone'),
      service: str('service'),
      message: str('message'),
      first_source: str('first_source'),
      first_medium: str('first_medium'),
      first_campaign: str('first_campaign'),
      first_landing: str('first_landing'),
      last_source: str('last_source'),
      last_medium: str('last_medium'),
      last_campaign: str('last_campaign'),
      status: STATUSES.includes(str('status')) ? str('status') : 'New',
      assigned: str('assigned'),
      followUp: cellDate(get('followUp')).slice(0, 10),
      updatedBy: str('updatedBy'),
      updatedAt: cellDate(get('updatedAt')),
      notes: (notesById[id] || []).reverse()
    })
  }
  if (newIds.length) await writeCells(newIds)
  return leads.reverse() // newest first
}

const FIELD_LABEL = { status: 'Status', assigned: 'Assigned to', followUp: 'Follow-up' }

// One line of history, e.g. "Status: New → Contacted"
function changeText(f, from, to) {
  if (f === 'followUp') return to ? `Follow-up set for ${to}` : 'Follow-up cleared'
  return `${FIELD_LABEL[f]}: ${from || 'nobody'} → ${to || 'nobody'}`
}

// rows: [{ id, when, by, text, kind }]
async function appendNotes(rows) {
  if (!rows.length) return
  await api(`/values/${enc(quote(NOTES_TAB) + '!A:E')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: { values: rows.map((n) => [n.when, n.id, n.by, n.text, n.kind]) }
  })
}
const withoutId = (n) => ({ when: n.when, by: n.by, text: n.text, kind: n.kind })

// changes: { status?, assigned?, followUp? } (already validated by the caller)
// Returns { lead: saved fields, history: entries written for what actually changed, newest first }, or null
export async function updateLead(id, changes, user) {
  const tab = await leadsTab()
  const { rows, m } = await readLeadsTab(tab)
  const r = rows.findIndex((row, i) => i > 0 && String(row?.[m.id] ?? '') === id)
  if (r < 0) return null
  const row = rows[r] || []
  const prevStatus = String(row[m.status] ?? '').trim()
  const old = {
    status: STATUSES.includes(prevStatus) ? prevStatus : 'New',
    assigned: String(row[m.assigned] ?? '').trim(),
    followUp: cellDate(row[m.followUp] ?? '').slice(0, 10)
  }
  const cell = (f) => `${quote(tab)}!${colLetter(m[f])}${r + 1}`
  const updatedAt = nowLocal()
  const data = Object.entries(changes).map(([f, v]) => ({ range: cell(f), values: [[v]] }))
  data.push({ range: cell('updatedBy'), values: [[user]] }, { range: cell('updatedAt'), values: [[updatedAt]] })
  const history = Object.entries(changes)
    .filter(([f, v]) => old[f] !== v)
    .map(([f, v]) => ({ id, when: updatedAt, by: user, text: changeText(f, old[f], v), kind: 'change' }))
  await Promise.all([writeCells(data), appendNotes(history)])
  return { lead: { ...changes, updatedBy: user, updatedAt }, history: history.map(withoutId).reverse() }
}

export async function addNote(id, text, user) {
  await leadsTab()
  const note = { when: nowLocal(), by: user, text, kind: 'note' }
  await appendNotes([{ id, ...note }])
  return note
}

// A lead that didn't come through the website (phone call, walk-in…).
// f: { name, phone, service, message, channel, assigned, followUp, note } (validated by the caller)
export async function createLead(f, user) {
  const tab = await leadsTab()
  const head = (await api(`/values/${enc(quote(tab) + '!1:1')}`)).values?.[0] || []
  const m = mapHeader(head)
  const id = 'm' + crypto.randomBytes(5).toString('hex')
  const now = nowLocal()
  const values = {
    ts: now, name: f.name, phone: f.phone, service: f.service, message: f.message, first_source: f.channel,
    id, status: 'New', assigned: f.assigned, followUp: f.followUp, updatedBy: user, updatedAt: now
  }
  const row = Array(head.length).fill('')
  for (const [k, v] of Object.entries(values)) if (m[k] !== undefined) row[m[k]] = v
  await api(`/values/${enc(quote(tab) + '!A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: { values: [row] }
  })

  const notes = [{ id, when: now, by: user, text: `Added by hand (${f.channel})`, kind: 'change' }]
  if (f.note) notes.push({ id, when: now, by: user, text: f.note, kind: 'note' })
  await appendNotes(notes)

  return {
    id, date: now, name: f.name, phone: f.phone, service: f.service, message: f.message,
    first_source: f.channel, first_medium: '', first_campaign: '', first_landing: '',
    last_source: '', last_medium: '', last_campaign: '',
    status: 'New', assigned: f.assigned, followUp: f.followUp, updatedBy: user, updatedAt: now,
    notes: notes.map(withoutId).reverse()
  }
}
