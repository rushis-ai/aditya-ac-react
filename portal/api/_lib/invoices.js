// Invoices, kept in their own tab of the same Sheet (created on first use).
//   INVOICES_TAB     = optional, default "Invoices"
//   INVOICE_PREFIX   = optional, default "AAC" (business initials) -> AAC-2627-0001
//   INVOICE_FY_START = optional, month the financial year starts (1-12), default 4 (April)
//   INVOICE_ADMINS   = optional, comma-separated usernames allowed to issue and cancel, default "rushi"
// Anyone signed in can create and edit drafts. Issuing gives the invoice the next number and locks it.
// An issued invoice is never edited: it can only be cancelled (its number stays used).
import crypto from 'node:crypto'
import { api, writeCells, quote, enc, cellDate, nowLocal, appendNotes, leadsTab, money } from './sheets.js'

const TAB = process.env.INVOICES_TAB || 'Invoices'
const HEAD = [
  'Invoice ID', 'Invoice No', 'Status', 'Lead ID', 'Customer', 'Phone', 'Address', 'Items', 'Discount', 'Total',
  'Created At', 'Created By', 'Issued At', 'Issued By', 'Cancelled At', 'Cancelled By', 'Cancel Reason'
]
const KEYS = [
  'id', 'number', 'status', 'leadId', 'customer', 'phone', 'address', 'items', 'discount', 'total',
  'createdAt', 'createdBy', 'issuedAt', 'issuedBy', 'cancelledAt', 'cancelledBy', 'cancelReason'
]
const LAST_COL = 'Q' // 17 columns
const PREFIX = (process.env.INVOICE_PREFIX || 'AAC').replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'AAC'
const FY_START = Math.min(12, Math.max(1, parseInt(process.env.INVOICE_FY_START, 10) || 4))

export const INVOICE_ID = /^i[0-9a-f]{10}$/

export function canIssue(user) {
  const admins = (process.env.INVOICE_ADMINS ?? 'rushi').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  return admins.includes(user)
}

export class InvoiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// "2026-11-15T10:30" -> "2627" (FY 2026-27). With a January start, the plain year: "2026".
export function fyCode(when) {
  const y = Number(when.slice(0, 4))
  const m = Number(when.slice(5, 7))
  if (FY_START === 1) return String(y)
  const start = m >= FY_START ? y : y - 1
  const yy = (n) => String(n % 100).padStart(2, '0')
  return yy(start) + yy(start + 1)
}

const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN')

// ---------- storage ----------
async function setup() {
  await leadsTab() // makes sure the Notes tab exists, since invoice actions write history there
  const { sheets } = await api('?fields=sheets.properties.title')
  if (!sheets.some((s) => s.properties.title === TAB)) {
    try {
      await api(':batchUpdate', { method: 'POST', body: { requests: [{ addSheet: { properties: { title: TAB } } }] } })
    } catch (e) {
      if (!/already exists/i.test(e.message)) throw e // another server instance made it first
    }
  }
  const head = (await api(`/values/${enc(quote(TAB) + '!1:1')}`)).values?.[0] || []
  if (!head.length) await writeCells([{ range: `${quote(TAB)}!A1`, values: [HEAD] }])
  else if (head[0] !== HEAD[0] || head[1] !== HEAD[1]) throw new Error(`The "${TAB}" tab has unexpected headers`)
}

let ready = null
const invoicesTab = () => (ready ||= setup().catch((e) => { ready = null; throw e }))

function parse(row) {
  const o = {}
  KEYS.forEach((k, i) => { o[k] = row[i] ?? '' })
  let items = []
  try { items = JSON.parse(o.items || '[]') } catch { /* leave empty */ }
  return {
    ...Object.fromEntries(KEYS.map((k) => [k, String(o[k]).trim()])),
    items: Array.isArray(items) ? items : [],
    discount: money(o.discount) || 0,
    total: money(o.total) || 0,
    createdAt: cellDate(o.createdAt) || String(o.createdAt),
    issuedAt: cellDate(o.issuedAt) || String(o.issuedAt),
    cancelledAt: cellDate(o.cancelledAt) || String(o.cancelledAt)
  }
}

const toRow = (inv) => KEYS.map((k) => (k === 'items' ? JSON.stringify(inv.items) : inv[k] ?? ''))

// -> [{ row: sheet row number, inv }]
async function readAll() {
  await invoicesTab()
  const d = await api(`/values/${enc(quote(TAB) + `!A:${LAST_COL}`)}?valueRenderOption=UNFORMATTED_VALUE`)
  return (d.values || []).slice(1)
    .map((r, i) => ({ row: i + 2, inv: parse(r || []) }))
    .filter((x) => x.inv.id)
}

