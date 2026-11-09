// Logins and signed session cookies. No database: users live in the PORTAL_USERS env var.
//   PORTAL_USERS   = {"ravi":"scrypt:...","priya":"scrypt:..."}  (make hashes with: npm run hash-password)
//   SESSION_SECRET = 32+ random characters. Changing it logs everyone out.
// Removing a user from PORTAL_USERS ends their sessions immediately.
import crypto from 'node:crypto'

const COOKIE = 'ld_s'
const TTL = 12 * 3600 // seconds

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET is missing or shorter than 32 characters')
  return s
}

const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url')

export function users() {
  try {
    const raw = JSON.parse(process.env.PORTAL_USERS || '{}')
    return Object.fromEntries(Object.entries(raw).map(([u, h]) => [u.trim().toLowerCase(), h]))
  } catch {
    console.error('PORTAL_USERS is not valid JSON')
    return {}
  }
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 32)
  return `scrypt:${salt.toString('base64')}:${hash.toString('base64')}`
}

// Used when the username doesn't exist, so a wrong username takes as long as a wrong password
const DUMMY = hashPassword(crypto.randomBytes(8).toString('hex'))

export function verifyPassword(stored, password) {
  const [alg, salt, hash] = String(stored || DUMMY).split(':')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const want = Buffer.from(hash, 'base64')
  const got = crypto.scryptSync(String(password), Buffer.from(salt, 'base64'), want.length)
  return crypto.timingSafeEqual(want, got) && Boolean(stored)
}

export function createSession(res, user) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Math.floor(Date.now() / 1000) + TTL })).toString('base64url')
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`)
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
}

// Returns the logged-in username, or null
export function getUser(req) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'))
  if (!m) return null
  const [payload, sig] = m[1].split('.')
  if (!payload || !sig) return null
  const expected = sign(payload)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!u || exp < Date.now() / 1000 || !users()[u]) return null
    return u
  } catch {
    return null
  }
}
