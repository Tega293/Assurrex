import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, editProfile, getProfile } from '../api/client';
import { Notice } from '../components/ClaimUI';

export default function Profile({ member, onProfileUpdated, onPasswordChanged }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(member?.username || '');
  const [displayName, setDisplayName] = useState(member?.display_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProfile().then(profile => {
      setUsername(profile.username);
      setDisplayName(profile.display_name);
    }).catch(err => setError(err.message));
  }, []);

  async function saveDetails(event) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const result = await editProfile({ username: username.trim(), display_name: displayName.trim(), current_password: currentPassword });
      onProfileUpdated(result);
      setCurrentPassword('');
      setMessage('Profile saved. Your updated name is shown throughout AssureX.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function savePassword(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
    setBusy(true);
    try {
      await changePassword({ current_password: oldPassword, new_password: newPassword });
      onPasswordChanged();
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="member-page profile-page">
    <div className="page-heading"><h1>My profile</h1><p>Manage the name shown on your account and your sign-in details.</p></div>
    <Notice>{error}</Notice><Notice kind="success">{message}</Notice>
    <div className="profile-grid">
      <section className="panel"><h2>Account details</h2><p className="panel-subtitle">These details belong to your account only.</p>
        <form onSubmit={saveDetails} className="profile-form">
          <label>Display name<input required minLength={2} maxLength={80} autoComplete="name" value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
          <label>Username<input required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label>
          <label>Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
          <button className="solid-button" disabled={busy} type="submit">Save profile</button>
        </form>
      </section>
      <section className="panel"><h2>Change password</h2><p className="panel-subtitle">You will sign in again after updating your password.</p>
        <form onSubmit={savePassword} className="profile-form">
          <label>Current password<input required type="password" autoComplete="current-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} /></label>
          <label>New password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
          <label>Confirm new password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>
          <button className="solid-button" disabled={busy} type="submit">Change password</button>
        </form>
      </section>
    </div>
  </div>;
}
