import { claimCode, dateOnly } from '../api/format';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaims } from '../api/client';
import { Empty, Notice, StatCard } from '../components/ClaimUI';

function parseCsv(text) {
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) { const char=text[i]; if(char==='"' && quoted && text[i+1]==='"'){cell+='"';i++;}else if(char==='"'){quoted=!quoted;}else if(char===','&&!quoted){row.push(cell);cell='';}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(v=>v.trim()))rows.push(row);row=[];}else cell+=char; }
  row.push(cell); if(row.some(v=>v.trim()))rows.push(row);
  const header=rows.shift()?.map(v=>v.trim().toLowerCase())||[];
  return rows.map(values=>Object.fromEntries(header.map((key,index)=>[key,(values[index]||'').trim()])));
}
function exportClaims(claims) {
  const columns=['claim_id','submitted','product','policy','recommendation','review_status','invoice_number'];
  const quote=value=>`"${String(value??'').replaceAll('"','""')}"`;
  const csv=[columns.join(','),...claims.map(c=>[claimCode(c.id),dateOnly(c.claim_date||c.created_at),c.product_category,c.policy_id,c.final_recommendation,c.review_status||'Complete',c.invoice_number].map(quote).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='assurex-claims-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const labels=['Valid Claim','Invalid Claim','Manual Review'];
export default function Reports() {
  const [claims,setClaims]=useState([]);
  const [from,setFrom]=useState(''); const [to,setTo]=useState('');
  const [evaluation,setEvaluation]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{getClaims().then(setClaims).catch(e=>setError(e.message));},[]);
  const scoped=useMemo(()=>claims.filter(c=>{const date=dateOnly(c.claim_date||c.created_at);return (!from||date>=from)&&(!to||date<=to);}),[claims,from,to]);
  const count=label=>scoped.filter(c=>c.final_recommendation===label).length;
  const agreementReady=scoped.filter(c=>c.gtm_prediction && c.models_disagree!==null);
  async function importEvaluation(file) {
    if(!file)return;
    try {
      const rows=parseCsv(await file.text());
      const required=['claim_id','true_class','python_prediction','gtm_prediction'];
      if(rows.length!==30 || rows.some(row=>required.some(key=>!row[key]||!labels.includes(row[key])&&key!=='claim_id')))throw new Error('Expected exactly 30 rows with claim_id, true_class, python_prediction, gtm_prediction. Class values must be Valid Claim, Invalid Claim, or Manual Review.');
      if(new Set(rows.map(row=>row.claim_id)).size!==30 || labels.some(label=>rows.filter(row=>row.true_class===label).length!==10))throw new Error('Use 30 distinct unseen claims: 10 of each true class.');
      setEvaluation(rows);setError('');
    } catch(e){setError(e.message);}
  }
  const width=label=>scoped.length?`${(count(label)/scoped.length)*100}%`:'0%';
  return <div className="member-page"><div className="page-heading reports-heading"><div><h1>Reports &amp; evaluation</h1><p>Review claim outcomes and model performance.</p></div><div className="report-controls"><label>From <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><span>→</span><label>To <input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="solid-button" onClick={()=>exportClaims(scoped)}>↓ &nbsp; Export CSV</button></div></div><Notice>{error}</Notice><div className="report-summary"><StatCard icon="▤" label="Claims processed" value={scoped.length}/><StatCard icon="◷" tone="amber" label="Manual review pending" value={scoped.filter(c=>c.review_status==='Pending').length}/><StatCard icon="▥" label="Models agree" value={agreementReady.length?`${agreementReady.filter(c=>c.models_disagree===false).length}/${agreementReady.length}`:'—'} subtext={agreementReady.length?'Claims with both scores':'Awaiting GTM scores'}/><section className="panel outcome-summary"><h2>Claim outcomes</h2><div className="stacked-bar"><span className="valid" style={{width:width('Valid Claim')}}/><span className="invalid" style={{width:width('Invalid Claim')}}/><span className="review" style={{width:width('Manual Review')}}/></div><div className="outcome-legend">{labels.map(label=><span key={label}>{label}: <b>{count(label)}</b></span>)}</div></section></div>
  <section className="panel eval-panel"><div className="panel-title"><div><h2>30 unseen claim comparison</h2><p>Compare both model predictions against known labels (10 of each class).</p></div><Link to="/claim-history" className="table-link">View claim history →</Link></div><div className="eval-grid"><div className="eval-content">{!evaluation?<Empty title="No comparison results yet" description="Import the team's evaluation CSV after both models score 30 held-out claims." action={<label className="solid-button upload-eval">↓ &nbsp; Import evaluation CSV<input type="file" accept=".csv,text/csv" onChange={e=>importEvaluation(e.target.files?.[0])}/></label>}/>:<><h3>Comparison loaded</h3><p>Results from {evaluation.length} unseen claims. This file is shown locally in your browser.</p><div className="eval-mini-table"><span>Ground truth</span><span>Python correct</span><span>GTM correct</span>{labels.map(label=><Fragment key={label}><strong>{label}</strong><span>{evaluation.filter(r=>r.true_class===label&&r.python_prediction===label).length}/10</span><span>{evaluation.filter(r=>r.true_class===label&&r.gtm_prediction===label).length}/10</span></Fragment>)}</div><label className="table-link upload-eval">Import a different CSV<input type="file" accept=".csv,text/csv" onChange={e=>importEvaluation(e.target.files?.[0])}/></label></>}</div><aside className="eval-summary"><h3>Summary (30 claims)</h3><div>⌘ &nbsp; Python correct <strong>{evaluation?evaluation.filter(r=>r.python_prediction===r.true_class).length:'—'}</strong></div><div>♧ &nbsp; GTM correct <strong>{evaluation?evaluation.filter(r=>r.gtm_prediction===r.true_class).length:'—'}</strong></div><div>△ &nbsp; Disagreement count <strong>{evaluation?evaluation.filter(r=>r.gtm_prediction!==r.python_prediction).length:'—'}</strong></div></aside></div></section></div>;
}
