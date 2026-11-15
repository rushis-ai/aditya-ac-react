import { useState } from 'react'
import { fmtDate, fmtMoney, money, serviceLabel } from './lib.js'

const blankItem = () => ({ desc: '', qty: '1', rate: '' })

// Items with nothing typed in are ignored, so a spare empty row never blocks saving
const filled = (items) => items.filter((it) => it.desc.trim() || String(it.rate).trim())
const lineTotal = (it) => (Number(it.qty) || 0) * (money(it.rate) || 0)

export function invoiceTotals(items, discount) {
  const subtotal = filled(items).reduce((s, it) => s + lineTotal(it), 0)
  const d = money(discount) || 0
  return { subtotal, discount: d, total: subtotal - d }
}

function InvoiceStatus({ status }) {
  return <span className={'badge i-' + status.toLowerCase()}>{status}</span>
}

// Invoices for one lead, shown in the lead panel. New invoices can be made once the lead is Won.
export default function InvoiceSection({ lead, canIssue, onInvoice }) {
  const invoices = lead.invoices || []
  const [openId, setOpenId] = useState(null) // invoice id, 'new', or null for the list

  const inv = openId && openId !== 'new' ? invoices.find((i) => i.id === openId) : null
  if (openId === 'new' || inv) {
    return (
      <InvoiceEditor
        key={openId}
        lead={lead}
        invoice={inv}
        canIssue={canIssue}
        onInvoice={onInvoice}
        onDone={(id) => setOpenId(id || null)}
      />
    )
  }

  return (
    <section className="invoices">
      <div className="invoices-head">
        <h3>Invoices</h3>
        {lead.status === 'Won' && <button className="btn sm" onClick={() => setOpenId('new')}>+ Create invoice</button>}
      </div>
      {invoices.length ? (
        <ul className="inv-list">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <button className="inv-row" onClick={() => setOpenId(inv.id)}>
                <span className="inv-no">{inv.number || 'Draft'}</span>
                <InvoiceStatus status={inv.status} />
                <span className="inv-amt">{fmtMoney(inv.total)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty small">No invoices yet.</p>
      )}
    </section>
  )
}

function InvoiceEditor({ lead, invoice, canIssue, onInvoice, onDone }) {
  const draft = !invoice || invoice.status === 'Draft'
  const [customer, setCustomer] = useState(invoice?.customer ?? lead.name)
  const [phone, setPhone] = useState(invoice?.phone ?? lead.phone)
  const [address, setAddress] = useState(invoice?.address ?? '')
  const [items, setItems] = useState(() =>
    invoice?.items?.length
      ? invoice.items.map((it) => ({ desc: it.desc, qty: String(it.qty), rate: String(it.rate) }))
      : [{ desc: serviceLabel(lead.service) === '—' ? '' : serviceLabel(lead.service), qty: '1', rate: lead.value === '' || lead.value == null ? '' : String(lead.value) }]
  )
  const [discount, setDiscount] = useState(invoice?.discount ? String(invoice.discount) : '')
  const [confirm, setConfirm] = useState(null) // 'issue' | 'cancel'
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { subtotal, discount: disc, total } = invoiceTotals(items, discount)
  const setItem = (i, k) => (e) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, [k]: e.target.value } : it)))

  async function run(action, extra = {}) {
    setBusy(true)
    setError('')
    const body = { action, id: invoice?.id, ...extra }
    if (action === 'save' || action === 'issue') {
      Object.assign(body, {
        leadId: lead.id, customer, phone, address, discount,
        items: filled(items).map((it) => ({ desc: it.desc, qty: Number(it.qty), rate: it.rate }))
      })
    }
    const r = await onInvoice(body)
    setBusy(false)
    if (r.error) {
      setError(r.error)
      setConfirm(null)
      return
    }
    // Stay on the invoice after saving or issuing, go back to the list after discarding
    onDone(action === 'discard' ? null : r.invoice.id)
    setConfirm(null)
  }

  return (
    <section className="invoices">
      <div className="invoices-head">
        <h3>
          {invoice?.number || (invoice ? 'Draft invoice' : 'New invoice')}{' '}
          {invoice && <InvoiceStatus status={invoice.status} />}
        </h3>
        <button className="link small" onClick={() => onDone(null)}>← All invoices</button>
      </div>

      <div className="inv-form">
        {invoice && invoice.status !== 'Draft' && (
          <p className="muted small">
            Issued {fmtDate(invoice.issuedAt)} by {invoice.issuedBy}
            {invoice.status === 'Cancelled' && <><br />Cancelled {fmtDate(invoice.cancelledAt)} by {invoice.cancelledBy}: {invoice.cancelReason}</>}
          </p>
        )}

        <div className="two">
          <label>Customer<input value={customer} onChange={(e) => setCustomer(e.target.value)} disabled={!draft} maxLength={100} /></label>
          <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!draft} inputMode="tel" maxLength={16} /></label>
        </div>
        <label>Address
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} disabled={!draft} rows={2} maxLength={300} placeholder={draft ? 'Optional' : ''} />
        </label>

        <div className={'inv-items' + (draft ? '' : ' locked')} role="group" aria-label="Items">
          <div className="inv-item inv-item-head" aria-hidden="true">
            <span>Item</span><span>Qty</span><span>Price (₹)</span><span className="num">Amount</span>{draft && <span />}
          </div>
          {items.map((it, i) => (
            <div className="inv-item" key={i}>
              <input aria-label={`Item ${i + 1} description`} value={it.desc} onChange={setItem(i, 'desc')} disabled={!draft} maxLength={200} placeholder="e.g. Split AC service" />
              <input aria-label={`Item ${i + 1} quantity`} value={it.qty} onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, qty: e.target.value.replace(/\D/g, '').slice(0, 3) } : x)))} disabled={!draft} inputMode="numeric" />
              <input aria-label={`Item ${i + 1} price`} value={it.rate} onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, rate: e.target.value.replace(/[^\d,₹ ]/g, '') } : x)))} disabled={!draft} inputMode="numeric" placeholder="0" />
              <span className="num">{fmtMoney(lineTotal(it))}</span>
              {draft && (
                <button className="btn icon sm" onClick={() => setItems((xs) => (xs.length > 1 ? xs.filter((_, j) => j !== i) : [blankItem()]))} aria-label={`Remove item ${i + 1}`}>✕</button>
              )}
            </div>
          ))}
          {draft && items.length < 20 && (
            <button className="link small" onClick={() => setItems((xs) => [...xs, blankItem()])}>+ Add item</button>
          )}
        </div>

        <dl className="inv-totals">
          <div><dt>Subtotal</dt><dd>{fmtMoney(subtotal)}</dd></div>
          <div>
            <dt>Discount (₹)</dt>
            <dd>
              {draft
                ? <input aria-label="Discount in rupees" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d,₹ ]/g, ''))} inputMode="numeric" placeholder="0" />
                : fmtMoney(disc)}
            </dd>
          </div>
          <div className="grand"><dt>Total</dt><dd>{fmtMoney(total)}</dd></div>
        </dl>

        {error && <p className="error" role="alert">{error}</p>}

        {draft && confirm !== 'issue' && (
          <div className="inv-actions">
            <button className="btn" onClick={() => run('save')} disabled={busy}>{busy ? 'Saving…' : 'Save draft'}</button>
            {canIssue && <button className="btn primary" onClick={() => setConfirm('issue')} disabled={busy || total <= 0}>Issue invoice</button>}
            {invoice && <button className="link small danger" onClick={() => run('discard')} disabled={busy}>Discard draft</button>}
          </div>
        )}
        {draft && !canIssue && <p className="muted small">Save it as a draft. An invoice admin will issue it.</p>}

        {confirm === 'issue' && (
          <div className="outcome">
            <p><strong>Issue this invoice for {fmtMoney(total)}?</strong></p>
            <p className="small">It gets the next invoice number and can’t be edited afterwards. To correct it, you’d cancel it and make a new one.</p>
            <div className="chips">
              <button className="btn primary sm" onClick={() => run('issue')} disabled={busy}>{busy ? 'Issuing…' : 'Yes, issue it'}</button>
              <button className="link small" onClick={() => setConfirm(null)} disabled={busy}>Not yet</button>
            </div>
          </div>
        )}

        {invoice?.status === 'Issued' && canIssue && (
          confirm === 'cancel' ? (
            <div className="outcome">
              <label>Why is it being cancelled?
                <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="e.g. Wrong amount, reissued" autoFocus />
              </label>
              <p className="small">The number {invoice.number} stays used and the invoice is kept, marked Cancelled.</p>
              <div className="chips">
                <button className="btn sm" onClick={() => run('cancel', { reason })} disabled={busy || !reason.trim()}>{busy ? 'Cancelling…' : 'Cancel invoice'}</button>
                <button className="link small" onClick={() => setConfirm(null)} disabled={busy}>Keep it</button>
              </div>
            </div>
          ) : (
            <div className="inv-actions">
              <button className="link small danger" onClick={() => setConfirm('cancel')}>Cancel this invoice</button>
            </div>
          )
        )}
      </div>
    </section>
  )
}
