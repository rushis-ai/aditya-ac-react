import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark } from './Logo'
import { SERVICES, validateLead, whatsappLink, submitLead, markLeadSent } from '../utils/lead'
import { CircleCheck, LoaderCircle, Lock, Phone } from 'lucide-react'
import { IconTile, InlineIcon } from './Icons'

// When the callback popup appears
const RULES = {
  delayMs: 25000,          // after 25s on the site...
  scrollRatio: 0.6,        // ...or after scrolling 60% of a page...
  exitIntentAfterMs: 6000, // ...or when the mouse heads for the tab bar (desktop), after 6s
  snoozeDays: 3,           // closed it? don't show again for 3 days
  hiddenOn: ['/contact']   // pages that already have the form
}

// Storage can throw (private mode, blocked cookies), so every access is guarded
const store = {
  get: (s, k) => { try { return s.getItem(k) } catch { return null } },
  set: (s, k, v) => { try { s.setItem(k, v) } catch { /* ignore */ } }
}

function allowedToShow() {
  if (new URLSearchParams(location.search).get('popup') === '1') return true // testing: ?popup=1
  if (store.get(localStorage, 'lead_sent')) return false
  const snoozed = Number(store.get(localStorage, 'popup_closed') || 0)
  if (Date.now() - snoozed < RULES.snoozeDays * 86400000) return false
  return !store.get(sessionStorage, 'popup_shown')
}

// Closing snoozes the popup for a few days (a sent lead blocks it for good anyway)
function dismiss(setOpen, lastFocus) {
  setOpen(false)
  store.set(localStorage, 'popup_closed', String(Date.now()))
  lastFocus.current?.focus?.()
}

const fieldLabel = { fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '0.02em' }
const errorStyle = { fontSize: 12, color: '#ef4444', fontWeight: 600 }

export default function PopupForm() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [errors, setErrors] = useState({})
  const [lastData, setLastData] = useState(null)
  const firstField = useRef(null)
  const lastFocus = useRef(null)
  const hiddenHere = RULES.hiddenOn.includes(pathname)

  // Arm the triggers
  useEffect(() => {
    if (hiddenHere || !allowedToShow()) return
    const start = Date.now()
    const forced = new URLSearchParams(location.search).get('popup') === '1'
    let done = false
    const show = () => {
      if (done || !allowedToShow()) return
      done = true
      store.set(sessionStorage, 'popup_shown', '1')
      lastFocus.current = document.activeElement
      setOpen(true)
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      if (max > 0 && scrollY / max >= RULES.scrollRatio) show()
    }
    const onMouseOut = (e) => {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start > RULES.exitIntentAfterMs) show()
    }
    const timer = setTimeout(show, forced ? 800 : RULES.delayMs)
    addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseout', onMouseOut)
    return () => {
      clearTimeout(timer)
      removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [hiddenHere])

  // While open: lock page scroll, focus the first field, Esc closes
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => firstField.current?.focus(), 250)
    const onKey = (e) => { if (e.key === 'Escape') dismiss(setOpen, lastFocus) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => dismiss(setOpen, lastFocus)

  const clearError = (field) => setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const { errors: errs, values } = validateLead(form)
    setErrors(errs)
    if (Object.keys(errs).length) { form.elements[Object.keys(errs)[0]].focus(); return }

    const fields = { ...values, message: 'Via popup' } // tells you which form the lead came from
    setLastData(values) // WhatsApp fallback text, without the internal note
    if (form.website.value) { setStatus('sent'); return } // spam trap

    setStatus('sending')
    try {
      await submitLead(fields)
      markLeadSent()
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  // Leaving for the contact page while open: just hide it
  if (hiddenHere && open) setOpen(false)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="popup-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <motion.div
            className="popup-card"
            role="dialog" aria-modal="true" aria-labelledby="popup-title"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <button type="button" className="popup-close" onClick={close} aria-label="Close">×</button>

            {/* Header band */}
            <div className="popup-head">
              <LogoMark size={44} />
              <div>
                <h2 id="popup-title">AC giving trouble?</h2>
                <p>Leave your number and we'll call you back — open till 11:30 PM.</p>
              </div>
            </div>

            {status === 'sent' ? (
              <div className="popup-body" role="status" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <IconTile icon={CircleCheck} color="#16a34a" size={60} radius={30} style={{ marginBottom: 12 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', marginBottom: 6 }}>
                  Got it!
                </h3>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20 }}>
                  We'll call you shortly to confirm your appointment.
                </p>
                <button type="button" className="form-submit" onClick={close}>Close</button>
              </div>
            ) : (
              <form className="popup-body" onSubmit={handleSubmit} noValidate>
                {status === 'failed' && (
                  <div role="alert" className="popup-alert">
                    Couldn't send. Check your connection, or{' '}
                    <a href={whatsappLink(lastData)} target="_blank" rel="noreferrer">send it on WhatsApp</a>.
                  </div>
                )}

                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="pp-website">Website</label>
                  <input type="text" id="pp-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <label htmlFor="pp-name" style={fieldLabel}>Your Name</label>
                <input
                  ref={firstField} className="form-field" id="pp-name" name="name"
                  placeholder="e.g. Rahul Shah" autoComplete="name" autoCapitalize="words"
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? 'pp-name-error' : undefined}
                  onInput={() => clearError('name')}
                />
                {errors.name && <span id="pp-name-error" style={errorStyle}>{errors.name}</span>}

                <label htmlFor="pp-phone" style={fieldLabel}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span className="popup-prefix">+91</span>
                  <input
                    className="form-field" id="pp-phone" name="phone" type="tel"
                    placeholder="98765 43210" autoComplete="tel" inputMode="tel" maxLength={16}
                    aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'pp-phone-error' : undefined}
                    onInput={() => clearError('phone')}
                    style={{ paddingLeft: 48 }}
                  />
                </div>
                {errors.phone && <span id="pp-phone-error" style={errorStyle}>{errors.phone}</span>}

                <label htmlFor="pp-service" style={fieldLabel}>Service</label>
                <select
                  className="form-field form-select" id="pp-service" name="service" defaultValue=""
                  aria-invalid={!!errors.service} aria-describedby={errors.service ? 'pp-service-error' : undefined}
                  onChange={() => clearError('service')}
                >
                  <option value="" disabled>Select a service...</option>
                  {SERVICES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                {errors.service && <span id="pp-service-error" style={errorStyle}>{errors.service}</span>}

                <button type="submit" className="form-submit" disabled={status === 'sending'} style={{ marginTop: 8 }}>
                  {status === 'sending'
                    ? <><InlineIcon icon={LoaderCircle} className="spin" /> Sending...</>
                    : <><InlineIcon icon={Phone} /> Get a Call Back</>}
                </button>
                <p className="popup-note"><InlineIcon icon={Lock} size={12} style={{ verticalAlign: -1 }} /> We only use your number to call you about this request.</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
