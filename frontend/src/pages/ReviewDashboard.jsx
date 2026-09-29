import { claimCode, dateOnly, policyName } from '../api/format';
import { useEffect, useState } from 'react';
import { getClaim, getClaims, reviewClaim } from '../api/client';
import { Empty, Notice, StatusBadge } from '../components/ClaimUI';

function highest(probabilities) {
  if (!probabilities) return null;
  const [name, value] = Object.entries(probabilities).sort((a,b) => b[1]-a[1])[0] || [];
  return name ? {name, percent: (value*100).toFixed(2)} : null;
}
export default function ReviewDashboard() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { getClaims().then(setClaims).catch(e => setError(e.message)); }, []);
  const reviewClaims = claims.filter(c => c.final_recommendation === 'Manual Review');
  const visible = reviewClaims.filter(c => filter === 'All' || (filter === 'Pending' ? c.review_status === 'Pending' : c.review_status !== 'Pending'));
  const active = selected && visible.some(c => c.id === selected.id) ? selected : null;
  async function select(id) { setError(''); setMessage(''); setNote(''); try { setSelected(await getClaim(id)); } catch(e) { setError(e.message); } }
  async function decide(decision) {
    if (!selected || !note.trim()) { setError('A review note is required.'); return; }
    setBusy(true); setError('');
    try {
      await reviewClaim(selected.id, decision, note.trim());
      setClaims(await getClaims()); setSelected(await getClaim(selected.id)); setFilter('Reviewed');
      setMessage(`Claim ${claimCode(active.id)} ${decision.toLowerCase()} and saved.`);
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const analysis = active?.analysis || {};
  const claim = active?.claim_data || {};
  const python = highest(analysis.python_probabilities);
  const gtm = highest(analysis.gtm_probabilities);
  return <div className="member-page"><div className="review-grid"><div><div className="page-heading"><h1>Manual review</h1><p>Review flagged claims, inspect the evidence, and decide the outcome.</p></div><Notice>{error}</Notice><Notice kind="success">{message}</Notice><div className="tab-row">{['Pending','Reviewed','All'].map(tab=><button key={tab} className={filter === tab?'active':''} onClick={()=>setFilter(tab)}>{tab} <span>{tab==='All'?reviewClaims.length:tab==='Pending'?reviewClaims.filter(c=>c.review_status==='Pending').length:reviewClaims.filter(c=>c.review_status!=='Pending').length}</span></button>)}</div><section className="panel table-panel"><div className="table-scroll"><table className="claims-table"><thead><tr><th>Claim ID</th><th>Product</th><th>Issue</th><th>Status</th><th>Claim date</th><th></th></tr></thead><tbody>{visible.map(c=><tr key={c.id} onClick={()=>select(c.id)} className={`click-row ${selected?.id===c.id?'selected-row':''}`}><td><strong>{claimCode(c.id)}</strong></td><td>{c.product_category}</td><td>{c.fault_type}</td><td><StatusBadge value={c.review_status}/></td><td>{dateOnly(c.claim_date||c.created_at)}</td><td>›</td></tr>)}</tbody></table></div>{!visible.length&&<Empty title="No claims in this tab" description="Manual Review claims will appear here when available." />}</section></div><aside className="panel review-details">{!active?<Empty title="Select a claim" description="Choose a row to see the evidence and record a review decision." />:<><div className="panel-title"><h2>Claim {claimCode(active.id)}</h2><StatusBadge value={active.review_status||'Pending'}/></div><div className="details-grid"><div><p><span>Product</span>{claim.product_category}</p><p><span>Issue</span>{claim.fault_type}</p><p><span>Cover</span>{policyName(claim.policy_id)}</p><p><span>Purchase date</span>{dateOnly(claim.purchase_date)}</p><p><span>Claim date</span>{dateOnly(claim.claim_date)}</p></div><div><p><span>Invoice number</span>{claim.invoice_number||'—'}</p><p><span>Serial number</span>{claim.evidence_serial||'—'}</p></div></div><div className="reason-box"><span>!</span><div><small>Reason</small><strong>{analysis.reasons?.join(' ')||'Review required.'}</strong></div></div><div className="model-pair"><div><small>Python</small><strong>{python?`${python.percent}%`:'—'}</strong><span>{python?.name||'Unavailable'}</span></div><div><small>GTM</small><strong>{gtm?`${gtm.percent}%`:'—'}</strong><span>{gtm?.name||'Not scored'}</span></div></div><a className="table-link card-link" href={`/api/claims/${selected.id}/card`} target="_blank" rel="noreferrer">▤ &nbsp; View claim card →</a>{active.review_status==='Pending'?<><label className="note-field">Review note (required)<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add your review note here…" rows="4"/></label><div className="decision-buttons"><button className="solid-button" disabled={busy||!note.trim()} onClick={()=>decide('Approved')}>Approve</button><button className="reject-button" disabled={busy||!note.trim()} onClick={()=>decide('Rejected')}>Reject</button></div></>:<div className="reviewed-note"><strong>{active.review_status}</strong><p>{active.review_note}</p></div>}</>}</aside></div></div>;
}
