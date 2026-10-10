import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';
  const [projects, setProjects] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setProjects(null);
    api.projects(activeCat).then((res) => setProjects(res.data)).catch(() => setProjects([]));
  }, [activeCat]);

  useReveal([projects]);

  const projectCategories = categories; // categories endpoint returns all; fine for filter chips

  return (
    <>
      <div className="page-hero" style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span className="label">Work</span>
          <h1 className="h1">My <span className="highlight">Projects</span></h1>
          <p className="lead mt-2" style={{ maxWidth: 500 }}>Things I've built — from side projects to production-grade applications.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          {!!projectCategories.length && (
            <div className="flex-gap" style={{ marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginRight: '.25rem' }}>Filter:</span>
              <FilterBtn active={!activeCat} onClick={() => setSearchParams({})}>All</FilterBtn>
              {projectCategories.map((cat) => (
                <FilterBtn key={cat.id} active={activeCat === cat.slug} onClick={() => setSearchParams({ cat: cat.slug })}>
                  {cat.name}
                </FilterBtn>
              ))}
            </div>
          )}

          {projects === null ? (
            <div className="spinner-wrap">Loading…</div>
          ) : projects.length ? (
            <>
              <p className="mono" style={{ fontSize: '.82rem', color: 'var(--text-subtle)', marginBottom: '1.5rem' }}>
                {projects.length} project{projects.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid-3">
                {projects.map((p, i) => (
                  <ProjectCard project={p} delay={i * 10} key={p.id} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <i className="bi bi-folder2-open" style={{ fontSize: '3.5rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
              <h5>No projects found</h5>
              <p>{activeCat ? <>No projects in this category. <Link to="/projects">Clear filter</Link></> : 'Add projects from the admin panel.'}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="filter-btn"
      style={{
        padding: '.35rem 1rem', borderRadius: 20, fontSize: '.8rem', fontWeight: 500,
        border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .2s',
        background: active ? 'var(--primary-dim)' : 'transparent',
        borderColor: active ? 'var(--primary)' : 'var(--border)',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
      }}
    >
      {children}
    </button>
  );
}
