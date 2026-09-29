import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/client';
import { Notice } from '../components/ClaimUI';

export default function SignUp() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await register(displayName.trim(), username.trim(), password);
      navigate('/login', { replace: true, state: { registeredUsername: result.username } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="login-page">
    <div className="login-card">
      <Link to="/" className="brand">ASSURE<span>X</span></Link>
      <h1>Create a member account</h1>
      <p>Join AssureX to submit claims and review results.</p>
      <Notice>{error}</Notice>
      <form onSubmit={submit}>
        <label>Your name
          <input required minLength={2} maxLength={80} autoComplete="name" value={displayName} onChange={event => setDisplayName(event.target.value)} />
        </label>
        <label>Username
          <input required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+"
            title="Use 3–32 letters, numbers, or underscores" autoComplete="username"
            value={username} onChange={event => setUsername(event.target.value)} />
        </label>
        <label>Password
          <input required type="password" minLength={8} maxLength={128} autoComplete="new-password"
            value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        <label>Confirm password
          <input required type="password" minLength={8} maxLength={128} autoComplete="new-password"
            value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
        </label>
        <button className="solid-button" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
      <p className="account-switch">Already have an account? <Link to="/login" className="table-link">Sign in</Link></p>
      <Link to="/" className="table-link">← Back to homepage</Link>
    </div>
    <aside className="login-aside">
      <h2>A clearer claim journey.</h2>
      <p>Scan a receipt, confirm the extracted details, see an explained recommendation, and get human review when needed.</p>
      <div className="signup-feature">▤ &nbsp; Receipt scanning</div>
      <div className="signup-feature">◇ &nbsp; Policy checks</div>
      <div className="signup-feature">✓ &nbsp; Review decisions</div>
    </aside>
  </div>;
}
