// Demo mode for local testing without Google: `npm run demo`, then sign in as demo / demo.
// Fake data, kept in memory. Only used by the Vite dev server, never deployed.
const STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam']
const SERVICES = ['ac-installation', 'ac-repair', 'ac-cleaning', 'gas-refill', 'refrigeration', 'amc', 'other']
const SOURCES = [['google', 'organic'], ['google', 'cpc'], ['(direct)', '(none)'], ['facebook', 'cpc'], ['chatgpt.com', 'ai']]
const NAMES = ['Test User A', 'Test User B', 'Test User C', 'Test User D', 'Test User E', 'Test User F', 'Test User G', 'Test User H']
const pad = (n) => String(n).padStart(2, '0')
const day = (offset, h = 10) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad((((offset * 7) % 60) + 60) % 60)}`
}

const leads = Array.from({ length: 60 }, (_, i) => {
  const [src, med] = SOURCES[i % SOURCES.length]
  const status = i < 5 ? 'New' : STATUSES[i % STATUSES.length]
  return {
    id: 'demo' + i,
    date: day(-Math.floor(i * 1.3), 9 + (i % 9)),
    name: NAMES[i % NAMES.length],
    phone: '90000000' + pad(i),
    service: SERVICES[i % SERVICES.length],
    message: i % 3 ? '' : 'Unit not cooling, please call after 5 pm',
    first_source: src, first_medium: med, first_campaign: med === 'cpc' ? 'summer' : '(not set)', first_landing: '/',
    last_source: src, last_medium: med, last_campaign: '(not set)',
    status,
    assigned: i % 4 === 0 ? '' : i % 2 ? 'demo' : 'helper',
    followUp: ['Contacted', 'Quoted'].includes(status) ? day((i % 9) - 3).slice(0, 10) : '',
    updatedBy: '', updatedAt: '',
    notes: i % 5 === 1 ? [{ when: day(-1), by: 'demo', text: 'Called, will confirm tomorrow.', kind: 'note' }] : []
  }
})
const CHANNELS = ['Phone call', 'Walk-in', 'Referral', 'Other']
const now = () => day(0, new Date().getHours())

// Every couple of minutes a fake website lead "arrives", to try the new-lead alert
let arrivals = 0
setInterval(() => {
  arrivals++
  leads.unshift({
    ...leads[leads.length - 1], id: 'live' + arrivals, date: now(), name: 'Website Visitor ' + arrivals,
    status: 'New', assigned: '', followUp: '', notes: []
  })
}, 120_000).unref?.()

let session = false

function body(req) {
  return new Promise((resolve) => {
    let s = ''
    req.on('data', (c) => (s += c))
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')) } catch { resolve({}) } })
  })
}

export default function mockApi() {
  return {
    name: 'portal-demo-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const send = (status, data) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        const path = req.url.split('?')[0].replace(/^\//, '')
        const b = req.method === 'POST' ? await body(req) : {}
        await new Promise((r) => setTimeout(r, 250))
        if (path === 'login') {
          if (b.username === 'demo' && b.password === 'demo') { session = true; return send(200, { user: 'demo' }) }
          return send(401, { error: 'Wrong username or password.' })
        }
        if (path === 'logout') { session = false; return send(200, { ok: true }) }
        if (!session) return send(401, { error: 'Please log in.' })
        if (path === 'me') return send(200, { user: 'demo', users: ['demo', 'helper'], statuses: STATUSES, channels: CHANNELS })
        if (path === 'leads') return send(200, { leads })
        if (path === 'add') {
          if (!b.name || String(b.phone || '').replace(/\D/g, '').length < 7) return send(400, { error: 'Enter a name and a valid phone number.' })
          const when = now()
          const lead = {
            id: 'm' + Date.now(), date: when, name: b.name, phone: b.phone, service: b.service || '', message: b.message || '',
            first_source: b.channel, first_medium: '', first_campaign: '', first_landing: '',
            last_source: '', last_medium: '', last_campaign: '',
            status: 'New', assigned: b.assigned || '', followUp: b.followUp || '', updatedBy: 'demo', updatedAt: when,
            notes: [{ when, by: 'demo', text: `Added by hand (${b.channel})`, kind: 'change' }]
          }
          leads.unshift(lead)
          return send(200, { lead })
        }
        const lead = leads.find((l) => l.id === b.id)
        if (!lead) return send(404, { error: 'Lead not found.' })
        if (path === 'lead') {
          const changes = { ...b }
          delete changes.id
          const when = now()
          const label = { status: 'Status', assigned: 'Assigned to' }
          const history = Object.entries(changes)
            .filter(([k, v]) => lead[k] !== v)
            .map(([k, v]) => ({
              when, by: 'demo', kind: 'change',
              text: k === 'followUp' ? (v ? `Follow-up set for ${v}` : 'Follow-up cleared') : `${label[k]}: ${lead[k] || 'nobody'} → ${v || 'nobody'}`
            }))
            .reverse()
          Object.assign(lead, changes, { updatedBy: 'demo', updatedAt: when })
          lead.notes.unshift(...history)
          return send(200, { lead: { ...changes, updatedBy: lead.updatedBy, updatedAt: lead.updatedAt }, history })
        }
        if (path === 'note') {
          const note = { when: now(), by: 'demo', text: b.text, kind: 'note' }
          lead.notes.unshift(note)
          return send(200, { note })
        }
        send(404, { error: 'Not found' })
      })
    }
  }
}
