import { Link } from 'react-router-dom';

import { claimCode, dateOnly, policyName } from '../api/format';
export function StatusBadge({ value }) {
  const kind = ['Pending','Manual Review'].includes(value) ? 'review' : ['Approved','Valid Claim','Complete','Completed'].includes(value) ? 'valid' : 'invalid';
  return <span className={`claim-badge ${kind}`}><span aria-hidden="true">{kind === 'valid' ? '✓' : kind === 'invalid' ? '×' : '◷'}</span>{value || 'Complete'}</span>;
}
export function StatCard({ icon, label, value, tone = 'blue', subtext }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span className="stat-label">{label}</span><strong>{value}</strong>{subtext && <small>{subtext}</small>}</div></div>;
}
export function Notice({ children, kind = 'error' }) { return children ? <div className={`ui-notice ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div> : null; }
export function Empty({ title, description, action }) { return <div className="empty-state"><span className="stat-icon blue">▤</span><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function ClaimRows({ claims, compact = false }) {
  return <div className="table-scroll"><table className="claims-table"><thead><tr><th>Claim ID</th><th>Product</th>{!compact && <><th>Policy</th><th>Submitted</th></>}<th>Recommendation</th><th>Review status</th><th>Action</th></tr></thead><tbody>
    {claims.map(claim => <tr key={claim.id} className={claim.review_status === 'Pending' ? 'highlight-row' : ''}><td><strong>{claimCode(claim.id)}</strong></td><td>{claim.product_category || 'Product'}</td>{!compact && <><td>{policyName(claim.policy_id)}</td><td>{dateOnly(claim.claim_date || claim.created_at)}</td></>}<td><StatusBadge value={claim.final_recommendation} /></td><td><StatusBadge value={claim.review_status || 'Complete'} /></td><td><Link className="table-link" to={`/claims/${claim.id}`}>View {compact ? '' : 'result '}→</Link></td></tr>)}
  </tbody></table></div>;
}
