import { useEffect, useState, useSyncExternalStore } from 'react'
import Seo from '../components/Seo'
import Logo from '../components/Logo'
import { motion, useReducedMotion } from 'framer-motion'
import { reviews } from '../config/reviews'
import { site } from '../content'
import { SERVICES, validateLead, whatsappLink, submitLead, markLeadSent } from '../utils/lead'
import { track, trackLeadResult } from '../utils/analytics'
import { PHONE_DISPLAY, PHONE_TEL, RATING, REVIEWS_URL } from '../config/business'
import { useOpenNow, OPENS_TEXT, CLOSES_TEXT } from '../utils/hours'
import {
  ArrowLeft, ChevronDown, CircleCheck, Check, CircleHelp, MousePointerClick, PhoneCall, Wrench, Droplets, LoaderCircle, Lock, MapPin, PackagePlus, Phone,
  PowerOff, Refrigerator, ShieldCheck, Snowflake, Sparkles, Star, UserPlus, Volume2, Wallet
} from 'lucide-react'
import { IconTile, InlineIcon, Stars, WhatsAppIcon } from '../components/Icons'

// Ad landing page (/book). Not in the sitemap and noindex: it exists for paid traffic.
// Point each ad group at /book?service=<value> (values from SERVICES in utils/lead.js)
// to match the headline to the ad and skip straight to the contact step.
const HEADLINES = {
  default: ['AC Repair & Service,', 'Same Day.'],
  'ac-repair': ['AC Not Cooling?', 'Same-Day Repair.'],
  'ac-installation': ['AC Installation,', 'Done Right, Same Day.'],
  'ac-cleaning': ['AC Deep Cleaning,', 'Better Cooling Today.'],
  'gas-refill': ['AC Gas Refill,', 'Cooling Back Today.'],
  refrigeration: ['Fridge Not Cooling?', 'Same-Day Repair.'],
  amc: ['AC Annual Maintenance,', 'No More Breakdowns.'],
}

// Step 1 of the form: the problem in the visitor's own words -> service value for the sheet.
// Tapping one is a small first commitment, and easier than knowing what service you need.
// The first one is the most common reason people book, so it gets a "Most common" tag.
const PROBLEMS = [
  ['not-cooling', 'Not cooling', 'ac-repair', Snowflake],
  ['leaking', 'Leaking water', 'ac-repair', Droplets],
  ['noise', 'Noise or smell', 'ac-repair', Volume2],
  ['no-power', "Won't turn on", 'ac-repair', PowerOff],
  ['service', 'Service / cleaning', 'ac-cleaning', Sparkles],
  ['install', 'New installation', 'ac-installation', PackagePlus],
  ['fridge', 'Fridge repair', 'refrigeration', Refrigerator],
  ['other', 'Something else', 'other', CircleHelp],
]

// Short chips under the headline (the FAQ and steps carry the detail)
const POINTS = [
  [Wallet, 'Free to book'],
  [Wrench, 'All brands'],
  [ShieldCheck, 'Genuine parts'],
]

// Two-segment progress bar for the form (step 1 shows a head start so it already feels underway)
const Progress = ({ step }) => (
  <div className="lp-progress">
    <span className="lp-progress-bar" aria-hidden="true">
      <span><i style={{ width: step === 1 ? '55%' : '100%' }} /></span>
      <span><i style={{ width: step === 2 ? '55%' : '0%' }} /></span>
    </span>
    <span className="lp-stepno">Step {step} of 2</span>
  </div>
)

// Brands strip under the hero. Keep this to brands the team really services.
const BRANDS = ['Daikin', 'Voltas', 'LG', 'Samsung', 'Blue Star', 'Hitachi', 'Carrier', 'Lloyd', 'Panasonic', 'Godrej']

// Optional starting visit charge, e.g. 299. Shown in the hero only when set.
const VISIT_FROM = null

// Google "G", for the rating badge
const GoogleG = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
)

const STEPS = [
  [MousePointerClick, 'Tell us the problem', 'Tap the problem and leave your number', '20 seconds'],
  [PhoneCall, 'We call you back', 'To confirm a time that suits you', 'Quick call back'],
  [Wrench, 'Technician visits', 'Checks the AC and quotes before starting', 'Same day'],
]

