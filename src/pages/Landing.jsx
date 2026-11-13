import { useState, useSyncExternalStore } from 'react'
import Seo from '../components/Seo'
import Logo from '../components/Logo'
import TrustBar from '../components/TrustBar'
import Testimonials from '../components/Testimonials'
import { site } from '../content'
import { SERVICES, validateLead, whatsappLink, submitLead, markLeadSent } from '../utils/lead'
import { track, trackLeadResult } from '../utils/analytics'
import { PHONE_DISPLAY, PHONE_TEL, RATING, REVIEW_COUNT, REVIEWS_URL } from '../config/business'
import { useOpenNow, OPENS_TEXT, CLOSES_TEXT } from '../utils/hours'
import { ArrowLeft, CircleCheck, Check, LoaderCircle, Lock, MapPin, Phone, Star, UserPlus } from 'lucide-react'
import { IconTile, InlineIcon, WhatsAppIcon } from '../components/Icons'

// Ad landing page (/book). Not in the sitemap and noindex: it exists for paid traffic.
// Point each ad group at /book?service=<value> (values from SERVICES in utils/lead.js)
// to match the headline to the ad and skip straight to the contact step.
const HEADLINES = {
  default: ['AC Repair & Service in Ahmedabad,', 'Same Day.'],
  'ac-repair': ['AC Not Cooling?', 'Same-Day Repair.'],
  'ac-installation': ['AC Installation,', 'Done Right, Same Day.'],
  'ac-cleaning': ['AC Deep Cleaning,', 'Better Cooling Today.'],
  'gas-refill': ['AC Gas Refill,', 'Cooling Back Today.'],
  refrigeration: ['Fridge Not Cooling?', 'Same-Day Repair.'],
  amc: ['AC Annual Maintenance,', 'No More Breakdowns.'],
}

// Step 1 of the form: the problem in the visitor's own words -> service value for the sheet.
// Tapping one is a small first commitment, and easier than knowing what service you need.
const PROBLEMS = [
  ['not-cooling', 'Not cooling', 'ac-repair'],
  ['leaking', 'Leaking water', 'ac-repair'],
  ['noise', 'Noise or smell', 'ac-repair'],
  ['no-power', "Won't turn on", 'ac-repair'],
  ['service', 'Service / cleaning', 'ac-cleaning'],
  ['install', 'New installation', 'ac-installation'],
  ['fridge', 'Fridge repair', 'refrigeration'],
  ['other', 'Something else', 'other'],
]

const POINTS = [
  'Free to book: you get the price before any work starts',
  'All AC brands: split, window and cassette',
  'Genuine spare parts, experienced technicians',
]

const STEPS = [
  ['Tell us the problem', 'Takes 20 seconds'],
  ['We call you back', 'To confirm a time that suits you'],
  ['Technician visits', 'Checks the AC and quotes before starting'],
]

// ?service=... from the URL. The page is prerendered without a query string, so the
// server snapshot is '' and the ad-specific headline/step apply right after hydration.
const noSubscribe = () => () => {}
const serviceFromUrl = () => {
  const s = new URLSearchParams(location.search).get('service')
  return SERVICES.some(([v]) => v === s) ? s : ''
}

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
  const [problem, setProblem] = useState(null) // key from PROBLEMS
  const [changing, setChanging] = useState(false) // visitor tapped "Change" on a URL-preselected service

  const chosen = PROBLEMS.find(([key]) => key === problem)
  const service = chosen ? chosen[2] : (changing ? '' : urlService)
  const choiceLabel = chosen ? chosen[1] : SERVICES.find(([v]) => v === service)?.[1]
  const [line1, line2] = HEADLINES[urlService] || HEADLINES.default

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
      trackLeadResult(confirmed, { form: 'landing', service: values.service })
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
        <a href={`tel:${PHONE_TEL}`} className="lp-header-call" data-track="lp-header">
          <InlineIcon icon={Phone} size={16} /> <span>{PHONE_DISPLAY}</span>
        </a>
      </header>

      {/* Hero + form. On phones the form comes straight after the headline. */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-head">
            {/* Closed hours are framed as a head start, not a reason to leave */}
            <span className={`ct-status ${open ? 'is-open' : 'lp-status-later'}`}>
              <span className="ct-status-dot" aria-hidden="true" />
              {open ? `Open now · until ${CLOSES_TEXT}` : `Book now · we'll call you first thing at ${OPENS_TEXT}`}
            </span>
            <h1>{line1}<br /><span>{line2}</span></h1>
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
                <span className="lp-stepno">Step 1 of 2</span>
                <h2>What's the problem?</h2>
                <p className="lp-card-sub">Tap one. Free to book, no obligation.</p>
                <div className="lp-chips" role="group" aria-label="What's the problem?">
                  {PROBLEMS.map(([key, label]) => (
                    <button key={key} type="button" className="lp-chip" onClick={() => pickProblem(key)}>
                      {label}
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
                <span className="lp-stepno">Step 2 of 2</span>
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
                  <strong>{RATING}</strong> on Google · {REVIEW_COUNT} reviews
                </a>
              </form>
            )}
          </div>

          <div className="lp-rest">
            <ul className="lp-points">
              {POINTS.map(p => (
                <li key={p}><InlineIcon icon={Check} size={18} /> {p}</li>
              ))}
            </ul>
            <a href={REVIEWS_URL} target="_blank" rel="noreferrer" className="lp-rating">
              <Star size={16} fill="#f59e0b" color="#f59e0b" aria-hidden="true" />
              <strong>{RATING}</strong> on Google · {REVIEW_COUNT} reviews
            </a>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* How it works */}
      <section className="section lp-steps-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 36 }}>
            <span className="section-tag">How it works</span>
            <h2>Cool again in three steps</h2>
          </div>
          <ol className="lp-steps">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="ct-step-num">{i + 1}</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </li>
            ))}
          </ol>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a href="#book" className="btn-primary" onClick={goToForm}>Book a technician</a>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Final CTA: the honest cost of waiting */}
      <section className="lp-final">
        <h2>Don't spend another night in the heat.</h2>
        <p>
          Small problems left alone, like a slow gas leak, can end up damaging the compressor,
          which is a much costlier fix. Book now and we'll call you to fix a time.
        </p>
        <a href="#book" className="btn-primary" onClick={goToForm}>Call Me Back</a>
      </section>

      <footer className="lp-footer">
        <p><InlineIcon icon={MapPin} size={14} /> Shop no.10, Vitthal Mall, New CG Rd, near ONGC Circle, Chandkheda, Ahmedabad 382424</p>
        <p>Open {OPENS_TEXT} – {CLOSES_TEXT} · <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a> · <a href="/">Main website</a></p>
      </footer>

      {/* Phones: action bar always in reach */}
      <div className="lp-sticky" data-track="lp-sticky">
        <a href={`tel:${PHONE_TEL}`} className="lp-sticky-call" aria-label={`Call ${PHONE_DISPLAY}`}>
          <InlineIcon icon={Phone} size={20} />
        </a>
        <a href="#book" className="lp-sticky-book" onClick={goToForm}>Call Me Back</a>
      </div>
    </div>
  )
}
