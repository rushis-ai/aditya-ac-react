import { getUser } from './session.js'

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(body)
}

export function allow(req, res, methods) {
  if (methods.includes(req.method)) return true
  res.setHeader('Allow', methods.join(', '))
  send(res, 405, { error: 'Method not allowed.' })
  return false
}

// Writes must carry this header. Other sites can't add it to a cross-site request
// without a CORS preflight, which we never approve (extra CSRF guard on top of SameSite).
export function sameSiteWrite(req, res) {
  if (req.headers['x-requested-with'] === 'portal') return true
  send(res, 403, { error: 'Bad request.' })
  return false
}

// Returns the username or sends 401
export function requireUser(req, res) {
  const user = getUser(req)
  if (!user) send(res, 401, { error: 'Please log in.' })
  return user
}

export function fail(res, err) {
  console.error(err)
  send(res, 500, { error: 'Something went wrong. Please try again.' })
}
