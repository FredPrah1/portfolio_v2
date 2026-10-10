import { Link } from 'react-router-dom';

export default function Footer({ profile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            {profile ? `<${profile.full_name}/>` : '<portfolio/>'}
          </div>
          <div className="footer-links">
            <Link to="/projects">Projects</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/resume">Resume</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-social">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer"><i className="bi bi-github" /></a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><i className="bi bi-linkedin" /></a>
            )}
            {profile?.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noreferrer"><i className="bi bi-twitter-x" /></a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`}><i className="bi bi-envelope" /></a>
            )}
          </div>
        </div>
        <div className="divider" style={{ margin: '1.5rem 0' }} />
        <p className="subtle" style={{ fontSize: '.8rem', textAlign: 'center' }}>
          Built with Django, React &amp; Bootstrap Icons — {year} {profile?.full_name || ''}
        </p>
      </div>
    </footer>
  );
}
