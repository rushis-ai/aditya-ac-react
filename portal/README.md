# Lead Desk

Private lead manager. It reads and writes the same Google Sheet the website's form sends leads to.
This is a separate host project from the main site, deployed from this `portal/` folder.

- **Today**: new leads nobody has called yet, follow-ups that are due, and the next 7 days.
- **Leads**: search and filter by status, service, source, person or date, then export to CSV.
- **Lead panel**: Call and WhatsApp buttons, status, assignee, follow-up date, and notes with full history.
  After a Call or WhatsApp tap it asks how it went (spoke to them / no answer / call back later).
  One tap logs a note, moves a New lead to Contacted, and sets a follow-up for tomorrow when they didn't answer.
- **+ New lead**: add phone calls, walk-ins and referrals by hand. It warns you if the number is already a lead.
- **Alerts**: the bell in the header turns on desktop notifications for new leads while the portal is open.
  The browser tab title also shows how many leads need action. For alerts when the portal is closed, see below.
- **Reports**: counts and win rate by source, service and team member, per month.

## How the data is stored
On first load the portal adds 6 columns to the right of the leads tab:
`Lead ID, Status, Assigned To, Follow-up, Updated By, Updated At`. It also creates a `Notes` tab
(`When, Lead ID, By, Note, Kind`). Every status, assignee and follow-up change is written there with
`Kind = change`, so you can see who changed what, and when. Typed notes have `Kind = note`.
Existing columns are never moved or changed, so the website form keeps working as before.
Don't rename these new headers. You can sort or filter the Sheet by hand safely, because the portal
finds rows by Lead ID, not by row number. Hand-added leads get the channel (e.g. `Phone call`) as their
source, so they show up in the reports as their own source.

## New-lead alerts (email / Telegram, even when the portal is closed)
The website form is received by a Google Apps Script, so alerts are sent from there:
1. Open the Apps Script that the website form posts to, and paste in the whole of `alerts/new-lead-alert.gs`.
2. In its `doPost`, right after the line that adds the row to the sheet, add `notifyNewLead_();`.
3. Go to **Project Settings → Script properties** and add:
   - `ALERT_EMAILS`: comma-separated addresses.
   - *Optional* `TELEGRAM_TOKEN` (from @BotFather) and `TELEGRAM_CHATS` (comma-separated chat IDs).
     Telegram notifies you faster than email.
   - *Optional* `PORTAL_URL`: added to each alert as a link.
   - *Only if the script isn't attached to the Sheet:* `SHEET_ID`.
   - *Only if leads aren't on the first tab:* `LEADS_TAB`.
4. Run `testNewLeadAlert` once from the editor and approve the permissions. It sends an alert for the newest row.
5. Go to **Deploy → Manage deployments → Edit → Version: New version → Deploy**. The form URL stays the same.

## Setup (one time)

### 1. Google service account (gives the portal access to the Sheet)
1. Go to console.cloud.google.com and create a project. Use a neutral name.
2. Go to **APIs & Services → Library**, search for **Google Sheets API** and click **Enable**.
3. Go to **IAM & Admin → Service Accounts → Create service account**. A name is enough; skip the roles.
4. Open the account, then go to **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
   Treat it like a password. Never commit it or send it over chat.
5. Open the leads Google Sheet and click **Share**. Paste the service account's email
   (`...@...iam.gserviceaccount.com`), choose **Editor**, untick "Notify" and share.
6. Copy the Sheet ID from its URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`.

### 2. Logins
Run these in this folder:
```
npm install
npm run new-secret                          # -> SESSION_SECRET
npm run hash-password -- "a long password"  # once per person
```
Then build `PORTAL_USERS` as JSON, using lowercase usernames:
```
{"ravi":"scrypt:...","priya":"scrypt:..."}
```

### 3. Deploy
1. In the hosting dashboard, click **Add New → Project** and import the same Git repo again.
2. Set **Root Directory** to `portal`. The framework should be detected as **Vite**.
3. Add these **Environment Variables** for Production:

| Name | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT` | The full contents of the JSON key file |
| `SHEET_ID` | The ID from step 1.6 |
| `SESSION_SECRET` | Output of `npm run new-secret` |
| `PORTAL_USERS` | The JSON from step 2 |
| `LEADS_TAB` | *Optional.* Name of the tab the form writes to, if it isn't the first tab |
| `PORTAL_TZ` | *Optional.* Defaults to `Asia/Kolkata` |

4. Click **Deploy**.

### 4. Subdomain
1. In the new project, go to **Settings → Domains** and add your subdomain, for example `desk.yourdomain`.
   Pick a neutral name, because subdomain names appear in public certificate logs.
2. At your DNS provider, add the **CNAME** record the dashboard shows (name = the subdomain part).
3. Wait a few minutes for HTTPS to become active.

## Day-to-day
- **Add a person:** run `hash-password`, add them to `PORTAL_USERS`, then redeploy.
- **Remove a person:** delete them from `PORTAL_USERS` and redeploy. Their session ends immediately.
- **Log everyone out:** change `SESSION_SECRET` and redeploy.
- Changes to environment variables only apply after a redeploy (**Deployments → ⋯ → Redeploy**).

## Local development
- `npm run demo`: runs the UI with fake data and no Google access. Sign in with `demo` / `demo`.
- Real data locally: run `vercel dev` in this folder, with the variables above in `.env.local`
  (this file is git-ignored).

## Security notes
- Every page and API response has `noindex` set, and `robots.txt` blocks all crawlers.
- Passwords are stored as scrypt hashes. Sessions use HttpOnly, Secure, SameSite=Strict signed cookies
  that last 12 hours. After 5 wrong passwords from one IP, logins are locked for 15 minutes.
- The Google key exists only in the host's environment variables and is never sent to the browser.
