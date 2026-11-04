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
// Resolves on send, rejects on network failure / 15s timeout.
// no-cors: the response can't be read, but the request still rejects on failure.
export async function submitLead(fields) {
  const data = { ...fields, ...getAttribution() }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // only type allowed in no-cors
      body: JSON.stringify(data),
      signal: ctrl.signal
    })
  } finally {
    clearTimeout(timer)
  }
  return data
}

// Remember a submission so the popup never shows to someone who already sent a lead
export function markLeadSent() {
  try { localStorage.setItem('lead_sent', String(Date.now())) } catch { /* storage blocked */ }
}
