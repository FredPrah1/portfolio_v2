import { Link } from 'react-router-dom';

const statusBadge = { completed: 'badge-green', in_progress: 'badge-orange', archived: 'badge-gray' };

export default function ProjectCard({ project, delay = 0 }) {
  return (
    <div className="card proj-card reveal" style={{ transitionDelay: `${delay}ms` }}>
      <div className="proj-img" style={{ height: 190, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {project.image ? (
          <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <i className="bi bi-window-stack" style={{ fontSize: '2.5rem', color: 'var(--text-subtle)', opacity: 0.4 }} />
        )}
        {project.featured && (
          <span className="badge badge-blue" style={{ position: 'absolute', top: '.75rem', right: '.75rem' }}>Featured</span>
        )}
      </div>
      <div className="proj-body" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between mb-2">
          <div className="proj-title" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{project.title}</div>
          <span className={`badge ${statusBadge[project.status] || 'badge-gray'}`}>{project.status_display}</span>
        </div>
        <p className="proj-desc" style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '.85rem' }}>
          {project.short_description}
        </p>
        <div className="proj-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '1rem' }}>
          {project.tech_list?.map((tech) => (
            <span key={tech} className="badge badge-blue">{tech}</span>
          ))}
        </div>
        <div className="proj-links" style={{ display: 'flex', gap: '.5rem', marginTop: 'auto' }}>
          <Link to={`/projects/${project.slug}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Details</Link>
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><i className="bi bi-github" /></a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><i className="bi bi-box-arrow-up-right" /></a>
          )}
        </div>
      </div>
    </div>
  );
}
