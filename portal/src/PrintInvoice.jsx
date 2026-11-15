import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BUSINESS } from './business.js'
import { fmtMoney } from './lib.js'
import Logo from './Logo.jsx'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// "2026-11-15T10:30" -> "15 Nov 2026"
const longDate = (s) => {
  const [y, m, d] = (s || '').slice(0, 10).split('-').map(Number)
  return y ? `${d} ${MON[m - 1]} ${y}` : ''
}

// 4000 -> "Four Thousand", using lakh and crore
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
function below100(n) {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}
function below1000(n) {
  const h = Math.floor(n / 100)
  const r = n % 100
  return [h ? ONES[h] + ' Hundred' : '', r ? below100(r) : ''].filter(Boolean).join(' ')
}
export function inWords(n) {
  if (!n) return 'Zero'
  const parts = []
  for (const [size, name] of [[1e7, 'Crore'], [1e5, 'Lakh'], [1e3, 'Thousand']]) {
    const q = Math.floor(n / size)
    if (q) parts.push((q >= 1000 ? inWords(q) : below1000(q)) + ' ' + name)
    n %= size
  }
  if (n) parts.push(below1000(n))
  return parts.join(' ')
}

// The invoice as the customer sees it. Rendered outside the app and shown only when printing,
// so the browser's "Save as PDF" gives a clean A4 page.
export default function PrintInvoice({ invoice, onDone }) {
  useEffect(() => {
    const title = document.title
    // The browser suggests the page title as the PDF's file name
    document.title = invoice.number || 'Draft invoice'
    document.body.classList.add('printing')
    const done = () => {
      document.body.classList.remove('printing')
      document.title = title
      onDone()
    }
    window.addEventListener('afterprint', done, { once: true })
    const t = setTimeout(() => window.print(), 50) // let the sheet render first
    return () => {
      clearTimeout(t)
      window.removeEventListener('afterprint', done)
      document.body.classList.remove('printing')
      document.title = title
    }
  }, [invoice, onDone])

  const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.rate, 0)
  const stamp = invoice.status === 'Cancelled' ? 'Cancelled' : invoice.status === 'Draft' ? 'Draft' : ''

  return createPortal(
    <div className="print-sheet">
      {stamp && <div className="ps-stamp">{stamp}</div>}
      <header className="ps-head">
        <div className="ps-seller">
          <Logo size={44} id="logo-print" />
          <div>
            <h1>{BUSINESS.name}</h1>
            {BUSINESS.address.map((l) => <p key={l}>{l}</p>)}
            <p>{BUSINESS.phone} · {BUSINESS.website}</p>
          </div>
        </div>
        <div className="ps-title">
          <h2>Invoice</h2>
          <dl>
            <div><dt>Invoice no.</dt><dd>{invoice.number || 'Not issued'}</dd></div>
            <div><dt>Date</dt><dd>{longDate(invoice.issuedAt || invoice.createdAt)}</dd></div>
          </dl>
        </div>
      </header>

      <section className="ps-bill">
        <h3>Bill to</h3>
        <p className="ps-customer">{invoice.customer}</p>
        {invoice.address && <p className="ps-pre">{invoice.address}</p>}
        {invoice.phone && <p>{invoice.phone}</p>}
      </section>

      <table className="ps-items">
        <thead>
          <tr><th>#</th><th>Description</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td>{i + 1}</td><td>{it.desc}</td><td className="r">{it.qty}</td>
              <td className="r">{fmtMoney(it.rate)}</td><td className="r">{fmtMoney(it.qty * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ps-sum">
        <p className="ps-words">Amount in words: <strong>Rupees {inWords(invoice.total)} Only</strong></p>
        <dl>
          <div><dt>Subtotal</dt><dd>{fmtMoney(subtotal)}</dd></div>
          {invoice.discount > 0 && <div><dt>Discount</dt><dd>− {fmtMoney(invoice.discount)}</dd></div>}
          <div className="ps-total"><dt>Total</dt><dd>{fmtMoney(invoice.total)}</dd></div>
        </dl>
      </div>

      {invoice.status === 'Cancelled' && <p className="ps-note">This invoice was cancelled on {longDate(invoice.cancelledAt)}. Reason: {invoice.cancelReason}</p>}
      {invoice.status === 'Draft' && <p className="ps-note">Draft for review. This is not a valid invoice until it is issued with a number.</p>}

      <footer className="ps-foot">
        <p>Thank you for your business.</p>
        <p>This is a computer-generated invoice and does not need a signature.</p>
      </footer>
    </div>,
    document.body
  )
}
