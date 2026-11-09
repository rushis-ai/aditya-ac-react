import { clearSession } from './_lib/session.js'
import { allow, send } from './_lib/http.js'

export default function handler(req, res) {
  if (!allow(req, res, ['POST'])) return
  clearSession(res)
  send(res, 200, { ok: true })
}
