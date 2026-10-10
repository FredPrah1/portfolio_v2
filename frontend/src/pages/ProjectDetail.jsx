import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';

const statusBadge = { completed: 'badge-green', in_progress: 'badge-orange', archived: 'badge-gray' };

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProject(null);
    setNotFound(false);
    api.project(slug).then((res) => setProject(res.data)).catch(() => setNotFound(true));
    api.relatedProjects(slug).then((res) => setRelated(res.data)).catch(() => setRelated([]));
  }, [slug]);

  useReveal([project]);

  if (notFound) {
    return (
      <section className="section-sm">
        <div className="container text-center">
          <h2 className="h2">Project not found</h2>
          <Link to="/projects" className="btn btn-outline mt-3"><i className="bi bi-arrow-left" /> All Projects</Link>
        </div>
      </section>
    );
  }

  if (!project) return <div className="spinner-wrap">Loading…</div>;

  return (
    <>
      <div style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <ol className="flex-gap" style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
            <li style={{ color: 'var(--border)' }}>/</li>
            <li><Link to="/projects" style={{ color: 'var(--text-muted)' }}>Projects</Link></li>
            <li style={{ color: 'var(--border)' }}>/</li>
            <li style={{ color: 'var(--text)' }}>{project.title}</li>
          </ol>
          <div className="flex-gap">
            <h1 className="h1" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>{project.title}</h1>
            <span className={`badge ${statusBadge[project.status] || 'badge-gray'}`} style={{ fontSize: '.8rem' }}>{project.status_display}</span>
            {project.featured && <span className="badge badge-blue">Featured</span>}
          </div>
          {project.short_description && <p className="lead mt-2">{project.short_description}</p>}
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }} className="detail-grid">
            <div>
              {project.image ? (
                <img src={project.image} alt={project.title} className="mb-3" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', maxHeight: 440, objectFit: 'cover' }} />
              ) : (
                <div className="mb-3" style={{ width: '100%', height: 320, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-window-stack" style={{ fontSize: '3rem', color: 'var(--text-subtle)', opacity: 0.3 }} />
                </div>
              )}

              <div style={{ color: 'var(--text)', lineHeight: 1.85 }}>
                {project.description.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
                ))}
              </div>

              {!!project.tech_list?.length && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-subtle)', marginBottom: '.6rem' }}>Tech Stack</p>
                  <div className="flex-gap">
                    {project.tech_list.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div>
              {(project.github_url || project.live_url) && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-subtle)', marginBottom: '.75rem' }}>Links</p>
                  {project.github_url && <LinkRow href={project.github_url} icon="bi-github" label="View on GitHub" />}
                  {project.live_url && <LinkRow href={project.live_url} icon="bi-box-arrow-up-right" label="Live Demo" />}
                </div>
              )}

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-subtle)', marginBottom: '.75rem' }}>Details</p>
                <SidebarRow k="Status" v={project.status_display} />
                {project.category && <SidebarRow k="Category" v={project.category.name} />}
                <SidebarRow k="Added" v={new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} last />
              </div>

              <Link to="/projects" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                <i className="bi bi-arrow-left" /> All Projects
              </Link>
            </div>
          </div>

          {!!related.length && (
            <>
              <div className="divider" style={{ margin: '3rem 0 2rem' }} />
              <h3 className="h3 mb-3">More Projects</h3>
              <div className="grid-3">
                {related.map((p, i) => (
                  <div className="card reveal" key={p.id} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="card-body">
                      <div className="mb-2" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{p.title}</div>
                      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{p.short_description}</p>
                      <Link to={`/projects/${p.slug}`} className="btn btn-outline btn-sm">View Project</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function LinkRow({ href, icon, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.7rem .9rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: '.85rem', fontWeight: 500, marginBottom: '.5rem' }}>
      <i className={`bi ${icon}`} style={{ fontSize: '1.1rem' }} /> {label}
    </a>
  );
}

function SidebarRow({ k, v, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : '1.1rem' }}>
      <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-subtle)', marginBottom: '.3rem' }}>{k}</div>
      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{v}</div>
    </div>
  );
}
