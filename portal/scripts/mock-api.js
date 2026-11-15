// Demo mode for local testing without Google: `npm run demo`, then sign in as demo / demo.
// Fake data, kept in memory. Only used by the Vite dev server, never deployed.
const STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam']
const SERVICES = ['ac-installation', 'ac-repair', 'ac-cleaning', 'gas-refill', 'refrigeration', 'amc', 'other']
const SOURCES = [['google', 'organic'], ['google', 'cpc'], ['(direct)', '(none)'], ['facebook', 'cpc'], ['chatgpt.com', 'ai']]
const LOST_REASONS = ['Price too high', 'Went with someone else', 'No response', 'Outside service area', 'Only enquiring', 'Other']
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
    followUp: ['Contacted', 'Quoted'].includes(status) ? day((i % 9) - 3).slice(0, 10) : status === 'Won' && i % 2 ? day((i % 12) - 2).slice(0, 10) : '',
    updatedBy: '', updatedAt: '',
    value: ['Quoted', 'Won'].includes(status) ? 1500 + (i % 7) * 750 : '',
    lostReason: status === 'Lost' && i % 3 ? LOST_REASONS[i % LOST_REASONS.length] : '',
    // First contact a few minutes to a day after the lead came in (feeds the First response figure)
    notes: status === 'New' ? [] : [{ when: day(-Math.floor(i * 1.3), 9 + (i % 9) + (i % 4 ? 0 : 5)).replace(/:\d\d$/, ':59'), by: 'demo', text: 'Call: spoke to them', kind: 'note' }]
  }
})
const CHANNELS = ['Phone call', 'Walk-in', 'Referral', 'Other']

// A few Won leads already have an invoice (one issued, one draft)
const fy = () => { const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; return String(y % 100).padStart(2, '0') + String((y + 1) % 100).padStart(2, '0') }
let invoiceSeq = 0
let invoiceIds = 0
const blankInvoice = (lead, by = 'demo') => ({
  id: 'i' + String(++invoiceIds).padStart(10, '0'), number: '', status: 'Draft', leadId: lead.id,
  customer: lead.name, phone: lead.phone, address: '', items: [{ desc: 'Service visit', qty: 1, rate: lead.value || 1500 }],
  discount: 0, total: lead.value || 1500, createdAt: lead.date, createdBy: by,
  issuedAt: '', issuedBy: '', cancelledAt: '', cancelledBy: '', cancelReason: ''
})
for (const l of leads) l.invoices = []
leads.filter((l) => l.status === 'Won').slice(0, 2).forEach((l, i) => {
  const inv = blankInvoice(l)
  if (i === 0) Object.assign(inv, { number: `AAC-${fy()}-${String(++invoiceSeq).padStart(4, '0')}`, status: 'Issued', issuedAt: l.date, issuedBy: 'demo' })
  l.invoices.push(inv)
})
const now = () => day(0, new Date().getHours())

