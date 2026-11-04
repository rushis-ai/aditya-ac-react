import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Snowflake, Fan, Clock } from 'lucide-react'
import { TIMEZONE, OPENS, CLOSES } from '../config/business'

// Illustrated hero: an indoor AC unit blowing cool air while the room temperature drops.
// Pure SVG/CSS, so it weighs a few KB instead of a photo's hundreds.

const START_TEMP = 38
const END_TEMP = 24

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Is the business open right now, in its own time zone?
function openNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date())
  const h = Number(parts.find(p => p.type === 'hour').value)
  const m = Number(parts.find(p => p.type === 'minute').value)
  const now = h * 60 + m
  return now >= OPENS.h * 60 + OPENS.m && now < CLOSES.h * 60 + CLOSES.m
}
const fmt = ({ h, m }) => `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`

function useCoolDown() {
  const [temp, setTemp] = useState(() => (reducedMotion() ? END_TEMP : START_TEMP))
  useEffect(() => {
    if (reducedMotion()) return
    let t = START_TEMP
    let iv
    const start = setTimeout(() => {
      iv = setInterval(() => {
        t -= 1
        setTemp(t)
        if (t <= END_TEMP) clearInterval(iv)
      }, 140)
    }, 1100)
    return () => { clearTimeout(start); clearInterval(iv) }
  }, [])
  return temp
}

function useOpen() {
  const [open, setOpen] = useState(openNow)
  useEffect(() => {
    const iv = setInterval(() => setOpen(openNow()), 60000)
    return () => clearInterval(iv)
  }, [])
  return open
}

function AcUnit({ temp }) {
  return (
    <svg viewBox="0 0 400 118" className="hv-unit" aria-hidden="true">
      <defs>
        <linearGradient id="hv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe4ef" />
        </linearGradient>
        <filter id="hv-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      {/* body */}
      <rect x="2" y="2" width="396" height="104" rx="24" fill="url(#hv-body)" />
      <rect x="2" y="2" width="396" height="104" rx="24" fill="none" stroke="#ffffff" strokeOpacity="0.9" />
      {/* panel seam + louver */}
      <rect x="22" y="70" width="356" height="2" rx="1" fill="#c9d5e3" />
      <rect x="28" y="82" width="344" height="14" rx="7" fill="#b9c7d8" />
      {[60, 120, 180, 240, 300].map(x => <rect key={x} x={x} y="85" width="40" height="2" rx="1" fill="#a3b3c7" />)}
      {/* brand dots */}
      <circle cx="40" cy="38" r="4" fill="#1a56db" />
      <circle cx="54" cy="38" r="4" fill="#06b6d4" />
      {/* display */}
      <rect x="292" y="22" width="80" height="34" rx="9" fill="#0a1628" />
      <circle cx="281" cy="39" r="3.5" fill="#22c55e" />
      <circle cx="281" cy="39" r="3.5" fill="#22c55e" filter="url(#hv-glow)" />
      <text x="332" y="46" textAnchor="middle" fill="#22d3ee" fontFamily="DM Sans, sans-serif" fontSize="19" fontWeight="600">
        {temp}°
      </text>
    </svg>
  )
}

function Airflow() {
  const xs = [70, 135, 200, 265, 330]
  return (
    <svg viewBox="0 0 400 230" className="hv-air" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hv-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {xs.map((x, i) => (
        <path
          key={x}
          className="hv-stream"
          style={{ animationDelay: `${i * -0.35}s` }}
          d={`M${x} 0 q ${i % 2 ? -16 : 16} 38 0 76 t 0 76 t 0 76`}
          fill="none" stroke="url(#hv-fade)" strokeWidth="3" strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

const FLAKES = [
  { left: '18%', delay: 0, size: 14 }, { left: '34%', delay: 1.6, size: 10 },
  { left: '52%', delay: 0.8, size: 16 }, { left: '68%', delay: 2.3, size: 11 },
  { left: '82%', delay: 1.2, size: 13 }, { left: '44%', delay: 3, size: 9 }
]

export default function HeroVisual() {
  const temp = useCoolDown()
  const open = useOpen()
  const progress = (START_TEMP - temp) / (START_TEMP - END_TEMP)

  return (
    <div className="hv">
      <div className="hv-stage">
        <div className="hv-glow" />
        <AcUnit temp={temp} />
        <Airflow />
        {FLAKES.map((f, i) => (
          <Snowflake
            key={i} className="hv-flake" size={f.size} strokeWidth={2} aria-hidden="true"
            style={{ left: f.left, animationDelay: `${f.delay}s` }}
          />
        ))}
        <div className="hv-floor" />
      </div>

      {/* Thermostat card */}
      <motion.div
        className="hv-thermo"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        role="img" aria-label={`Room temperature cooling to ${END_TEMP} degrees`}
      >
        <span className="hv-thermo-label">Room temperature</span>
        <span className="hv-thermo-temp">{temp}°<small>C</small></span>
        <span className="hv-thermo-bar"><span style={{ transform: `scaleX(${progress})` }} /></span>
        <span className="hv-thermo-mode">
          <Snowflake size={13} aria-hidden="true" /> Cooling
          <Fan size={13} aria-hidden="true" className="hv-fan" style={{ marginLeft: 'auto' }} /> Auto
        </span>
      </motion.div>

      {/* Live open/closed badge */}
      <motion.div
        className="hv-status"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        {open
          ? <span className="hv-dot" aria-hidden="true" />
          : <Clock size={18} aria-hidden="true" style={{ color: '#f59e0b', flexShrink: 0 }} />}
        <span>
          <strong>{open ? 'Open now · Same-day visits' : 'Closed now'}</strong>
          <small>{open ? `Book before ${fmt(CLOSES)}` : `Opens at ${fmt(OPENS)} · Book online anytime`}</small>
        </span>
      </motion.div>
    </div>
  )
}
