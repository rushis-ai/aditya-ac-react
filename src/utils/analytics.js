// Google Analytics 4 (gtag.js), loaded only on the live site.
//
// Events sent (mark the first three as Key events in GA → Admin → Events):
//   generate_lead    a lead was confirmed saved    params: form (contact | popup), service
//   lead_unconfirmed a lead was sent but the reply couldn't be read (not a conversion)
//   click_call       a phone link was tapped       params: placement (header, hero, footer, ...), page
//   click_whatsapp   a WhatsApp link was tapped    params: placement, page
//   click_email      an email link was tapped      params: placement, page
//   form_error       a lead form failed to send    params: form
//   popup_view       the lead popup opened
//   form_start       step 1 of the landing-page form was tapped   params: form, problem
//   click_save_contact  "Save our number" tapped on the landing-page thank-you screen
//   page_view        sent by <PageViews /> after each route change, so the title is correct
//
// Buttons need no extra code: one click listener catches every tel:, wa.me and mailto: link.
// To name a button's placement explicitly, add data-track="something" to it or a parent.

export const GA_ID = 'G-QB8RW3EG1Y' // Set to '' to turn tracking off.
export const ADS_ID = 'AW-18520789335' // Google Ads tag, shares the same gtag.js load. Set to '' to turn off.
// Label of the Google Ads "lead" conversion action (the part after the slash in AW-.../XXXX).
// Fired only when the lead is confirmed saved ("Lead saved (website form)" action).
export const ADS_LEAD_LABEL = 'SssGCNuS57YdENeis_9E'

const LIVE = typeof window !== 'undefined' && GA_ID && !/^(localhost|127\.|\[::1\])/.test(location.hostname) &&
  !location.hostname.endsWith('.vercel.app')

let started = false

export function initAnalytics() {
  if (!LIVE || started) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) } // gtag needs the real arguments object
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  if (ADS_ID) window.gtag('config', ADS_ID)

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  document.addEventListener('click', onClick, { capture: true })
}

export function track(name, params = {}) {
  if (!LIVE || !window.gtag) return
  window.gtag('event', name, params)
}

// After submitLead(): generate_lead (and the Ads conversion) only when the save is confirmed.
// An unconfirmed send gets its own event so it never inflates conversions.
export function trackLeadResult(confirmed, params) {
  if (!confirmed) return track('lead_unconfirmed', params)
  track('generate_lead', params)
  if (ADS_ID && ADS_LEAD_LABEL) track('conversion', { send_to: `${ADS_ID}/${ADS_LEAD_LABEL}` })
}

export function trackPageView() {
  track('page_view', { page_location: location.href, page_path: location.pathname, page_title: document.title })
}

// Where on the page a link sits: data-track wins, otherwise the nearest landmark
function placementOf(el) {
  const tagged = el.closest('[data-track]')
  if (tagged) return tagged.getAttribute('data-track')
  if (el.closest('.popup-body, [role="dialog"]')) return 'popup'
  if (el.closest('header, nav')) return 'header'
  if (el.closest('footer')) return 'footer'
  if (el.closest('.hero')) return 'hero'
  if (getComputedStyle(el).position === 'fixed') return 'floating'
  const section = el.closest('section[id], section[class]')
  return section ? (section.id || section.classList[0]) : 'page'
}

function onClick(e) {
  const a = e.target.closest?.('a[href]')
  if (!a) return
  const href = a.getAttribute('href')
  const name = href.startsWith('tel:') ? 'click_call'
    : /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href) ? 'click_whatsapp'
    : href.startsWith('mailto:') ? 'click_email'
    : null
  if (name) track(name, { placement: placementOf(a), page: location.pathname })
}
