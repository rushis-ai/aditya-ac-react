import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SERVICES, validateLead, whatsappLink, submitLead, markLeadSent } from '../utils/lead'
import { PHONE_DISPLAY, PHONE_TEL, RATING, REVIEWS_URL } from '../config/business'
import { useOpenNow, OPENS_TEXT, CLOSES_TEXT } from '../utils/hours'
import { ArrowRight, CalendarCheck, CircleCheck, ShieldCheck, Star, Wrench, Zap, LoaderCircle, Lock, MapPin, Phone, Send } from 'lucide-react'
import { IconTile, InlineIcon, WhatsAppIcon } from '../components/Icons'

const TIMES = ['Morning (9 AM – 12 PM)', 'Afternoon (12 – 4 PM)', 'Evening (4 – 8 PM)', 'Anytime']

const labelStyle = { fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '0.02em' }
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 8 }
const hintStyle = { fontSize: 12, color: 'var(--gray-400)' }
const errorStyle = { fontSize: 12, color: '#ef4444', fontWeight: 600 }
const Req = () => <span style={{ color: '#ef4444' }} aria-hidden="true">*</span>

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [errors, setErrors] = useState({})
  const [lastData, setLastData] = useState(null)
  const open = useOpenNow()

  // "Book Online" card: smooth-scroll to the form and put the cursor in the first field
  const scrollToForm = (e) => {
    e.preventDefault()
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), 500)
  }

  useEffect(() => {
    document.title = 'Contact Us | Aditya Air Conditioning & Refrigeration Services'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Need AC or refrigeration services in Chandkheda, Motera, Ahmedabad? Contact Aditya Air Conditioning & Refrigeration Services for expert assistance.')
  }, [])

  const clearError = (field) => setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const { errors: errs, values } = validateLead(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      form.elements[Object.keys(errs)[0]].focus() // first invalid field (errs is in field order)
      return
    }

    const time = form.time.value
    const note = form.message.value.trim()
    const message = [time && `Preferred time: ${time}`, note].filter(Boolean).join(' | ')
    const fields = { ...values, message }
    setLastData(fields)

    // Spam trap filled = bot. Pretend success, send nothing.
    if (form.website.value) { setStatus('sent'); form.reset(); return }

    setStatus('sending')
    try {
      await submitLead(fields)
      markLeadSent()
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div style={{ paddingTop: 64 }}>

      {/* Page Header */}
      <section className="ct-hero">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 400, height: 400,
            background: 'var(--blue)', borderRadius: '50%',
            opacity: 0.06, top: -150, right: -80
          }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
          <span className={`ct-status ${open ? 'is-open' : ''}`}>
            <span className="ct-status-dot" aria-hidden="true" />
            {open ? `Open now · until ${CLOSES_TEXT}` : `Closed now · opens ${OPENS_TEXT}`}
          </span>
          <h1>Get Your AC Sorted</h1>
          <p className="ct-hero-sub">
            Call or WhatsApp for urgent repairs, or book a visit below and we'll call you to confirm a time.
          </p>
          <ul className="ct-chips">
            <li>
              <a href={REVIEWS_URL} target="_blank" rel="noreferrer">
                <Star size={14} fill="#f59e0b" color="#f59e0b" aria-hidden="true" /> {RATING} on Google
              </a>
            </li>
            <li><InlineIcon icon={Zap} size={14} /> Same-day visits</li>
            <li><InlineIcon icon={Wrench} size={14} /> All AC brands</li>
            <li><InlineIcon icon={ShieldCheck} size={14} /> Genuine parts</li>
          </ul>
        </motion.div>
      </section>

      {/* Ways to reach us: each card says when to use it */}
      <section className="ct-ways">
        <div className="container">
          <div className="ct-ways-grid">
            {[
              { icon: Phone, title: 'Call Us', note: 'Fastest for urgent breakdowns', info: PHONE_DISPLAY, action: 'Tap to call', href: `tel:${PHONE_TEL}`, color: 'var(--blue)' },
              { icon: WhatsAppIcon, title: 'WhatsApp', note: 'Send a photo or video of the problem', info: PHONE_DISPLAY, action: 'Chat now', href: whatsappLink(), color: '#16a34a' },
              { icon: CalendarCheck, title: 'Book Online', note: open ? 'We call back to confirm a time' : `We'll call after ${OPENS_TEXT}`, info: 'Takes 30 seconds', action: 'Fill the form', href: '#book', color: '#f59e0b' },
            ].map((card, i) => (
              <motion.a
                key={card.title}
                className="ct-way"
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                onClick={card.href === '#book' ? scrollToForm : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
              >
                <IconTile icon={card.icon} color={card.color} />
                <span className="ct-way-text">
                  <strong>{card.title}</strong>
                  <span className="ct-way-note">{card.note}</span>
                  <span className="ct-way-info">{card.info}</span>
                </span>
                <span className="ct-way-action" style={{ color: card.color }}>
                  {card.action} <InlineIcon icon={ArrowRight} size={14} />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section id="book" className="section" style={{ paddingTop: 56, scrollMarginTop: 64 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 56, alignItems: 'start'
          }}>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 28,
                fontWeight: 700, color: 'var(--navy)', marginBottom: 8
              }}>Book a Service</h2>
              <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.6 }}>
                No charges to book. You'll know the cost before any work starts.
              </p>
              <ol className="ct-steps">
                {[
                  ['Send your details', 'Takes 30 seconds'],
                  ['We call you', 'To confirm a time that suits you'],
                  ['Technician visits', 'Diagnoses and quotes before starting']
                ].map(([title, text], i) => (
                  <li key={title}>
                    <span className="ct-step-num">{i + 1}</span>
                    <span><strong>{title}</strong><small>{text}</small></span>
                  </li>
                ))}
              </ol>

              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="status"
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 24px',
                    textAlign: 'center'
                  }}
                >
                  <IconTile icon={CircleCheck} color="#16a34a" size={64} radius={32} style={{ margin: '0 auto 14px' }} />
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 20,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 8
                  }}>Request Sent!</h3>
                  <p style={{ fontSize: 15, color: 'var(--gray-600)' }}>
                    We'll contact you shortly to confirm your appointment.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    style={{
                      marginTop: 20, background: 'none',
                      border: 'none', color: 'var(--blue)',
                      fontWeight: 600, cursor: 'pointer', fontSize: 14
                    }}
                  >Submit another request</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {status === 'failed' && (
                    <div role="alert" style={{
                      background: '#fef2f2', border: '1.5px solid #fecaca',
                      borderRadius: 'var(--radius)', padding: '16px 18px'
                    }}>
                      <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, marginBottom: 10 }}>
                        Couldn't send your request. Check your connection and try again, or send it on WhatsApp.
                      </p>
                      <a
                        href={whatsappLink(lastData)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 14, fontWeight: 700, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      ><WhatsAppIcon size={16} /> Send these details on WhatsApp</a>
                    </div>
                  )}

                  {/* Spam trap: humans never see or fill this */}
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Name */}
                  <div style={fieldWrap}>
                    <label htmlFor="name" style={labelStyle}>Full Name <Req /></label>
                    <input
                      className="form-field"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. Rahul Shah"
                      autoComplete="name"
                      autoCapitalize="words"
                      required
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      onInput={() => clearError('name')}
                    />
                    {errors.name && <span id="name-error" style={errorStyle}>{errors.name}</span>}
                  </div>

                  {/* Phone */}
                  <div style={fieldWrap}>
                    <label htmlFor="phone" style={labelStyle}>Phone Number <Req /></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 15, color: 'var(--gray-600)',
                        fontWeight: 500, pointerEvents: 'none'
                      }}>+91</span>
                      <input
                        className="form-field"
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="98765 43210"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={16}
                        required
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                        onInput={() => clearError('phone')}
                        style={{ paddingLeft: 48 }}
                      />
                    </div>
                    {errors.phone
                      ? <span id="phone-error" style={errorStyle}>{errors.phone}</span>
                      : <span id="phone-hint" style={hintStyle}>Also accepts: +91 98765 43210 or 09876543210</span>}
                  </div>

                  {/* Service */}
                  <div style={fieldWrap}>
                    <label htmlFor="service" style={labelStyle}>Service Required <Req /></label>
                    <select
                      className="form-field form-select"
                      id="service"
                      name="service"
                      required
                      defaultValue=""
                      aria-invalid={!!errors.service}
                      aria-describedby={errors.service ? 'service-error' : undefined}
                      onChange={() => clearError('service')}
                    >
                      <option value="" disabled>Select a service...</option>
                      {SERVICES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    {errors.service && <span id="service-error" style={errorStyle}>{errors.service}</span>}
                  </div>

                  {/* Preferred time (optional) */}
                  <div style={fieldWrap}>
                    <label htmlFor="time" style={labelStyle}>
                      Preferred Time <span style={{ fontWeight: 500, color: 'var(--gray-400)' }}>(optional)</span>
                    </label>
                    <select className="form-field form-select" id="time" name="time" defaultValue="">
                      <option value="">No preference</option>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Message (optional) */}
                  <div style={fieldWrap}>
                    <label htmlFor="message" style={labelStyle}>
                      Area / Details <span style={{ fontWeight: 500, color: 'var(--gray-400)' }}>(optional)</span>
                    </label>
                    <textarea
                      className="form-field"
                      id="message"
                      name="message"
                      rows={3}
                      maxLength={500}
                      placeholder="Your area, AC brand, or the problem you're facing"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Submit */}
                  <button type="submit" className="form-submit" disabled={status === 'sending'}>
                    {status === 'sending'
                      ? <><InlineIcon icon={LoaderCircle} className="spin" /> Sending...</>
                      : <><InlineIcon icon={Send} /> Send Request</>}
                  </button>

                  <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', marginTop: -8 }}>
                    <InlineIcon icon={Lock} size={13} style={{ verticalAlign: -2 }} /> Your details are safe with us. We'll call you back shortly.
                  </p>

                </form>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {[
                { icon: MapPin, title: 'Our Location', content: 'Shop no.10, Vitthal Mall, New CG Rd, near ONGC Circle, Chandkheda, Ahmedabad 382424' },
              ].map((block, i) => (
                <div key={i} style={{
                  background: 'var(--gray-50)',
                  border: '1.5px solid var(--gray-100)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)', fontSize: 15,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}><InlineIcon icon={block.icon} size={17} style={{ color: 'var(--blue)' }} />{block.title}</h4>
                  <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                    {block.content}
                  </p>
                </div>
              ))}

              {/* Map */}
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1.5px solid var(--gray-100)',
                boxShadow: 'var(--shadow)'
              }}>
                <iframe
                  src="https://maps.google.com/maps?q=23.1065567,72.5979062&z=17&output=embed"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  title="Aditya AC Location"
                />
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, background: '#25D366',
                  color: 'white', borderRadius: 'var(--radius)',
                  padding: '14px 20px', textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600, fontSize: 15
                }}
              >
                <WhatsAppIcon size={22} />
                Chat on WhatsApp Instead
              </a>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  )
}