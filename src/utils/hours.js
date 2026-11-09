import { useSyncExternalStore } from 'react'
import { TIMEZONE, OPENS, CLOSES } from '../config/business'

// Is the business open right now, in its own time zone?
export function openNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date())
  const h = Number(parts.find(p => p.type === 'hour').value)
  const m = Number(parts.find(p => p.type === 'minute').value)
  const now = h * 60 + m
  return now >= OPENS.h * 60 + OPENS.m && now < CLOSES.h * 60 + CLOSES.m
}

// {h: 23, m: 30} -> "11:30 PM"
export const fmtTime = ({ h, m }) => `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`
export const OPENS_TEXT = fmtTime(OPENS)
export const CLOSES_TEXT = fmtTime(CLOSES)

// Re-checks every minute so the badge flips at opening/closing time.
// useSyncExternalStore keeps prerendered HTML and the first browser render in
// agreement (server snapshot = "open"), then switches to the real value.
const subscribe = (cb) => { const iv = setInterval(cb, 60000); return () => clearInterval(iv) }
export function useOpenNow() {
  return useSyncExternalStore(subscribe, openNow, () => true)
}
