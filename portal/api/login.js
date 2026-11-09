import { users, verifyPassword, createSession } from './_lib/session.js'
import { allow, sameSiteWrite, send, fail } from './_lib/http.js'

// Per-instance throttle: 5 wrong tries per IP, then a 15-minute lock
const attempts = new Map()
const LIMIT = 5
const LOCK_MS = 15 * 60 * 1000

export default async function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  try {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
    const a = attempts.get(ip)
    const active = a && a.until > Date.now()
    if (active && a.n >= LIMIT) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' })

    const username = String(req.body?.username || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (verifyPassword(users()[username], password)) {
      attempts.delete(ip)
      createSession(res, username)
      return send(res, 200, { user: username })
    }
    attempts.set(ip, { n: (active ? a.n : 0) + 1, until: Date.now() + LOCK_MS })
    await new Promise((r) => setTimeout(r, 400))
    send(res, 401, { error: 'Wrong username or password.' })
  } catch (err) {
    fail(res, err)
  }
}
