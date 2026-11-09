// Contact details and review stats used across the site.
// Edit them in the CMS (/admin → Settings → Business details); they live in content/settings/business.json.
import business from '../../content/settings/business.json'

export const PHONE_DISPLAY = business.phoneDisplay
export const PHONE_TEL = business.phoneTel
export const WHATSAPP = business.whatsapp
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I need AC service')}`

export const RATING = business.rating
export const REVIEW_COUNT = business.reviewCount
export const REVIEWS_URL = business.reviewsUrl

// Opening hours (local time, 24h) — drives the live "Open now" badge
const hm = (s) => { const [h, m] = s.split(':').map(Number); return { h, m } }
export const TIMEZONE = 'Asia/Kolkata'
export const OPENS = hm(business.opens)
export const CLOSES = hm(business.closes)
