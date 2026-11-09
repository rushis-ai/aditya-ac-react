import { allow, requireUser, send, fail } from './_lib/http.js'
import { loadLeads } from './_lib/sheets.js'

export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return
  try {
    if (!requireUser(req, res)) return
    send(res, 200, { leads: await loadLeads() })
  } catch (err) {
    fail(res, err)
  }
}
