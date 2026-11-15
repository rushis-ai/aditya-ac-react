import { allow, requireUser, send, fail } from './_lib/http.js'
import { loadLeads } from './_lib/sheets.js'
import { loadInvoices } from './_lib/invoices.js'

export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return
  try {
    if (!requireUser(req, res)) return
    const [leads, invoices] = await Promise.all([loadLeads(), loadInvoices()])
    const byLead = {}
    for (const inv of invoices) (byLead[inv.leadId] ||= []).push(inv)
    send(res, 200, { leads: leads.map((l) => ({ ...l, invoices: byLead[l.id] || [] })) })
  } catch (err) {
    fail(res, err)
  }
}