// Every couple of minutes a fake website lead "arrives", to try the new-lead alert
let arrivals = 0
setInterval(() => {
  arrivals++
  leads.unshift({
    ...leads[leads.length - 1], id: 'live' + arrivals, date: now(), name: 'Website Visitor ' + arrivals,
    status: 'New', assigned: '', followUp: '', value: '', lostReason: '', notes: [], invoices: []
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
        if (path === 'me') return send(200, { user: 'demo', users: ['demo', 'helper'], statuses: STATUSES, channels: CHANNELS, lostReasons: LOST_REASONS, canIssue: true })
        if (path === 'leads') return send(200, { leads })
        if (path === 'add') {
          if (!b.name || String(b.phone || '').replace(/\D/g, '').length < 7) return send(400, { error: 'Enter a name and a valid phone number.' })
          const when = now()
          const lead = {
            id: 'm' + Date.now(), date: when, name: b.name, phone: b.phone, service: b.service || '', message: b.message || '',
            first_source: b.channel, first_medium: '', first_campaign: '', first_landing: '',
            last_source: '', last_medium: '', last_campaign: '',
            status: 'New', assigned: b.assigned || '', followUp: b.followUp || '', updatedBy: 'demo', updatedAt: when, value: '', lostReason: '', invoices: [],
            notes: [{ when, by: 'demo', text: `Added by hand (${b.channel})`, kind: 'change' }]
          }
          leads.unshift(lead)
          return send(200, { lead })
        }
        if (path === 'invoice') {
          const when = now()
          const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN')
          let inv = b.id ? leads.flatMap((l) => l.invoices).find((i) => i.id === b.id) : null
          const owner = leads.find((l) => l.id === (inv ? inv.leadId : b.leadId))
          if (!owner) return send(404, { error: 'Lead not found.' })
          const history = []
          if (b.action === 'save' || b.action === 'issue') {
            if (inv && inv.status !== 'Draft') return send(409, { error: 'This invoice is already issued and can’t be changed.' })
            const items = (b.items || []).map((it) => ({ desc: String(it.desc || '').trim(), qty: Number(it.qty), rate: Number(String(it.rate).replace(/[^\d]/g, '')) || 0 }))
            if (!b.customer || !items.length || items.some((it) => !it.desc || !(it.qty >= 1))) return send(400, { error: 'Enter the customer and every item’s description and quantity.' })
            const subtotal = items.reduce((t, it) => t + it.qty * it.rate, 0)
            const discount = Number(String(b.discount || '').replace(/[^\d]/g, '')) || 0
            if (discount > subtotal) return send(400, { error: 'The discount can’t be more than the items’ total.' })
            if (!inv) {
              inv = blankInvoice(owner)
              owner.invoices.unshift(inv)
              if (b.action === 'save') history.push({ when, by: 'demo', kind: 'change', text: `Invoice draft created (${rupees(subtotal - discount)})` })
            }
            Object.assign(inv, { customer: b.customer, phone: b.phone || '', address: b.address || '', items, discount, total: subtotal - discount })
            if (b.action === 'issue') {
              if (inv.total <= 0) return send(400, { error: 'The total must be more than ₹0 to issue.' })
              Object.assign(inv, { number: `AAC-${fy()}-${String(++invoiceSeq).padStart(4, '0')}`, status: 'Issued', issuedAt: when, issuedBy: 'demo' })
              history.push({ when, by: 'demo', kind: 'change', text: `Invoice ${inv.number} issued (${rupees(inv.total)})` })
            }
          } else if (b.action === 'discard' && inv?.status === 'Draft') {
            inv.status = 'Discarded'
            owner.invoices = owner.invoices.filter((i) => i !== inv)
            history.push({ when, by: 'demo', kind: 'change', text: 'Invoice draft discarded' })
          } else if (b.action === 'cancel' && inv?.status === 'Issued' && b.reason) {
            Object.assign(inv, { status: 'Cancelled', cancelledAt: when, cancelledBy: 'demo', cancelReason: b.reason })
            history.push({ when, by: 'demo', kind: 'change', text: `Invoice ${inv.number} cancelled: ${b.reason}` })
          } else {
            return send(400, { error: 'That can’t be done to this invoice.' })
          }
          owner.notes.unshift(...history)
          return send(200, { invoice: { ...inv }, history })
        }
        const lead = leads.find((l) => l.id === b.id)
        if (!lead) return send(404, { error: 'Lead not found.' })
        if (path === 'lead') {
          const changes = { ...b }
          delete changes.id
          const when = now()
          const label = { status: 'Status', assigned: 'Assigned to' }
          const rupees = (n) => (n === '' ? 'not set' : '₹' + Number(n).toLocaleString('en-IN'))
          const history = Object.entries(changes)
            .filter(([k, v]) => lead[k] !== v)
            .map(([k, v]) => ({
              when, by: 'demo', kind: 'change',
              text: k === 'followUp' ? (v ? `Follow-up set for ${v}` : 'Follow-up cleared')
                : k === 'value' ? `Job value: ${rupees(lead.value)} → ${rupees(v)}`
                : k === 'lostReason' ? (v ? `Lost reason: ${v}` : 'Lost reason cleared')
                : `${label[k]}: ${lead[k] || 'nobody'} → ${v || 'nobody'}`
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
