import { claimCode } from '../api/format';
import { useEffect, useMemo, useState } from 'react';
import { getClaims } from '../api/client';
import { ClaimRows, Empty, Notice, StatCard } from '../components/ClaimUI';

export default function ClaimHistory() {
  const [claims, setClaims] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [order, setOrder] = useState('Newest first');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { getClaims().then(setClaims).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => claims.filter(c => `${claimCode(c.id)} ${c.id} ${c.invoice_number}`.toLowerCase().includes(query.toLowerCase().trim()) && (status === 'All statuses' || c.final_recommendation === status)).sort((a,b) => order === 'Newest first' ? b.id-a.id : a.id-b.id), [claims, query, status, order]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
  const currentPage = Math.min(page, totalPages);
  const shown = filtered.slice((currentPage-1)*5,currentPage*5);
  return <div className="member-page"><div className="history-top"><div className="page-heading"><h1>Claim history</h1><p>Search past claims, check their status, and view the results.</p></div><div className="history-stats"><StatCard icon="▤" label="All statuses" value={loading?'—':claims.length} /><StatCard icon="✓" tone="green" label="Valid" value={loading?'—':claims.filter(c => c.final_recommendation === 'Valid Claim').length} /><StatCard icon="×" tone="red" label="Invalid" value={loading?'—':claims.filter(c => c.final_recommendation === 'Invalid Claim').length} /><StatCard icon="◷" tone="amber" label="Manual Review" value={loading?'—':claims.filter(c => c.final_recommendation === 'Manual Review').length} /></div></div><Notice>{error}</Notice><div className="filter-panel"><label className="search-field"><span>⌕</span><input placeholder="Search by claim ID or invoice" aria-label="Search by claim ID or invoice" value={query} onChange={e => {setQuery(e.target.value);setPage(1);}} /></label><select aria-label="Filter by recommendation" value={status} onChange={e => {setStatus(e.target.value);setPage(1);}}><option>All statuses</option><option>Valid Claim</option><option>Invalid Claim</option><option>Manual Review</option></select><select aria-label="Sort claims" value={order} onChange={e => setOrder(e.target.value)}><option>Newest first</option><option>Oldest first</option></select></div><section className="panel table-panel">{loading?<p>Loading claims…</p>:shown.length?<ClaimRows claims={shown} />:<Empty title="No matching claims" description="Try another search or submit a new claim." />}<div className="table-footer"><small>Showing {shown.length ? (currentPage-1)*5+1 : 0}–{(currentPage-1)*5+shown.length} of {filtered.length} claims</small><div className="pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage-1)}>‹</button>{Array.from({length:totalPages},(_,i)=><button key={i} className={currentPage === i+1?'selected':''} onClick={() => setPage(i+1)}>{i+1}</button>)}<button disabled={currentPage === totalPages} onClick={() => setPage(currentPage+1)}>›</button></div></div></section></div>;
}
