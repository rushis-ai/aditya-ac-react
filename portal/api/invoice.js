// Create, edit, issue, discard or cancel an invoice.
// body: { action: 'save'|'issue'|'discard'|'cancel', id?, leadId, customer, phone, address, items, discount, reason }
import { allow, sameSiteWrite, requireUser, send, fail } from './_lib/http.js'
import { money } from './_lib/sheets.js'
import { invoiceAction, canIssue, InvoiceError, INVOICE_ID } from './_lib/invoices.js'

const ACTIONS = ['save', 'issue', 'discard', 'cancel']
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
const MAX_RATE = 1e7

// -> fields, or a string with what's wrong
function readFields(b) {
  const f = {
    leadId: String(b.leadId ?? ''),
    customer: clean(b.customer, 100),
    phone: String(b.phone ?? '').replace(/[^\d+]/g, '').slice(0, 16),
    address: String(b.address ?? '').replace(/\r/g, '').trim().slice(0, 300)
  }
  if (!/^[\w-]{1,40}$/.test(f.leadId)) return 'Missing lead.'
  if (!f.customer) return 'Enter the customer’s name.'
  if (!Array.isArray(b.items) || !b.items.length) return 'Add at least one item.'
  if (b.items.length > 20) return 'An invoice can have up to 20 items.'
  f.items = []
  for (const it of b.items) {
    const desc = clean(it?.desc, 200)
    const qty = Number(it?.qty)
    const rate = money(it?.rate)
    if (!desc) return 'Every item needs a description.'
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return `Quantity for “${desc}” must be a whole number from 1 to 999.`
    if (rate === '' || rate < 0 || rate > MAX_RATE) return `Enter a price in rupees for “${desc}”.`
    f.items.push({ desc, qty, rate })
  }
  const subtotal = f.items.reduce((s, it) => s + it.qty * it.rate, 0)
  f.discount = money(b.discount) || 0
  if (f.discount > subtotal) return 'The discount can’t be more than the items’ total.'
  f.total = subtotal - f.discount
  return f
}

export default async function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  try {
    const user = requireUser(req, res)
    if (!user) return
    const b = req.body || {}
    if (!ACTIONS.includes(b.action)) return send(res, 400, { error: 'Unknown action.' })
    if ((b.action === 'issue' || b.action === 'cancel') && !canIssue(user)) {
      return send(res, 403, { error: 'You don’t have permission to issue or cancel invoices.' })
    }
    const id = b.id ? String(b.id) : ''
    if (id && !INVOICE_ID.test(id)) return send(res, 400, { error: 'Missing invoice.' })
    if ((b.action === 'discard' || b.action === 'cancel') && !id) return send(res, 400, { error: 'Missing invoice.' })

    let fields
    if (b.action === 'save' || b.action === 'issue') {
      fields = readFields(b)
      if (typeof fields === 'string') return send(res, 400, { error: fields })
    }
    const reason = clean(b.reason, 200)
    if (b.action === 'cancel' && !reason) return send(res, 400, { error: 'Say why the invoice is being cancelled.' })

    send(res, 200, await invoiceAction(b.action, { id, fields, reason }, user))
  } catch (err) {
    if (err instanceof InvoiceError) return send(res, err.status, { error: err.message })
    fail(res, err)
  }
}
