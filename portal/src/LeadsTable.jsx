import { StatusBadge } from './LeadRow.jsx'
import { fmtDate, serviceLabel, sourceOf, telLink, todayStr, typedNotes } from './lib.js'

// Table on desktop, stacked cards on phones (same markup; CSS switches the layout)
export default function LeadsTable({ leads, onOpen, compact = false }) {
  const t = todayStr()
  return (
    <div className="table-scroll">
      <table className="leads-table">
        <thead>
          <tr>
            <th scope="col">Received</th>
            <th scope="col">Name</th>
            <th scope="col">Phone</th>
            <th scope="col">Service</th>
            <th scope="col">Status</th>
            {!compact && <th scope="col">Assigned</th>}
            {!compact && <th scope="col">Follow-up</th>}
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} onClick={() => onOpen(l.id)}>
              <td data-label="Received" className="nowrap muted">{fmtDate(l.date) || '—'}</td>
              <td data-label="Name" className="cell-name">
                <button className="link-btn" onClick={(e) => { e.stopPropagation(); onOpen(l.id) }}>
                  {l.name || '(no name)'}
                </button>
                {typedNotes(l).length > 0 && <span className="note-count" title={`${typedNotes(l).length} note(s)`}>{typedNotes(l).length}</span>}
              </td>
              <td data-label="Phone" className="nowrap">
                {l.phone ? <a href={telLink(l.phone)} onClick={(e) => { e.stopPropagation(); onOpen(l.id, 'call') }}>{l.phone}</a> : '—'}
              </td>
              <td data-label="Service"><span className="svc">{serviceLabel(l.service)}</span></td>
              <td data-label="Status"><StatusBadge status={l.status} /></td>
              {!compact && <td data-label="Assigned">{l.assigned || <span className="muted">—</span>}</td>}
              {!compact && (
                <td data-label="Follow-up" className={'nowrap' + (l.followUp && l.followUp < t && !['Won', 'Lost', 'Spam'].includes(l.status) ? ' danger' : '')}>
                  {l.followUp ? fmtDate(l.followUp, { time: false }) : <span className="muted">—</span>}
                </td>
              )}
              <td data-label="Source" className="muted">{sourceOf(l)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
