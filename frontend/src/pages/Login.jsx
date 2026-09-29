import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import { Notice } from '../components/ClaimUI';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.registeredUsername || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await login(username.trim(), password);
      onLogin(result);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="login-page"><div className="login-card"><Link to="/" className="brand">ASSURE<span>X</span></Link><h1>Member sign in</h1><p>Sign in to submit claims and review results.</p><Notice kind="success">{location.state?.passwordChanged ? 'Password changed. Sign in with your new password.' : location.state?.registeredUsername ? 'Account created. Sign in with your new details.' : ''}</Notice><Notice>{error}</Notice><form onSubmit={submit}><label>Username<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label><button type="submit" className="solid-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button></form><p className="account-switch">New to AssureX? <Link className="table-link" to="/sign-up">Create an account</Link></p><Link to="/" className="table-link">← Back to homepage</Link></div><aside className="login-aside"><h2>Make claim decisions clearer.</h2><p>Check documents, compare model recommendations, and record human reviews in one place.</p></aside></div>;
}
