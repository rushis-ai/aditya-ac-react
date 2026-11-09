import LeadRow from './LeadRow.jsx'
import { addDays, isOpen, todayStr } from './lib.js'

function Section({ title, hint, leads, onOpen, follow, empty, tone }) {
  return (
    <section className={'card section-card ' + (tone || '')}>
      <div className="card-head inline">
        <h2>{title} <span className="count-pill">{leads.length}</span></h2>
        {hint && <span className="muted small">{hint}</span>}
      </div>
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
  const todayCount = leads.filter((l) => l.date.startsWith(t)).length
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{greet}</h1>
          <p className="muted">
            {todayCount} new {todayCount === 1 ? 'enquiry' : 'enquiries'} today · {fresh.length} waiting for a call · {due.length} follow-ups due
          </p>
        </div>
      </div>
      <div className="today-grid">
        <Section title="Call first" hint="New, not contacted yet" leads={fresh} onOpen={onOpen} empty="All new leads have been handled." tone="tone-new" />
        <div className="stack">
          <Section title="Follow-ups due" leads={due} onOpen={onOpen} follow empty="No follow-ups due today." tone="tone-due" />
          <Section title="Next 7 days" leads={upcoming} onOpen={onOpen} follow empty="Nothing scheduled this week." />
        </div>
      </div>
    </div>
  )
}
