import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  ['/', 'Home'], ['/dashboard', 'Dashboard'], ['/new-claim', 'New Claim'],
  ['/claim-history', 'Claim History'], ['/review-dashboard', 'Review Dashboard'], ['/reports', 'Reports'], ['/profile', 'Profile'],
];
export default function Header({ member, theme, onToggleTheme, onSignOut }) {
  const navigate = useNavigate();
  async function leave() { try { await onSignOut(); navigate('/'); } catch { /* Session may be offline; UI has signed out. */ navigate('/'); } }
  return <header className="member-header">
    <NavLink to="/" className="brand">ASSURE<span>X</span></NavLink>
    <nav className="member-links" aria-label="Member navigation">
      {links.map(([path, name]) => <NavLink key={path} end to={path}>{name}</NavLink>)}
    </nav>
    <div className="header-actions">
      <span className="member-name" title={member?.username}>Hi, {member?.display_name || member?.username}</span>
      <button className="theme-button" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title="Toggle theme">{theme === 'light' ? '☾' : '☀'}</button>
      <button type="button" className="outline-button" onClick={leave}>Sign out</button>
    </div>
  </header>;
}
