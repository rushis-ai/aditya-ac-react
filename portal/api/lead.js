// Update a lead's status, assignee or follow-up date
import { users } from './_lib/session.js'
import { allow, sameSiteWrite, requireUser, send, fail } from './_lib/http.js'
import { updateLead, STATUSES } from './_lib/sheets.js'

export default async function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  try {
    const user = requireUser(req, res)
    if (!user) return
    const { id, ...body } = req.body || {}
    if (typeof id !== 'string' || !/^[\w-]{1,40}$/.test(id)) return send(res, 400, { error: 'Missing lead.' })

    const changes = {}
    if ('status' in body) {
      if (!STATUSES.includes(body.status)) return send(res, 400, { error: 'Unknown status.' })
      changes.status = body.status
    }
    if ('assigned' in body) {
      if (body.assigned !== '' && !users()[body.assigned]) return send(res, 400, { error: 'Unknown user.' })
      changes.assigned = body.assigned
    }
    if ('followUp' in body) {
      if (body.followUp !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(body.followUp)) return send(res, 400, { error: 'Bad date.' })
      changes.followUp = body.followUp
    }
    if (!Object.keys(changes).length) return send(res, 400, { error: 'Nothing to update.' })

    const saved = await updateLead(id, changes, user)
    if (!saved) return send(res, 404, { error: 'Lead not found. Refresh and try again.' })
    send(res, 200, { lead: saved })
  } catch (err) {
    fail(res, err)
  }
}
