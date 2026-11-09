// Add a note to a lead
import { allow, sameSiteWrite, requireUser, send, fail } from './_lib/http.js'
import { addNote } from './_lib/sheets.js'

export default async function handler(req, res) {
  if (!allow(req, res, ['POST']) || !sameSiteWrite(req, res)) return
  try {
    const user = requireUser(req, res)
    if (!user) return
    const id = req.body?.id
    const text = String(req.body?.text || '').trim().slice(0, 2000)
    if (typeof id !== 'string' || !/^[\w-]{1,40}$/.test(id)) return send(res, 400, { error: 'Missing lead.' })
    if (!text) return send(res, 400, { error: 'Note is empty.' })
    send(res, 200, { note: await addNote(id, text, user) })
  } catch (err) {
    fail(res, err)
  }
}
