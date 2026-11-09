import { users } from './_lib/session.js'
import { allow, requireUser, send, fail } from './_lib/http.js'
import { STATUSES } from './_lib/sheets.js'

export default function handler(req, res) {
  if (!allow(req, res, ['GET'])) return
  try {
    const user = requireUser(req, res)
    if (user) send(res, 200, { user, users: Object.keys(users()), statuses: STATUSES })
  } catch (err) {
    fail(res, err)
  }
}
