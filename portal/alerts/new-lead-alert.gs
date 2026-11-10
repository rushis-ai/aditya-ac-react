/**
 * New-lead alerts, sent by the Google Apps Script that receives the website form.
 * Works even when nobody has the portal open.
 *
 * Setup (see portal/README.md, "New-lead alerts"):
 *   1. Paste this whole file at the bottom of the form's Apps Script.
 *   2. In that script's doPost, right after the row is added to the sheet, add:
 *          notifyNewLead_();
 *   3. Project Settings → Script properties. Add any of these:
 *          ALERT_EMAILS     comma-separated addresses to email   (e.g. a@x.com,b@x.com)
 *          TELEGRAM_TOKEN   bot token from @BotFather            (optional)
 *          TELEGRAM_CHATS   comma-separated chat IDs             (optional)
 *          PORTAL_URL       link to the portal, added to alerts  (optional)
 *   4. Deploy → Manage deployments → edit → New version, so the live form uses the new code.
 *
 * It reads the newest row of the leads tab, so it doesn't depend on how doPost parses the form.
 * Any error here is logged and swallowed: an alert problem must never lose a lead.
 */
function notifyNewLead_() {
  try {
    var props = PropertiesService.getScriptProperties()
    var sheet = leadSheet_(props)
    var lastRow = sheet.getLastRow()
    if (lastRow < 2) return
    var width = sheet.getLastColumn()
    var head = sheet.getRange(1, 1, 1, width).getValues()[0]
    var row = sheet.getRange(lastRow, 1, 1, width).getValues()[0]

    var pick = function (names) {
      for (var i = 0; i < head.length; i++) {
        var key = String(head[i]).toLowerCase().replace(/[^a-z0-9]/g, '')
        if (names.indexOf(key) >= 0 && row[i] !== '' && row[i] != null) return String(row[i]).trim()
      }
      return ''
    }
    var name = pick(['name', 'fullname', 'customername']) || '(no name)'
    var phone = pick(['phone', 'mobile', 'phonenumber', 'mobilenumber', 'contact'])
    var service = pick(['service', 'servicetype'])
    var message = pick(['message', 'msg', 'enquiry', 'query', 'details'])
    var source = pick(['lastsource', 'firstsource', 'source', 'utmsource'])

    var lines = ['New lead: ' + name]
    if (phone) lines.push('Phone: ' + phone)
    if (service) lines.push('Service: ' + service)
    if (message) lines.push('Message: ' + message.slice(0, 500))
    if (source) lines.push('Source: ' + source)
    var url = props.getProperty('PORTAL_URL')
    if (url) lines.push('', url)
    var text = lines.join('\n')

    var emails = list_(props.getProperty('ALERT_EMAILS'))
    if (emails.length) {
      MailApp.sendEmail({ to: emails.join(','), subject: 'New lead: ' + name + (service ? ' (' + service + ')' : ''), body: text })
    }

    var token = props.getProperty('TELEGRAM_TOKEN')
    list_(props.getProperty('TELEGRAM_CHATS')).forEach(function (chat) {
      if (!token) return
      UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ chat_id: chat, text: text, disable_web_page_preview: true }),
        muteHttpExceptions: true
      })
    })
  } catch (err) {
    console.error('New-lead alert failed: ' + err)
  }
}

// Same tab rule as the portal: LEADS_TAB script property if set, otherwise the first tab
function leadSheet_(props) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(props.getProperty('SHEET_ID'))
  var tab = props.getProperty('LEADS_TAB')
  return (tab && ss.getSheetByName(tab)) || ss.getSheets()[0]
}

function list_(s) {
  return String(s || '').split(',').map(function (x) { return x.trim() }).filter(String)
}

// Run this once from the editor to check your settings: it sends an alert for the newest row.
function testNewLeadAlert() {
  notifyNewLead_()
}
