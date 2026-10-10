import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ profile }) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <NavLink to="/" className="nav-brand">
            <i className="bi bi-terminal-fill nav-brand-dot" />
            {profile?.full_name || 'Portfolio'}
          </NavLink>

          <div className="nav-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              type="button"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
            </button>
            {profile?.resume_file && (
              <a href={profile.resume_file} className="btn btn-primary btn-sm" download>
                <i className="bi bi-download" /> CV
              </a>
            )}
            <button
              className="nav-hamburger"
              onClick={() => setOpen((o) => !o)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              type="button"
            >
              <i className="bi bi-list" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-mobile ${open ? 'open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
