// Shared lead-form logic for the contact page and the popup.
import { getAttribution } from './attribution'
import { WHATSAPP } from '../config/business'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzGXRx4C-hUt-4XWPkR-wcSJXTAALEX4R2_EgLigDaZfiuPidj6-ztJv89m90rJiQ/exec'

export const SERVICES = [
  ['ac-installation', 'AC Installation'],
  ['ac-repair', 'AC Repair'],
  ['ac-cleaning', 'AC Deep Cleaning'],
  ['gas-refill', 'Gas Refill'],
  ['refrigeration', 'Refrigeration Repair'],
  ['amc', 'Annual Maintenance (AMC)'],
  ['other', 'Other']
]

// Accepts 9876543210, +91 98765 43210, 09876543210 -> 9876543210 (or null if invalid)
export function normalizePhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? d : null
}

// Validates the shared fields. Returns { errors, values }; errors are in field order.
export function validateLead(form) {
  const name = form.name.value.trim()
  const phone = normalizePhone(form.phone.value)
  const service = form.service.value
  const errors = {}
  if (name.length < 2) errors.name = 'Please enter your name.'
  if (!phone) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (!service) errors.service = 'Please choose a service.'
  return { errors, values: { name, phone, service } }
}

export function whatsappLink(d) {
  const service = SERVICES.find(([v]) => v === d?.service)?.[1] || ''
  const text = d
    ? [`Hi, I need ${service || 'AC service'}.`, `Name: ${d.name}`, `Phone: ${d.phone}`, d.message].filter(Boolean).join('\n')
    : 'Hi, I need AC service'
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
}

// Sends a lead to the Sheet with source attribution attached.
// Resolves { data, confirmed }:
//   confirmed: true   the script finished and sent back a readable reply that isn't an error
//   confirmed: false  the request went out but the reply couldn't be read. Apps Script only
//                     makes replies readable when doPost returns ContentService output; error
//                     pages and "returned nothing" pages can't be read. Treat as "probably sent".
// Rejects when the script reports an error, the device is offline, or after a 15s timeout.
// text/plain keeps this a "simple" request (no preflight), so it reaches doPost exactly as before.
export async function submitLead(fields) {
  const data = { ...fields, ...getAttribution() }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  let res
  try {
    res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      signal: ctrl.signal
    })
  } catch (err) {
    if (err.name === 'AbortError' || !navigator.onLine) throw err
    return { data, confirmed: false } // unreadable reply (see above)
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) throw new Error(`Lead endpoint returned ${res.status}`)
  const text = await res.text().catch(() => '')
  let reply = null
  try { reply = JSON.parse(text) } catch { /* plain-text reply */ }
  const failed = reply
    ? reply.ok === false || /^(error|fail)/i.test(String(reply.result ?? reply.status ?? ''))
    : /^\s*(error|fail)/i.test(text)
  if (failed) throw new Error(`Lead endpoint reported an error: ${text.slice(0, 200)}`)
  return { data, confirmed: true }
}

// Remember a submission so the popup never shows to someone who already sent a lead
export function markLeadSent() {
  try { localStorage.setItem('lead_sent', String(Date.now())) } catch { /* storage blocked */ }
}
