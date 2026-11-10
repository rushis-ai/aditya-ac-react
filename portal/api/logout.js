import { clearSession } from './_lib/session.js'
import { allow, sameSiteWrite, send } from './_lib/http.js'

export default function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  clearSession(res)
  send(res, 200, { ok: true })
}
