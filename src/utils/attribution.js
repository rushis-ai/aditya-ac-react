const FIRST = 'first_touch'
const LAST = 'last_touch'
const MAX_AGE = 60 * 60 * 24 * 180 // 180 days

function read(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  if (!m) return null
  try { return JSON.parse(decodeURIComponent(m[1])) } catch { return null }
}

function write(name, obj) {
  document.cookie =
    `${name}=${encodeURIComponent(JSON.stringify(obj))};max-age=${MAX_AGE};path=/;SameSite=Lax`
}

function detectTouch() {
  const p = new URLSearchParams(window.location.search)

  let refHost = ''
  try {
    refHost = document.referrer ? new URL(document.referrer).hostname : ''
  } catch { /* ignore bad referrer */ }

  const internal = refHost === window.location.hostname
  const base = { landing: window.location.pathname, ts: new Date().toISOString() }

  // 1. UTM link from outside
  if (p.get('utm_source') && !internal) {
    return {
      ...base,
      source: p.get('utm_source'),
      medium: p.get('utm_medium') || '(not set)',
      campaign: p.get('utm_campaign') || '(not set)'
    }
  }
  // 2. Search engine = organic
  if (/google\.|bing\.|yahoo\.|duckduckgo\./.test(refHost)) {
    return {
      ...base,
      source: refHost,
      medium: 'organic',
      campaign: 'organic - ' + window.location.pathname
    }
  }
  // 3. Other website = referral
  if (refHost && !internal) {
    return { ...base, source: refHost, medium: 'referral', campaign: '(not set)' }
  }
  // 4. Nothing = direct
  return { ...base, source: '(direct)', medium: '(none)', campaign: '(not set)' }
}

export function captureAttribution() {
  const touch = detectTouch()

  // First touch: write ONE time. Never overwrite.
  if (!read(FIRST)) write(FIRST, touch)

  // Last touch: update only when the visit has a real source.
  if (touch.medium !== '(none)') write(LAST, touch)
}

export function getAttribution() {
  const ft = read(FIRST) || {}
  const lt = read(LAST) || ft
  return {
    first_source: ft.source || '',
    first_medium: ft.medium || '',
    first_campaign: ft.campaign || '',
    first_landing: ft.landing || '',
    last_source: lt.source || '',
    last_medium: lt.medium || '',
    last_campaign: lt.campaign || ''
  }
}