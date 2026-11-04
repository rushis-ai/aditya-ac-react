import { useEffect, useState } from 'react'
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

// Re-checks every minute so the badge flips at opening/closing time
export function useOpenNow() {
  const [open, setOpen] = useState(openNow)
  useEffect(() => {
    const iv = setInterval(() => setOpen(openNow()), 60000)
    return () => clearInterval(iv)
  }, [])
  return open
}
