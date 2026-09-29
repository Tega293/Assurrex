import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaims } from '../api/client';
import { ClaimRows, Empty, Notice, StatCard } from '../components/ClaimUI';

export default function Dashboard({ member }) {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { getClaims().then(setClaims).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const count = name => claims.filter(c => c.final_recommendation === name).length;
  return <div className="member-page"><div className="page-heading"><div><h1>Welcome, {member?.display_name || member?.username}</h1><p>Your claim activity at a glance.</p></div></div><Notice>{error}</Notice>
    <div className="stats-grid"><StatCard icon="▤" label="Total claims" value={loading ? '—' : claims.length} /><StatCard icon="✓" tone="green" label="Valid" value={loading ? '—' : count('Valid Claim')} /><StatCard icon="◷" tone="amber" label="Manual Review" value={loading ? '—' : count('Manual Review')} /><StatCard icon="▤" label="Pending reviews" value={loading ? '—' : claims.filter(c => c.review_status === 'Pending').length} /></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-title"><h2>Recent claims</h2><Link to="/claim-history" className="table-link">View all claims →</Link></div>{loading ? <p>Loading claims…</p> : claims.length ? <ClaimRows claims={claims.slice(0, 5)} compact /> : <Empty title="No claims yet" description="Submit the first claim to see it here." />}</section>
    <aside className="side-stack"><section className="panel"><h2>Quick actions</h2><Link to="/new-claim" className="solid-button">▤ &nbsp; New claim →</Link><Link to="/review-dashboard" className="inline-action">⌕ &nbsp; Review pending claims →</Link></section><section className="panel"><h2>System tools</h2><div className="tool-row"><span>✓</span> Python model <small>Connected to claim analysis</small></div><div className="tool-row"><span>✓</span> GTM model <small>Claim card scoring</small></div><div className="tool-row"><span>✓</span> Receipt scanner <small>OCR upload available</small></div></section></aside></div>
  </div>;
}
