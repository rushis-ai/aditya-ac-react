import { useCallback, useEffect, useRef, useState } from 'react'
import { call, AuthError } from './api.js'
import Login from './Login.jsx'
import Today from './Today.jsx'
import { dueCount } from './lib.js'
import Leads from './Leads.jsx'
import Reports from './Reports.jsx'
import LeadPanel from './LeadPanel.jsx'

const TABS = [['today', 'Today'], ['leads', 'Leads'], ['reports', 'Reports']]
const REFRESH_MS = 60_000

export default function App() {
  const [me, setMe] = useState(undefined) // undefined = checking, null = logged out
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('today')
  const [openId, setOpenId] = useState(null)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const toastTimer = useRef(null)
  const saving = useRef(0) // skip background refresh while a save is in flight

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
      setNotice('Your session ended. Please sign in again.')
    } else {
      setError(err.message)
    }
  }, [])

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
      if (!saving.current) setLeads(d.leads)
      setError('')
    } catch (err) {
      handle(err)
    } finally {
      setLoading(false)
    }
  }, [handle])

  useEffect(() => {
    call('me').then(setMe, (err) => {
      setMe(null)
      if (!(err instanceof AuthError)) setNotice(err.message)
    })
  }, [])

  useEffect(() => {
    if (!me) return
    const tick = () => document.visibilityState === 'visible' && load()
    const first = setTimeout(load, 0)
    const timer = setInterval(tick, REFRESH_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [me, load])

  const patch = (id, fields) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...fields } : l)))

  const update = useCallback(async (id, changes) => {
    const before = leads.find((l) => l.id === id)
    patch(id, changes)
    saving.current++
    try {
      const d = await call('lead', { method: 'POST', body: { id, ...changes } })
      patch(id, d.lead)
      flash('Saved')
    } catch (err) {
      if (before) patch(id, before)
      handle(err)
    } finally {
      saving.current--
    }
  }, [leads, flash, handle])

  const addNote = useCallback(async (id, text) => {
    saving.current++
    try {
      const d = await call('note', { method: 'POST', body: { id, text } })
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, notes: [d.note, ...l.notes] } : l)))
      flash('Note added')
      return true
    } catch (err) {
      handle(err)
      return false
    } finally {
      saving.current--
    }
  }, [flash, handle])

  async function logout() {
    await call('logout', { method: 'POST' }).catch(() => {})
    setMe(null)
    setLeads(null)
    setNotice('')
  }

  const closePanel = useCallback(() => setOpenId(null), [])

  if (me === undefined) return <div className="center muted">Loading…</div>
  if (!me) return <Login notice={notice} onLogin={() => { setNotice(''); checkSession() }} />

  const open = leads?.find((l) => l.id === openId)
  const due = leads ? dueCount(leads) : 0

  return (
    <div className="app">
      <header className="top">
        <div className="top-row">
          <strong className="brand">Lead Desk</strong>
          <div className="top-actions">
            <button className="btn icon" onClick={load} disabled={loading} aria-label="Refresh" title="Refresh">
              <span className={loading ? 'spin' : ''}>↻</span>
            </button>
            <span className="muted small user">{me.user}</span>
            <button className="btn" onClick={logout}>Log out</button>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(([k, label]) => (
            <button key={k} className={'tab' + (tab === k ? ' active' : '')} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
              {label}
              {k === 'today' && due > 0 && <span className="count">{due}</span>}
            </button>
          ))}
        </nav>
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
          <Today leads={leads} onOpen={setOpenId} />
        ) : tab === 'leads' ? (
          <Leads leads={leads} statuses={me.statuses} users={me.users} onOpen={setOpenId} />
        ) : (
          <Reports leads={leads} statuses={me.statuses} />
        )}
      </main>

      {open && (
        <LeadPanel lead={open} users={me.users} statuses={me.statuses} onUpdate={update} onNote={addNote} onClose={closePanel} />
      )}
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