// Only facts the site already states. Add a visit-charge answer once the figure is confirmed.
const FAQS = [
  ['How fast can a technician come?', 'Usually the same day. After you book we call you back to fix a time that suits you.'],
  ['Will I know the price before any work starts?', 'Yes. Booking is free. The technician checks the AC first and tells you the price, and work only starts once you agree.'],
  ['Which brands and types do you repair?', 'All AC brands: split, window and cassette units. We repair fridges too.'],
  ['Do you use genuine spare parts?', 'Yes. We fit genuine spare parts, handled by experienced technicians.'],
  ['What are your hours?', `We're open ${OPENS_TEXT} to ${CLOSES_TEXT}. Book any time and we'll call you during opening hours.`],
]

// Fade-and-rise when a section scrolls into view; no movement for visitors who ask for reduced motion
const Reveal = ({ children, delay = 0, className, as = 'div' }) => {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  if (reduce) { const Plain = as; return <Plain className={className}>{children}</Plain> }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

const initials = (name) => name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
const AVATAR_COLORS = ['#1a56db', '#0891b2', '#7c3aed', '#db2777', '#ea580c']

// ?service=... from the URL. The page is prerendered without a query string, so the
// server snapshot is '' and the ad-specific headline/step apply right after hydration.
const noSubscribe = () => () => {}
const serviceFromUrl = () => {
  const s = new URLSearchParams(location.search).get('service')
  return SERVICES.some(([v]) => v === s) ? s : ''
}
// Visitors arriving from a service hub page (?from=hub-...) get a booking-only page, no call buttons
const fromHubUrl = () => (new URLSearchParams(location.search).get('from') || '').startsWith('hub-')

// "Save our number" on the thank-you screen, so the callback isn't ignored as an unknown caller
const VCARD = `data:text/vcard;charset=utf-8,${encodeURIComponent(
  `BEGIN:VCARD\nVERSION:3.0\nFN:${site.siteName}\nORG:${site.siteName}\nTEL;TYPE=WORK,VOICE:${PHONE_TEL}\nEND:VCARD\n`
)}`

const errorStyle = { fontSize: 12, color: '#ef4444', fontWeight: 600 }

// Focus the first thing to fill in the card: a problem button on step 1, the name field on step 2
const focusCard = () => document.querySelector('#book input[name="name"], #book .lp-chip')?.focus({ preventScroll: true })

export default function Landing() {
  const open = useOpenNow()
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [errors, setErrors] = useState({})
  const [lastData, setLastData] = useState(null)
  const urlService = useSyncExternalStore(noSubscribe, serviceFromUrl, () => '')
  const fromHub = useSyncExternalStore(noSubscribe, fromHubUrl, () => false)
  const [problem, setProblem] = useState(null) // key from PROBLEMS
  const [changing, setChanging] = useState(false) // visitor tapped "Change" on a URL-preselected service

  const chosen = PROBLEMS.find(([key]) => key === problem)
  const service = chosen ? chosen[2] : (changing ? '' : urlService)
  const choiceLabel = chosen ? chosen[1] : SERVICES.find(([v]) => v === service)?.[1]
  const [line1, line2] = HEADLINES[urlService] || HEADLINES.default

  // Phones: the sticky action bar only appears once the form card has scrolled out of view
  const [showSticky, setShowSticky] = useState(false)
  useEffect(() => {
    const card = document.getElementById('book')
    if (!card || !('IntersectionObserver' in window)) return // very old browsers: the form is right there anyway
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0.15 })
    io.observe(card)
    return () => io.disconnect()
  }, [])

  const goToForm = (e) => {
    e?.preventDefault()
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(focusCard, 450)
  }

  const pickProblem = (key) => {
    if (!problem) track('form_start', { form: 'landing', problem: key })
    setProblem(key)
    setTimeout(focusCard, 50)
  }

  const backToProblems = () => {
    setProblem(null)
    setChanging(true)
    setErrors({})
    setTimeout(focusCard, 50)
  }

  const clearError = (field) => setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const { errors: errs, values } = validateLead(form)
    setErrors(errs)
    if (errs.service) { backToProblems(); return }
    if (Object.keys(errs).length) { form.elements[Object.keys(errs)[0]].focus(); return }

    setLastData(values)
    if (form.website.value) { setStatus('sent'); return } // spam trap

    const message = ['Via ad landing page', chosen && `Problem: ${chosen[1]}`].filter(Boolean).join(' | ')
    setStatus('sending')
    try {
      const { confirmed } = await submitLead({ ...values, message })
      markLeadSent()
      // from=hub-<slug> when the visitor came from a service hub page
      const from = new URLSearchParams(location.search).get('from') || undefined
      trackLeadResult(confirmed, { form: 'landing', service: values.service, from })
      setStatus('sent')
    } catch {
      track('form_error', { form: 'landing' })
      setStatus('failed')
    }
  }

  const firstName = lastData?.name.split(/\s+/)[0]

  return (
    <div className="lp">
      <Seo
        title="Book AC Repair & Service | Same-Day Visit"
        description="Book a same-day AC repair, service or installation. All brands, genuine parts, price confirmed before work starts."
        noindex
      />

      {/* Slim header: logo + call, no menu, so visitors stay on the offer */}
      <header className="lp-header">
        <Logo size={36} />
        {!fromHub && (
          <a href={`tel:${PHONE_TEL}`} className="lp-header-call" data-track="lp-header">
            <InlineIcon icon={Phone} size={16} /> <span>{PHONE_DISPLAY}</span>
          </a>
        )}
      </header>

      {/* Hero + form. On phones the form comes straight after the headline. */}
      <section className="lp-hero">
        {/* Swap for a real photo of the team at work when available: subject on the right, space on the left.
            WebP copies: 1200px for desktop, a right-side crop at 640px for phones; the JPEG is the fallback. */}
        <picture>
          <source media="(max-width: 900px)" srcSet="/uploads/lp-hero-640.webp" type="image/webp" />
          <source srcSet="/uploads/lp-hero-1200.webp" type="image/webp" />
          <img className="lp-hero-photo" src="/uploads/banner-ac-not-cooling.jpg" alt="" fetchPriority="high" decoding="async" />
        </picture>
        <div className="lp-hero-inner">
          <div className="lp-head">
            {/* Closed hours are framed as a head start, not a reason to leave */}
            <span className={`ct-status ${open ? 'is-open' : 'lp-status-later'}`}>
              <span className="ct-status-dot" aria-hidden="true" />
              {open ? `Open now · until ${CLOSES_TEXT}` : `Book now · we'll call you first thing at ${OPENS_TEXT}`}
            </span>
            <h1>{line1}<br /><span>{line2}</span></h1>
            <p className="lp-sub">A technician at your door the same day, with the price confirmed before any work starts.</p>
            <a href={REVIEWS_URL} target="_blank" rel="noreferrer" className="lp-badge">
              <GoogleG size={22} />
              <Stars size={16} />
              <span><strong>{RATING}</strong> on Google</span>
            </a>
          </div>

          <div className="lp-card" id="book">
            {status === 'sent' ? (
              <div className="lp-card-body lp-done" role="status">
                <IconTile icon={CircleCheck} color="#16a34a" size={64} radius={32} />
                <h2>Thanks{firstName ? `, ${firstName}` : ''}! Request received.</h2>
                <p>
                  {open
                    ? "We'll call you shortly to confirm your visit."
                    : `We'll call you first thing at ${OPENS_TEXT} to confirm your visit.`}
                </p>
                <div className="lp-save">
                  <strong>Save our number</strong> so you recognise our call:
                  <a href={VCARD} download="contact.vcf" className="btn-primary" onClick={() => track('click_save_contact', { page: location.pathname })}>
                    <InlineIcon icon={UserPlus} size={16} /> Save {PHONE_DISPLAY}
                  </a>
                </div>
                <div className="lp-alt">
                  <a href={`tel:${PHONE_TEL}`} data-track="lp-thanks"><InlineIcon icon={Phone} size={15} /> Urgent? Call</a>
                  <a href={whatsappLink(lastData)} target="_blank" rel="noreferrer" data-track="lp-thanks"><WhatsAppIcon size={15} /> WhatsApp us</a>
                </div>
              </div>
            ) : !service ? (
              /* Step 1: one tap, no typing */
              <div className="lp-card-body">
                <Progress step={1} />
                <h2>What's the problem?</h2>
                <p className="lp-card-sub">Tap one. Free to book, no obligation.</p>
                <div className="lp-chips" role="group" aria-label="What's the problem?">
                  {PROBLEMS.map(([key, label, , icon], i) => (
                    <button key={key} type="button" className={`lp-chip${i === 0 ? ' is-top' : ''}`} onClick={() => pickProblem(key)}>
                      {i === 0 && <span className="lp-chip-tag">Most common</span>}
                      <InlineIcon icon={icon} size={20} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="lp-alt">
                  <a href={`tel:${PHONE_TEL}`} data-track="lp-form"><InlineIcon icon={Phone} size={15} /> Call</a>
                  <a href={whatsappLink()} target="_blank" rel="noreferrer" data-track="lp-form"><WhatsAppIcon size={15} /> WhatsApp</a>
                </div>
              </div>
            ) : (
              /* Step 2: just name and number */
              <form className="lp-card-body" onSubmit={handleSubmit} noValidate>
                <Progress step={2} />
                <p className="lp-choice">
                  <InlineIcon icon={Check} size={16} /> {choiceLabel}
                  <button type="button" onClick={backToProblems}><InlineIcon icon={ArrowLeft} size={13} /> Change</button>
                </p>
                <h2>Where should we call you?</h2>

                {status === 'failed' && (
                  <div role="alert" className="popup-alert">
                    Couldn't send. Check your connection, or{' '}
                    <a href={whatsappLink(lastData)} target="_blank" rel="noreferrer">send it on WhatsApp</a>.
                  </div>
                )}

                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="lp-website">Website</label>
                  <input type="text" id="lp-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <input type="hidden" name="service" value={service} />

                <label htmlFor="lp-name">Your name</label>
                <input
                  className="form-field" id="lp-name" name="name"
                  placeholder="e.g. Rahul Shah" autoComplete="name" autoCapitalize="words"
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? 'lp-name-error' : undefined}
                  onInput={() => clearError('name')}
                />
                {errors.name && <span id="lp-name-error" style={errorStyle}>{errors.name}</span>}

                <label htmlFor="lp-phone">Mobile number</label>
                <div style={{ position: 'relative' }}>
                  <span className="popup-prefix">+91</span>
                  <input
                    className="form-field" id="lp-phone" name="phone" type="tel"
                    placeholder="98765 43210" autoComplete="tel" inputMode="tel" maxLength={16}
                    aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'lp-phone-error' : undefined}
                    onInput={() => clearError('phone')}
                    style={{ paddingLeft: 48 }}
                  />
                </div>
                {errors.phone && <span id="lp-phone-error" style={errorStyle}>{errors.phone}</span>}

                <button type="submit" className="form-submit" disabled={status === 'sending'} style={{ marginTop: 10 }}>
                  {status === 'sending'
                    ? <><InlineIcon icon={LoaderCircle} className="spin" /> Sending...</>
                    : <><InlineIcon icon={Phone} /> Call Me Back</>}
                </button>
                <p className="popup-note">
                  <InlineIcon icon={Lock} size={12} style={{ verticalAlign: -1 }} /> Free to book · we only use your number for this request
                </p>
                <a href={REVIEWS_URL} target="_blank" rel="noreferrer" className="lp-card-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" aria-hidden="true" />
                  <strong>{RATING}</strong> on Google
                </a>
              </form>
            )}
          </div>

          <div className="lp-rest">
            <ul className="lp-points">
              {POINTS.map(([icon, label]) => (
                <li key={label}><InlineIcon icon={icon} size={16} /> {label}</li>
              ))}
            </ul>
            {VISIT_FROM && <p className="lp-price">Visit charge from <strong>₹{VISIT_FROM}</strong>, adjusted against the repair</p>}
          </div>
        </div>
      </section>

      {/* Brands strip (replaces the trust bar here, whose points the hero already makes) */}
      <section className="lp-brands" aria-label="Brands we service">
        <span className="lp-brands-label">We service all major brands</span>
        <ul>{BRANDS.map(b => <li key={b}>{b}</li>)}</ul>
      </section>

      {/* How it works */}
      <section className="section lp-steps-section">
        <div className="container">
          <Reveal className="section-header" >
            <span className="section-tag">How it works</span>
            <h2>Cool again in three steps</h2>
          </Reveal>
          <ol className="lp-steps">
            {STEPS.map(([icon, title, text, time], i) => (
              <Reveal as="li" key={title} delay={i * 0.12}>
                <span className="lp-step-icon">
                  <InlineIcon icon={icon} size={26} />
                  <span className="lp-step-no">{i + 1}</span>
                </span>
                <strong>{title}</strong>
                <small>{text}</small>
                <span className="lp-step-time">{time}</span>
              </Reveal>
            ))}
          </ol>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#book" className="btn-primary" onClick={goToForm}>Book a technician</a>
          </div>
        </div>
      </section>

      {/* Reviews: swipeable row on phones */}
      <section className="section lp-reviews-section">
        <div className="container">
          <Reveal className="section-header">
            <span className="section-tag">Google reviews</span>
            <h2>What customers say</h2>
          </Reveal>
          {/* The row animates as one block: per-card reveals would hide the card peeking in from the side on phones */}
          <Reveal as="ul" className="lp-reviews">
            {reviews.map((r, i) => (
              <li key={r.name}>
                <div className="lp-review-top">
                  <Stars size={15} />
                  <GoogleG size={18} />
                </div>
                <p>{r.text}</p>
                <div className="lp-review-who">
                  <span className="lp-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} aria-hidden="true">{initials(r.name)}</span>
                  <span>
                    <strong>{r.name}</strong>
                    {(r.area || r.when) && <small>{[r.area, r.when].filter(Boolean).join(' · ')}</small>}
                  </span>
                </div>
              </li>
            ))}
          </Reveal>
          <a href={REVIEWS_URL} target="_blank" rel="noreferrer" className="lp-reviews-all">
            <GoogleG size={20} /> <strong>{RATING}</strong> on Google · <span>Read all reviews</span>
          </a>
        </div>
      </section>

      {/* Common doubts, answered before they become a reason not to book */}
      <section className="section lp-faq-section">
        <div className="container lp-faq">
          <Reveal className="section-header">
            <span className="section-tag">Questions</span>
            <h2>Before you book</h2>
          </Reveal>
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.06}>
              <details>
                <summary>{q}<InlineIcon icon={ChevronDown} size={18} /></summary>
                <p>{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA: the honest cost of waiting */}
      <section className="lp-final">
        <h2>Don't spend another night in the heat.</h2>
        <p>
          Small problems left alone, like a slow gas leak, can end up damaging the compressor,
          which is a much costlier fix. Book now and we'll call you to fix a time.
        </p>
        <a href="#book" className="btn-primary" onClick={goToForm}>Get a call back</a>
      </section>

      <footer className="lp-footer">
        <p><InlineIcon icon={MapPin} size={14} /> Shop no.10, Vitthal Mall, New CG Rd, near ONGC Circle, Chandkheda, Ahmedabad 382424</p>
        <p>Open {OPENS_TEXT} – {CLOSES_TEXT} · <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a> · <a href="/">Main website</a></p>
      </footer>

      {/* Phones: action bar always in reach */}
      <div className={`lp-sticky${showSticky ? ' is-visible' : ''}`} data-track="lp-sticky" aria-hidden={!showSticky} inert={!showSticky}>
        {!fromHub && (
          <a href={`tel:${PHONE_TEL}`} className="lp-sticky-call" aria-label={`Call ${PHONE_DISPLAY}`}>
            <InlineIcon icon={Phone} size={20} />
          </a>
        )}
        <a href="#book" className="lp-sticky-book" onClick={goToForm}>
          <span>Call Me Back</span>
          <small><Star size={11} fill="#fbbf24" color="#fbbf24" aria-hidden="true" /> {RATING} on Google</small>
        </a>
      </div>
    </div>
  )
}
