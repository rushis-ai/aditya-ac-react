// src/utils/attribution.js
// First-touch source tracking. First visit wins. Later visits never overwrite it.
// Debug: add ?ft_debug=1 to any URL and open the browser console.

// ============ CONFIG: edit only this block ============
const CONFIG = {
  cookieFirst: 'ft_src',          // first touch (locked)
  cookieLast: 'lt_src',           // last touch (updates)
  maxAgeDays: 30,
  rootDomain: '',                 // Leave '' on vercel.app. After you buy a domain, set e.g. 'adityaac.in'
  ownDomains: ['aditya-ac-react.vercel.app', 'localhost'], // add your custom domain here too
  consentRequired: false,         // true = cookie only after window.ftConsent === true
  ai: {
    'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT',
    'perplexity.ai': 'Perplexity', 'gemini.google.com': 'Gemini',
    'copilot.microsoft.com': 'Copilot', 'claude.ai': 'Claude'
  },
  email: {
    'mail.google.com': 'Gmail', 'outlook.live.com': 'Outlook',
    'outlook.office.com': 'Outlook', 'mail.yahoo.com': 'Yahoo Mail'
  },
  search: {
    'google.*': 'Google', 'bing.com': 'Bing', 'yahoo.com': 'Yahoo',
    'duckduckgo.com': 'DuckDuckGo', 'yandex.*': 'Yandex',
    'baidu.com': 'Baidu', 'ecosia.org': 'Ecosia'
  },
  paid: [
    ['gclid', 'Paid-Google'], ['gbraid', 'Paid-Google'], ['wbraid', 'Paid-Google'],
    ['fbclid', 'Paid-Meta'], ['msclkid', 'Paid-Microsoft']
  ]
}
// ======================================================

// ---------- helpers ----------
function hostOf(ref) {
  try { return ref ? new URL(ref).hostname.toLowerCase() : '' } catch { return '' }
}

// Match on hostname (with subdomains). 'google.*' matches google.com, google.co.in
function hit(host, d) {
  if (d.slice(-2) === '.*') {
    const base = d.slice(0, -2).replace(/\./g, '\\.')
    return new RegExp('(^|\\.)' + base + '\\.[a-z.]+$').test(host)
  }
  return host === d || host.endsWith('.' + d)
}

function lookup(host, map) {
  for (const d in map) if (hit(host, d)) return map[d]
  return null
}

// ---------- classify (first matching rule wins) ----------
export function classify(url, referrer) {
  const p = new URL(url).searchParams
  const host = hostOf(referrer)

  // Internal navigation: never counts (also stops hard-coded internal UTMs)
  if (host && CONFIG.ownDomains.some(d => hit(host, d))) return null

  // Paid click: keep the ad campaign name too, if the ad URL carries one
  for (const [key, label] of CONFIG.paid) {
    if (p.get(key)) return { label: p.get('utm_campaign') ? label + ' / ' + p.get('utm_campaign') : label, host }
  }
  if (p.get('utm_source')) {
    return {
      label: [p.get('utm_source'), p.get('utm_medium') || '(not set)', p.get('utm_campaign') || '(not set)'].join(' / '),
      host
    }
  }
  if (host) {
    const ai = lookup(host, CONFIG.ai)
    if (ai) return { label: 'AI-' + ai, host }
    if (lookup(host, CONFIG.email)) return { label: 'Email', host }
    const se = lookup(host, CONFIG.search)
    if (se) return { label: 'Organic-' + se, host }
    return { label: 'Referral-' + host, host }
  }
  return { label: 'Direct', host: '' }
}

// ---------- storage: cookie, with sessionStorage fallback ----------
function readCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? m[1] : null
}

function consentOk() {
  return !CONFIG.consentRequired || window.ftConsent === true
}

function save(name, value) {
  if (consentOk()) {
    document.cookie =
      name + '=' + value +
      ';max-age=' + CONFIG.maxAgeDays * 86400 +
      ';path=/;SameSite=Lax' +
      (location.protocol === 'https:' ? ';Secure' : '') +
      (CONFIG.rootDomain ? ';domain=.' + CONFIG.rootDomain : '')
    if (readCookie(name)) return 'cookie'
  }
  try { sessionStorage.setItem(name, value); return 'session' } catch { return 'none' }
}

