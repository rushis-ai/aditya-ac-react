import { useCallback, useEffect, useRef, useState } from 'react'
import { call, AuthError } from './api.js'
import Login from './Login.jsx'
import Today from './Today.jsx'
import { dueCount, serviceLabel } from './lib.js'
import Leads from './Leads.jsx'
import Reports from './Reports.jsx'
import LeadPanel from './LeadPanel.jsx'
import NewLead from './NewLead.jsx'
import Logo from './Logo.jsx'

const TABS = [['today', 'Today'], ['leads', 'Leads'], ['reports', 'Report']]
const REFRESH_MS = 60_000
const TITLE = document.title
const canNotify = typeof window !== 'undefined' && 'Notification' in window

export default function App() {
  const [me, setMe] = useState(undefined) // undefined = checking, null = logged out
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('today')
  const [openId, setOpenId] = useState(null)
  const [prompt, setPrompt] = useState(null) // 'call' when the panel opens from a Call button
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState(canNotify ? Notification.permission : 'unsupported')
  const toastTimer = useRef(null)
  const saving = useRef(0) // skip background refresh while a save is in flight
  const known = useRef(null) // lead IDs already seen, to spot new arrivals

  const flash = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2500)
  }, [])

  const handle = useCallback((err) => {
    if (err instanceof AuthError) {
      setMe(null)
      setLeads(null)
      setOpenId(null)
      known.current = null
      setNotice('Your session ended. Please sign in again.')
    } else {
      setError(err.message)
    }
  }, [])

  const openLead = useCallback((id, why = null) => {
    setOpenId(id)
    setPrompt(why)
  }, [])

  const announce = useCallback((fresh) => {
    if (!fresh.length) return
    const one = fresh.length === 1 ? fresh[0] : null
    flash(one ? `New lead: ${one.name || one.phone}` : `${fresh.length} new leads`)
    if (!canNotify || Notification.permission !== 'granted') return
    try {
      const n = new Notification(one ? `New lead: ${one.name || one.phone}` : `${fresh.length} new leads`, {
        body: one ? [serviceLabel(one.service), one.message].filter((s) => s && s !== '—').join(' · ').slice(0, 140) : 'Open Lead Desk to see them.',
        tag: 'new-lead',
        icon: '/favicon.svg'
      })
      n.onclick = () => {
        window.focus()
        setTab('today')
        if (one) openLead(one.id)
        n.close()
      }
    } catch {
      // Some phone browsers only allow notifications from an installed app; the toast still shows
    }
  }, [flash, openLead])

  const checkSession = useCallback(async () => {
    try {
      setMe(await call('me'))
    } catch (err) {
      setMe(null)
      if (!(err instanceof AuthError)) setNotice(err.message)
    }
  }, [])

  const load = useCallback(async () => {
    if (saving.current) return
    setLoading(true)
    try {
      const d = await call('leads')
      if (saving.current) return
      if (known.current) announce(d.leads.filter((l) => !known.current.has(l.id)))
      known.current = new Set(d.leads.map((l) => l.id))
      setLeads(d.leads)
      setError('')
    } catch (err) {
      handle(err)
    } finally {
      setLoading(false)
    }
  }, [handle, announce])

  useEffect(() => {
    call('me').then(setMe, (err) => {
      setMe(null)
      if (!(err instanceof AuthError)) setNotice(err.message)
    })
  }, [])

  useEffect(() => {
    if (!me) return
    // With alerts on, keep checking in a background tab so new leads still pop up
    const tick = () => (document.visibilityState === 'visible' || alerts === 'granted') && load()
    const first = setTimeout(load, 0)
    const timer = setInterval(tick, REFRESH_MS)
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [me, load, alerts])

  const due = leads ? dueCount(leads) : 0
  useEffect(() => {
    document.title = due ? `(${due}) ${TITLE}` : TITLE
  }, [due])

  const patch = (id, fields) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...fields } : l)))
  const prependNotes = (id, notes) =>
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, notes: [...notes, ...l.notes] } : l)))

  const update = useCallback(async (id, changes) => {
    const before = leads.find((l) => l.id === id)
    patch(id, changes)
    saving.current++
    try {
      const d = await call('lead', { method: 'POST', body: { id, ...changes } })
      patch(id, d.lead)
      if (d.history?.length) prependNotes(id, d.history)
      flash('Saved')
    } catch (err) {
      if (before) patch(id, { status: before.status, assigned: before.assigned, followUp: before.followUp })
      handle(err)
    } finally {
      saving.current--
    }
  }, [leads, flash, handle])

  const addNote = useCallback(async (id, text) => {
    saving.current++
    try {
      const d = await call('note', { method: 'POST', body: { id, text } })
      prependNotes(id, [d.note])
      flash('Note added')
      return true
    } catch (err) {
      handle(err)
      return false
    } finally {
      saving.current--
    }
  }, [flash, handle])

  const addLead = useCallback(async (fields) => {
    saving.current++
    try {
      const d = await call('add', { method: 'POST', body: fields })
      known.current?.add(d.lead.id)
      setLeads((ls) => [d.lead, ...(ls || [])])
      setAdding(false)
      flash('Lead added')
      openLead(d.lead.id)
      return ''
    } catch (err) {
      if (err instanceof AuthError) handle(err)
      return err.message
    } finally {
      saving.current--
    }
  }, [flash, handle, openLead])

  async function enableAlerts() {
    const p = await Notification.requestPermission()
    setAlerts(p)
    flash(p === 'granted' ? 'Alerts on for this browser' : 'Alerts are blocked in this browser’s settings')
  }

  async function logout() {
    await call('logout', { method: 'POST' }).catch(() => {})
    setMe(null)
    setLeads(null)
    known.current = null
    setNotice('')
  }

  const closePanel = useCallback(() => setOpenId(null), [])
  const closeAdd = useCallback(() => setAdding(false), [])

  if (me === undefined) return <div className="center muted">Loading…</div>
  if (!me) return <Login notice={notice} onLogin={() => { setNotice(''); checkSession() }} />

  const open = leads?.find((l) => l.id === openId)

  return (
    <div className="app">
      <header className="top">
        <div className="top-row">
          <div className="brand">
            <Logo size={34} />
            <span className="brand-text">
              <strong>Lead Desk</strong>
              <span>Enquiry manager</span>
            </span>
          </div>
          <nav className="tabs" aria-label="Sections">
            {TABS.map(([k, label]) => (
              <button key={k} className={'tab' + (tab === k ? ' active' : '')} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
                {label}
                {k === 'today' && due > 0 && <span className="count">{due}</span>}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <button className="btn accent sm" onClick={() => setAdding(true)} disabled={!leads}>
              + <span className="hide-sm">New </span>lead
            </button>
            {alerts === 'default' && (
              <button className="icon-btn" onClick={enableAlerts} aria-label="Turn on new-lead alerts" title="Turn on new-lead alerts">
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" />
                </svg>
              </button>
            )}
            <button className="icon-btn" onClick={load} disabled={loading} aria-label="Refresh leads" title="Refresh">
              <span className={loading ? 'spin' : ''}>↻</span>
            </button>
            <span className="avatar" title={`Signed in as ${me.user}`}>{me.user.slice(0, 1).toUpperCase()}</span>
            <button className="btn ghost" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="content">
        {error && (
          <div className="banner" role="alert">
            {error} <button className="link" onClick={() => { setError(''); load() }}>Retry</button>
          </div>
        )}
        {!leads ? (
          !error && <div className="center muted">Loading leads…</div>
        ) : tab === 'today' ? (
          <Today leads={leads} onOpen={openLead} />
        ) : tab === 'leads' ? (
          <Leads leads={leads} statuses={me.statuses} users={me.users} onOpen={openLead} />
        ) : (
          <Reports leads={leads} onOpen={openLead} />
        )}
      </main>

      {open && (
        <LeadPanel
          key={open.id}
          lead={open}
          prompt={prompt}
          users={me.users}
          statuses={me.statuses}
          onUpdate={update}
          onNote={addNote}
          onClose={closePanel}
        />
      )}
      {adding && (
        <NewLead
          leads={leads}
          me={me.user}
          users={me.users}
          channels={me.channels || ['Phone call', 'Walk-in', 'Referral', 'Other']}
          onSave={addLead}
          onOpen={(id) => { setAdding(false); openLead(id) }}
          onClose={closeAdd}
        />
      )}
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
