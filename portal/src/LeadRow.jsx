import { fmtDate, serviceLabel, telLink, todayStr } from './lib.js'

export function StatusBadge({ status }) {
  return <span className={'badge s-' + status.toLowerCase()}>{status}</span>
}

// One lead in a list. `follow` shows the follow-up date instead of the received date.
export default function LeadRow({ lead, onOpen, follow = false }) {
  const overdue = follow && lead.followUp && lead.followUp < todayStr()
  return (
    <li className="row">
      <button className="row-open" onClick={() => onOpen(lead.id)}>
        <span className="row-main">
          <span className="row-name">{lead.name || '(no name)'}</span>
          <span className="muted small">{serviceLabel(lead.service)}{lead.assigned ? ` · ${lead.assigned}` : ''}</span>
        </span>
        <span className="row-meta">
          <StatusBadge status={lead.status} />
          <span className={'small ' + (overdue ? 'danger' : 'muted')}>
            {follow && lead.followUp
              ? (overdue ? 'Overdue · ' : 'Follow-up · ') + fmtDate(lead.followUp, { time: false })
              : fmtDate(lead.date)}
          </span>
        </span>
      </button>
      {lead.phone && (
        <a className="row-call" href={telLink(lead.phone)} onClick={() => onOpen(lead.id, 'call')} aria-label={`Call ${lead.name}`} title="Call">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1z" />
          </svg>
        </a>
      )}
    </li>
  )
}
