import LeadRow from './LeadRow.jsx'
import { addDays, isOpen, todayStr } from './lib.js'

function Section({ title, hint, leads, onOpen, follow, empty }) {
  return (
    <section className="card">
      <h2>{title} <span className="count">{leads.length}</span></h2>
      {hint && <p className="muted small">{hint}</p>}
      {leads.length ? (
        <ul className="list">{leads.map((l) => <LeadRow key={l.id} lead={l} onOpen={onOpen} follow={follow} />)}</ul>
      ) : (
        <p className="empty">{empty}</p>
      )}
    </section>
  )
}

export default function Today({ leads, onOpen }) {
  const t = todayStr()
  const week = addDays(7)
  const byFollow = (a, b) => a.followUp.localeCompare(b.followUp)
  const due = leads.filter((l) => isOpen(l) && l.followUp && l.followUp <= t).sort(byFollow)
  const fresh = leads.filter((l) => l.status === 'New' && !l.followUp)
  const upcoming = leads.filter((l) => isOpen(l) && l.followUp > t && l.followUp <= week).sort(byFollow)

  return (
    <div className="stack">
      <Section title="New leads" hint="Not contacted yet. Call these first." leads={fresh} onOpen={onOpen} empty="All new leads have been handled." />
      <Section title="Follow-ups due" leads={due} onOpen={onOpen} follow empty="No follow-ups due today." />
      <Section title="Next 7 days" leads={upcoming} onOpen={onOpen} follow empty="Nothing scheduled this week." />
    </div>
  )
}