function load(name) {
  let v = readCookie(name)
  if (!v) { try { v = sessionStorage.getItem(name) } catch { v = null } }
  return v
}

// Visitor's local date as YYYY-MM-DD (toISOString would give the UTC date)
function today() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// record = label|rawReferrerHost|landingPath|YYYY-MM-DD  (each part URL-encoded)
function pack(label, host, landing) {
  return [label, host, landing, today()].map(encodeURIComponent).join('|')
}

function unpack(v) {
  const [label = '', host = '', landing = '', date = ''] = (v || '').split('|').map(decodeURIComponent)
  return { label, host, landing, date }
}

// ---------- public API ----------
export function captureAttribution() {
  const debug = new URLSearchParams(location.search).get('ft_debug') === '1'
  const result = classify(location.href, document.referrer)
  const existing = load(CONFIG.cookieFirst)
  let action = 'skipped (internal navigation)'

  if (result) {
    const rec = pack(result.label, result.host, location.pathname)
    if (!existing) { action = 'first touch saved via ' + save(CONFIG.cookieFirst, rec) }
    else { action = 'first touch kept (already set)' }
    // Last touch: update only when the visit has a real source
    if (result.label !== 'Direct') save(CONFIG.cookieLast, rec)
  }

  if (debug) {
    console.log('[ft_debug]', {
      url: location.href, referrer: document.referrer || '(none)',
      decision: result ? result.label : '(internal, ignored)',
      action, firstTouch: unpack(load(CONFIG.cookieFirst)), lastTouch: unpack(load(CONFIG.cookieLast))
    })
  }
}

// Split a stored label into source / medium / campaign for the Sheet
const PAID_SOURCE = { Google: 'google', Meta: 'facebook', Microsoft: 'bing' }
function toSheet({ label, host }) {
  const NS = '(not set)'
  if (!label || label === 'Direct' || label === 'Unknown') {
    return { source: label === 'Unknown' ? '(unknown)' : '(direct)', medium: '(none)', campaign: NS }
  }
  const paid = label.match(/^Paid-(\w+)(?: \/ (.*))?$/)
  if (paid) return { source: PAID_SOURCE[paid[1]] || paid[1].toLowerCase(), medium: 'cpc', campaign: paid[2] || NS }
  const kinds = [['AI-', 'ai'], ['Organic-', 'organic'], ['Referral-', 'referral']]
  for (const [prefix, medium] of kinds) {
    if (label.startsWith(prefix)) return { source: host || label.slice(prefix.length), medium, campaign: NS }
  }
  if (label === 'Email') return { source: host, medium: 'email', campaign: NS }
  // UTM label: "source / medium / campaign"
  const [source, medium = NS, ...rest] = label.split(' / ')
  return { source, medium, campaign: rest.join(' / ') || NS }
}

// Returns fields ready to spread into the form payload
export function getAttribution() {
  let f = unpack(load(CONFIG.cookieFirst))
  // Nothing stored (storage blocked/cleared): classify this page instead of sending blank
  if (!f.label) {
    const r = classify(location.href, document.referrer)
    f = r ? { label: r.label, host: r.host, landing: location.pathname, date: today() }
          : { label: 'Unknown', host: '', landing: '', date: '' }
  }
  const l = load(CONFIG.cookieLast) ? unpack(load(CONFIG.cookieLast)) : f
  const fs = toSheet(f), ls = toSheet(l)
  return {
    // Columns the Sheet script writes
    first_source: fs.source,
    first_medium: fs.medium,
    first_campaign: fs.campaign,
    first_landing: f.landing,
    last_source: ls.source,
    last_medium: ls.medium,
    last_campaign: ls.campaign,
    // Extra detail (ignored by the Sheet unless a column is added for it)
    first_touch: f.label,
    first_referrer: f.host,
    first_date: f.date,
    last_touch: l.label,
    last_referrer: l.host
  }
}