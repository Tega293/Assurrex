import { claimCode, dateOnly, policyName } from '../api/format';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getClaim, saveGtmResult } from '../api/client';
import { predictClaimCard } from '../api/gtm';
import { Notice, StatusBadge } from '../components/ClaimUI';

function ModelScores({ name, scores }) {
  if (!scores) return <div className="model-detail"><h3>{name}</h3><p>Not scored yet.</p></div>;
  return <div className="model-detail"><h3>{name}</h3>{Object.entries(scores).map(([label,value])=><div className="score-row" key={label}><div><span>{label}</span><strong>{(value*100).toFixed(2)}%</strong></div><div className="score-track"><i style={{width:`${value*100}%`}} /></div></div>)}</div>;
}
export default function ClaimResult() {
  const { id } = useParams();
  const location = useLocation();
  const claimId = id || location.state?.claimId;
  const [record,setRecord] = useState(null);
  const [error,setError] = useState('');
  const [gtmError,setGtmError] = useState(location.state?.gtmWarning || '');
  const [busy,setBusy] = useState(false);
  useEffect(()=>{if(!claimId)return;getClaim(claimId).then(setRecord).catch(e=>setError(e.message));},[claimId]);
  async function retryGtm(){setBusy(true);setGtmError('');try{const scores=await predictClaimCard(claimId);await saveGtmResult(claimId,scores);setRecord(await getClaim(claimId));}catch(e){setGtmError(e.message);}finally{setBusy(false);}}
  if(!claimId)return <div className="member-page"><h1>Claim result</h1><p>Select a claim from <Link className="table-link" to="/claim-history">Claim history</Link>.</p></div>;
  const a=record?.analysis||{}; const c=record?.claim_data||{};
  return <div className="member-page"><div className="page-heading"><div><h1>Claim result {claimCode(claimId)}</h1><p>Recommendation, reasons, and both model scores.</p></div><Link to="/claim-history" className="outline-button">← Claim history</Link></div><Notice>{error}</Notice><Notice kind="warning">{gtmError}</Notice>{!record?(!error&&<p>Loading claim…</p>):<div className="result-grid"><section className="panel"><h2>Assessment</h2><div className="result-heading"><StatusBadge value={a.final_recommendation}/><p>{a.final_recommendation==='Manual Review'?'A member should inspect this claim before a decision.':'This is a prototype recommendation based on the selected demo policy.'}</p></div><h3>Why this result?</h3><ul className="reason-list">{(a.reasons||[]).map((reason,i)=><li key={i}>{reason}</li>)}</ul><h3>Calculated facts</h3><div className="fact-grid"><div><span>Warranty expires</span><strong>{dateOnly(a.calculated_facts?.warranty_expiry_date)}</strong></div><div><span>Days remaining</span><strong>{a.calculated_facts?.remaining_warranty_days??'—'}</strong></div><div><span>Serial match</span><strong>{a.calculated_facts?.serial_match?'Yes':'No'}</strong></div><div><span>Date conflict</span><strong>{a.calculated_facts?.date_conflict?'Yes':'No'}</strong></div></div><div className="result-actions"><Link to="/new-claim" className="solid-button">Start another claim</Link>{record.review_status==='Pending'&&<Link className="outline-button" to="/review-dashboard">Review queue</Link>}</div></section><aside className="result-side"><section className="panel"><h2>Claim details</h2><div className="details-grid"><div><p><span>Product</span>{c.product_category}</p><p><span>Issue</span>{c.fault_type}</p><p><span>Policy</span>{a.policy_name||policyName(c.policy_id)}</p><p><span>Purchase date</span>{dateOnly(c.purchase_date)}</p></div><div><p><span>Invoice</span>{c.invoice_number}</p><p><span>Receipt serial</span>{c.evidence_serial}</p><p><span>Claim date</span>{dateOnly(c.claim_date)}</p><p><span>Review</span>{record.review_status||'Complete'}</p></div></div><a className="table-link" href={`/api/claims/${claimId}/card`} target="_blank" rel="noreferrer">View generated claim card →</a>{record.review_note&&<div className="reviewed-note"><strong>Reviewer note</strong><p>{record.review_note}</p></div>}</section><section className="panel"><div className="panel-title"><h2>Model comparison</h2>{a.gtm_probabilities&&<span className="subtle-note">{a.models_disagree?'Models disagree':'Models agree'}</span>}</div><div className="score-grid"><ModelScores name="Python model" scores={a.python_probabilities}/><ModelScores name="GTM image model" scores={a.gtm_probabilities}/></div>{!a.gtm_probabilities&&<button className="outline-button" disabled={busy} onClick={retryGtm}>{busy?'Scoring image…':'Try GTM scoring again'}</button>}<p className="form-hint">Model scores are estimates. The displayed recommendation also applies warranty rules.</p></section></aside></div>}</div>;
}
