// Step 1 of "Sign in with GitHub" for the CMS at /admin.
// Redirects to GitHub's OAuth consent screen. Requires GITHUB_CLIENT_ID and
// GITHUB_CLIENT_SECRET in the Vercel project's environment variables.
import crypto from 'node:crypto'

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    res.status(500).send('CMS sign-in is not configured: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.')
    return
  }

  // CSRF protection: random state stored in a short-lived cookie, checked in /api/callback
  const state = crypto.randomBytes(16).toString('hex')
  res.setHeader('Set-Cookie', `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`)

  const scope = String(req.query.scope || 'repo')
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const redirectUri = `${proto}://${req.headers.host}/api/callback`
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scope)
  url.searchParams.set('state', state)

  res.redirect(302, url.toString())
}
