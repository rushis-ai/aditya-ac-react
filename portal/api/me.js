import { users } from './_lib/session.js'
import { allow, requireUser, send, fail } from './_lib/http.js'
import { STATUSES, CHANNELS, LOST_REASONS } from './_lib/sheets.js'
import { canIssue } from './_lib/invoices.js'

export default function handler(req, res) {
  if (!allow(req, res, ['GET'])) return
  try {
    const user = requireUser(req, res)
    if (user) send(res, 200, { user, users: Object.keys(users()), statuses: STATUSES, channels: CHANNELS, lostReasons: LOST_REASONS, canIssue: canIssue(user) })
  } catch (err) {
    fail(res, err)
  }
}