const writeRow = (row, inv) => writeCells([{ range: `${quote(TAB)}!A${row}:${LAST_COL}${row}`, values: [toRow(inv)] }])

async function appendRow(inv) {
  await api(`/values/${enc(quote(TAB) + '!A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: { values: [toRow(inv)] }
  })
}

// ---------- public ----------
// All invoices except discarded drafts, newest first
export async function loadInvoices() {
  return (await readAll()).map((x) => x.inv).filter((i) => i.status !== 'Discarded').reverse()
}

// Next number for this financial year: highest issued or cancelled number + 1
function nextNumber(all, when) {
  const head = `${PREFIX}-${fyCode(when)}-`
  let max = 0
  for (const { inv } of all) {
    if (inv.number.startsWith(head)) max = Math.max(max, parseInt(inv.number.slice(head.length), 10) || 0)
  }
  return head + String(max + 1).padStart(4, '0')
}

// action: 'save' | 'issue' | 'discard' | 'cancel'
// fields (save/issue): { leadId, customer, phone, address, items, discount, total } (validated by the caller)
// Returns { invoice, history } where history is what was written to the lead's notes, newest first.
export async function invoiceAction(action, { id, fields, reason }, user) {
  const all = await readAll()
  const now = nowLocal()
  let found = id ? all.find((x) => x.inv.id === id) : null
  if (id && !found) throw new InvoiceError(404, 'Invoice not found. Refresh and try again.')
  const notes = []
  const note = (leadId, text) => notes.push({ id: leadId, when: now, by: user, text, kind: 'change' })

  if (action === 'save' || action === 'issue') {
    let inv
    if (found) {
      if (found.inv.status !== 'Draft') throw new InvoiceError(409, 'This invoice is already issued and can’t be changed.')
      inv = { ...found.inv, ...fields, leadId: found.inv.leadId }
    } else {
      inv = {
        id: 'i' + crypto.randomBytes(5).toString('hex'), number: '', status: 'Draft', ...fields,
        createdAt: now, createdBy: user, issuedAt: '', issuedBy: '', cancelledAt: '', cancelledBy: '', cancelReason: ''
      }
    }

    if (action === 'save') {
      if (found) await writeRow(found.row, inv)
      else {
        await appendRow(inv)
        note(inv.leadId, `Invoice draft created (${rupees(inv.total)})`)
      }
    } else {
      if (inv.total <= 0) throw new InvoiceError(400, 'The total must be more than ₹0 to issue.')
      // A new invoice issued straight away is added as a draft first, so it has a row to number
      if (!found) {
        await appendRow(inv)
        const again = await readAll()
        found = again.find((x) => x.inv.id === inv.id)
        all.splice(0, all.length, ...again)
      }
      Object.assign(inv, { number: nextNumber(all, now), status: 'Issued', issuedAt: now, issuedBy: user })
      await writeRow(found.row, inv)
      // Two issues at the same moment could pick the same number; if so, undo this one
      const clash = (await readAll()).some((x) => x.inv.id !== inv.id && x.inv.number === inv.number)
      if (clash) {
        await writeRow(found.row, { ...inv, number: '', status: 'Draft', issuedAt: '', issuedBy: '' })
        throw new InvoiceError(409, 'Another invoice took that number at the same moment. Please try again.')
      }
      note(inv.leadId, `Invoice ${inv.number} issued (${rupees(inv.total)})`)
    }
    await appendNotes(notes)
    return { invoice: inv, history: notes.map(({ id: _, ...n }) => n).reverse() }
  }

  if (!found) throw new InvoiceError(400, 'Missing invoice.')
  const inv = { ...found.inv }
  if (action === 'discard') {
    if (inv.status !== 'Draft') throw new InvoiceError(409, 'Only drafts can be discarded. Cancel an issued invoice instead.')
    inv.status = 'Discarded'
    note(inv.leadId, 'Invoice draft discarded')
  } else if (action === 'cancel') {
    if (inv.status !== 'Issued') throw new InvoiceError(409, 'Only issued invoices can be cancelled.')
    Object.assign(inv, { status: 'Cancelled', cancelledAt: now, cancelledBy: user, cancelReason: reason })
    note(inv.leadId, `Invoice ${inv.number} cancelled: ${reason}`)
  } else {
    throw new InvoiceError(400, 'Unknown action.')
  }
  await writeRow(found.row, inv)
  await appendNotes(notes)
  return { invoice: inv, history: notes.map(({ id: _, ...n }) => n).reverse() }
}
