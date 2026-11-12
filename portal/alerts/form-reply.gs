/**
 * Readable replies for the website form, so the site knows a lead was really saved.
 *
 * Why: the site counts a lead (Analytics generate_lead + the Google Ads conversion) only when
 * this script answers with a readable reply. Apps Script makes a reply readable from the
 * browser only when doPost returns ContentService output. If doPost throws or returns nothing,
 * the site can't tell whether the row was saved, logs `lead_unconfirmed`, and counts no conversion.
 *
 * Setup:
 *   1. Paste this file into the form's Apps Script (same project as new-lead-alert.gs).
 *   2. Rename the existing doPost to saveLead_ (keep its body exactly as it is).
 *   3. Deploy → Manage deployments → edit → Version: New version → Deploy. The form URL stays the same.
 */
function doPost(e) {
  try {
    saveLead_(e) // the original doPost: parses the form and appends the row (and calls notifyNewLead_)
    return formReply_({ ok: true })
  } catch (err) {
    console.error('Lead not saved: ' + err + '\n' + (e && e.postData ? e.postData.contents : ''))
    return formReply_({ ok: false, error: String(err) })
  }
}

function formReply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
