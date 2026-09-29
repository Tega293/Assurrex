import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeClaim, getPolicies, saveGtmResult, scanReceipt } from '../api/client';
import { predictClaimCard } from '../api/gtm';
import { Notice } from '../components/ClaimUI';

const faultOptions = { Phone: ['Battery fault', 'Display fault', 'Power fault'], Laptop: ['Battery fault', 'Display fault', 'Power fault'], Appliance: ['Power fault', 'Mechanical fault', 'Motor fault'] };
const initial = { product_category: 'Phone', policy_id: 'basic', purchase_date: '', fault_type: 'Battery fault', fault_date: '', claim_date: new Date().toLocaleDateString('en-CA'), damage_type: 'None', repair_count: '0', repair_date: '', authorized_repair: '1', invoice_number: '', registered_serial: '', evidence_serial: '', missing_document_count: '0' };
export default function NewClaim() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(initial);
  const [policies, setPolicies] = useState({});
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { getPolicies().then(setPolicies).catch(e => setError(e.message)); }, []);
  const set = (name, value) => setFields(current => ({ ...current, [name]: value }));
  function changeCategory(event) { const category = event.target.value; setFields(current => ({ ...current, product_category: category, fault_type: faultOptions[category][0] })); }
  async function upload(selected) {
    setFile(selected); setRawText(''); setError(''); setMessage('');
    if (!selected) return;
    setBusy('Scanning receipt…');
    try {
      const result = await scanReceipt(selected);
      const suggested = result.suggested_fields || {};
      setFields(current => ({ ...current,
        invoice_number: suggested.invoice_number || current.invoice_number,
        evidence_serial: suggested.evidence_serial || current.evidence_serial,
        purchase_date: suggested.possible_purchase_date || current.purchase_date,
      }));
      setRawText(result.raw_text || '');
      setMessage('Receipt scanned. Check and correct the extracted fields below before submitting.');
    } catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy('Analysing claim…');
    try {
      const payload = { ...fields, receipt_present: file ? 1 : 0,
        repair_count: Number(fields.repair_count), missing_document_count: Number(fields.missing_document_count),
        authorized_repair: fields.repair_count === '0' ? null : Number(fields.authorized_repair),
        repair_date: fields.repair_count === '0' ? null : fields.repair_date || null,
      };
      const result = await analyzeClaim(payload);
      let gtmWarning = '';
      try {
        const probabilities = await predictClaimCard(result.claim_id);
        await saveGtmResult(result.claim_id, probabilities);
      } catch (err) { gtmWarning = `Claim saved. GTM image score is unavailable: ${err.message}`; }
      navigate(`/claims/${result.claim_id}`, { state: { gtmWarning } });
    } catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }
  return <div className="member-page"><div className="page-heading"><h1>New warranty claim</h1><p>Provide your product details and receipt so we can check your claim.</p></div><Notice>{error}</Notice><Notice kind="success">{message}</Notice>
    <form onSubmit={submit} className="claim-form-grid"><section className="panel form-panel"><h2><span className="section-icon">▯</span> Product &amp; policy</h2><label className="field-row"><span>Product category</span><select value={fields.product_category} onChange={changeCategory}>{Object.keys(faultOptions).map(option => <option key={option}>{option}</option>)}</select></label><label className="field-row"><span>Policy</span><select value={fields.policy_id} onChange={e => set('policy_id', e.target.value)} required>{Object.entries(policies).length ? Object.entries(policies).map(([id, item]) => <option value={id} key={id}>{item.name} ({item.warranty_months} months)</option>) : <option value="">Loading policies…</option>}</select></label><label className="field-row"><span>Purchase date</span><input required type="date" value={fields.purchase_date} onChange={e => set('purchase_date', e.target.value)} /></label>
      <label className="field-row"><span>Registered serial No</span><input required value={fields.registered_serial} onChange={e => set('registered_serial', e.target.value)} placeholder="Serial registered for the product" /></label><hr /><h2><span className="section-icon">⚒</span> Fault details</h2><label className="field-row"><span>Fault description</span><select value={fields.fault_type} onChange={e => set('fault_type', e.target.value)}>{faultOptions[fields.product_category].map(option => <option key={option}>{option}</option>)}</select></label><label className="field-row"><span>Fault date</span><input required type="date" value={fields.fault_date} onChange={e => set('fault_date', e.target.value)} /></label><label className="field-row"><span>Claim date</span><input required type="date" value={fields.claim_date} onChange={e => set('claim_date', e.target.value)} /></label><label className="field-row"><span>Damage type</span><select value={fields.damage_type} onChange={e => set('damage_type', e.target.value)}><option>None</option><option>Impact</option><option>Liquid</option></select></label><label className="field-row"><span>Repair history</span><select value={fields.repair_count} onChange={e => set('repair_count', e.target.value)}><option value="0">No repairs</option><option value="1">1 repair</option><option value="2">2 repairs</option></select></label>{fields.repair_count !== '0' && <><label className="field-row"><span>Repair date</span><input required type="date" value={fields.repair_date} onChange={e => set('repair_date', e.target.value)} /></label><label className="field-row"><span>Authorized repair?</span><select value={fields.authorized_repair} onChange={e => set('authorized_repair', e.target.value)}><option value="1">Yes</option><option value="0">No</option></select></label></>}</section>
      <section className="panel form-panel"><h2><span className="section-icon">▤</span> Receipt &amp; evidence</h2><label className="upload-box"><span className="upload-icon">▤</span><strong>{file?.name || 'Upload receipt'}</strong><small>Upload a clear photo or PDF (up to 10 MB)</small><input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e => upload(e.target.files?.[0] || null)} /></label><hr /><h3>Extracted details</h3><p className="panel-subtitle">Confirm these against the receipt before submitting.</p><label className="field-row"><span>Invoice No</span><input required value={fields.invoice_number} onChange={e => set('invoice_number', e.target.value)} placeholder="INV123456789" /></label><label className="field-row"><span>Receipt serial No</span><input required value={fields.evidence_serial} onChange={e => set('evidence_serial', e.target.value)} placeholder="SN12345ABC" /></label><label className="field-row"><span>Missing documents</span><input type="number" min="0" value={fields.missing_document_count} onChange={e => set('missing_document_count', e.target.value)} /></label>{rawText && <details className="ocr-text"><summary>Show scanned text</summary><pre>{rawText}</pre></details>}<button className="solid-button full-button" type="submit" disabled={!!busy || !policies[fields.policy_id]}>{busy || 'Analyze claim →'}</button><p className="form-hint">A recommendation is saved with your claim; uncertain cases go to manual review.</p></section></form><div className="progress-line"><span>1 &nbsp; Details</span><span>→</span><span>2 &nbsp; Receipt</span><span>→</span><span>3 &nbsp; Claim Result</span></div></div>;
}
