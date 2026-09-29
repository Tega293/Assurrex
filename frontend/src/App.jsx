import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout } from './api/client';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import NewClaim from './pages/NewClaim';
import ClaimResult from './pages/ClaimResult';
import ClaimHistory from './pages/ClaimHistory';
import ReviewDashboard from './pages/ReviewDashboard';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './styles/main.css';

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('assurex_theme') || 'light');
  const publicPage = ['/', '/login', '/sign-up'].includes(location.pathname);

  useEffect(() => {
    let alive = true;
    getSession().then(data => { if (alive) setMember(data); })
      .catch(() => { if (alive) setMember(null); })
      .finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('assurex_theme', theme);
  }, [theme]);

  useEffect(() => {
    const reset = () => {
      sessionStorage.removeItem('assurex_account_id');
      setMember(null);
      navigate('/login', { replace: true });
    };
    const onStorage = event => {
      if (event.key !== 'assurex_auth_event') return;
      const next = JSON.parse(event.newValue || '{}');
      if (String(next.id) !== sessionStorage.getItem('assurex_account_id')) reset();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('assurex:account-changed', reset);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('assurex:account-changed', reset);
    };
  }, [navigate]);

  async function signOut() {
    try { await logout(); }
    finally { setMember(null); }
  }
  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light');
  const protectedPage = component => checking ? <div className="loading-state">Checking member session…</div> : member ? component : <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="app-shell">
      {!publicPage && !!member && <Header member={member} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />}
      <main key={member?.id ?? 'signed-out'} className={publicPage ? 'public-main' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} member={member} />} />
          <Route path="/login" element={checking ? <div className="loading-state">Checking member session…</div> : member ? <Navigate to="/dashboard" replace /> : <Login onLogin={setMember} />} />
          <Route path="/dashboard" element={protectedPage(<Dashboard member={member} />)} />
          <Route path="/profile" element={protectedPage(<Profile member={member} onProfileUpdated={setMember} onPasswordChanged={() => setMember(null)} />)} />
          <Route path="/new-claim" element={protectedPage(<NewClaim />)} />
          <Route path="/claim-result" element={protectedPage(<ClaimResult />)} />
          <Route path="/claims/:id" element={protectedPage(<ClaimResult />)} />
          <Route path="/claim-history" element={protectedPage(<ClaimHistory />)} />
          <Route path="/review-dashboard" element={protectedPage(<ReviewDashboard />)} />
          <Route path="/reports" element={protectedPage(<Reports />)} />
          <Route path="/sign-up" element={checking ? <div className="loading-state">Checking member session…</div> : member ? <Navigate to="/dashboard" replace /> : <SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
export default function App() { return <BrowserRouter><Shell /></BrowserRouter>; }
