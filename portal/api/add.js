// Add a lead by hand (phone call, walk-in, referral…)
import { users } from './_lib/session.js'
import { allow, sameSiteWrite, requireUser, send, fail } from './_lib/http.js'
import { createLead, CHANNELS } from './_lib/sheets.js'

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

export default async function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  try {
    const user = requireUser(req, res)
    if (!user) return
    const b = req.body || {}
    const f = {
      name: clean(b.name, 100),
      phone: String(b.phone ?? '').replace(/[^\d+]/g, '').slice(0, 16),
      service: clean(b.service, 40),
      message: String(b.message ?? '').trim().slice(0, 2000),
      channel: CHANNELS.includes(b.channel) ? b.channel : '',
      assigned: clean(b.assigned, 40).toLowerCase(),
      followUp: clean(b.followUp, 10),
      note: String(b.note ?? '').trim().slice(0, 2000)
    }
    if (!f.name) return send(res, 400, { error: 'Enter a name.' })
    if (f.phone.replace(/\D/g, '').length < 7) return send(res, 400, { error: 'Enter a valid phone number.' })
    if (!f.channel) return send(res, 400, { error: 'Pick how the lead reached you.' })
    if (f.service && !/^[a-z0-9-]+$/.test(f.service)) return send(res, 400, { error: 'Unknown service.' })
    if (f.assigned && !users()[f.assigned]) return send(res, 400, { error: 'Unknown user.' })
    if (f.followUp && !/^\d{4}-\d{2}-\d{2}$/.test(f.followUp)) return send(res, 400, { error: 'Bad date.' })
    send(res, 200, { lead: await createLead(f, user) })
  } catch (err) {
    fail(res, err)
  }
}
