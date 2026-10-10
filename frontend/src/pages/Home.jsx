import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';
import ProjectCard from '../components/ProjectCard';
import PostCard from '../components/PostCard';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.home().then((res) => setData(res.data)).catch(() => setData({}));
  }, []);

  useReveal([data]);

  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((bar) => {
              bar.style.width = bar.dataset.w;
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.skills-block').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  if (!data) {
    return <div className="spinner-wrap">Loading…</div>;
  }

  const { profile, featured_projects = [], skills_by_category = {}, services = [], latest_posts = [] } = data;

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '4rem 0' }}>
        <div style={{ position: 'absolute', pointerEvents: 'none', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,166,255,.07) 0%, transparent 65%)', top: -150, right: -200 }} />
        <div style={{ position: 'absolute', pointerEvents: 'none', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,185,80,.05) 0%, transparent 65%)', bottom: 0, left: -150 }} />
        <div className="container">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'center' }}>
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {profile ? (
                <>
                  {profile.availability && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--green-dim)', border: '1px solid rgba(63,185,80,.25)', color: 'var(--green)', borderRadius: 20, padding: '.3rem .9rem', fontSize: '.78rem', fontWeight: 600, marginBottom: '1.5rem', width: 'fit-content' }}>
                      <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%' }} />
                      {profile.availability}
                    </div>
                  )}
                  <h1 className="hero-name" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.05 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '.6em', display: 'block', marginBottom: '.2rem' }}>Hi, I'm</span>
                    {profile.full_name}
                  </h1>
                  {profile.title && <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 500, margin: '.75rem 0 1.25rem' }}>{profile.title}</div>}
                  {profile.tagline && <p className="hero-bio" style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 520, fontSize: '1rem' }}>{profile.tagline}</p>}

                  <div className="hero-actions" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                    <Link to="/projects" className="btn btn-primary btn-lg"><i className="bi bi-grid-3x3-gap" /> View Projects</Link>
                    <Link to="/contact" className="btn btn-outline btn-lg"><i className="bi bi-envelope" /> Get In Touch</Link>
                  </div>

                  <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.75rem' }}>
                    {profile.github_url && <SocialLink href={profile.github_url} icon="bi-github" />}
                    {profile.linkedin_url && <SocialLink href={profile.linkedin_url} icon="bi-linkedin" />}
                    {profile.twitter_url && <SocialLink href={profile.twitter_url} icon="bi-twitter-x" />}
                    {profile.email && <SocialLink href={`mailto:${profile.email}`} icon="bi-envelope" />}
                  </div>

                  {(profile.years_experience || profile.projects_count || profile.clients_count) && (
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
                      {!!profile.years_experience && <Stat num={`${profile.years_experience}+`} label="Years Exp." />}
                      {!!profile.projects_count && <Stat num={`${profile.projects_count}+`} label="Projects" />}
                      {!!profile.clients_count && <Stat num={`${profile.clients_count}+`} label="Clients" />}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h1 className="h1">Welcome to My Portfolio</h1>
                  <p className="hero-bio mt-2">Set up your profile in the Django admin to personalize this page.</p>
                </>
              )}
            </div>

            <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transitionDelay: '.15s' }}>
              <div style={{ width: 280, height: 280, borderRadius: 24, position: 'relative' }}>
                <div style={{ content: "''", position: 'absolute', inset: -2, borderRadius: 26, background: 'linear-gradient(135deg, var(--primary), var(--green))', zIndex: 0 }} />
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt={profile.full_name} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: 22, objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: 22, background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', color: 'var(--text-muted)', fontSize: '.8rem' }}>
                    <i className="bi bi-person-fill" style={{ fontSize: '3rem', color: 'var(--primary)', opacity: 0.4 }} />
                    <span>Add photo in admin</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ABOUT */}
      {profile?.bio && (
        <>
          <section className="section">
            <div className="container">
              <div className="about-grid responsive-grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
                <div className="reveal">
                  <span className="label">About Me</span>
                  <h2 className="h2 mb-3">The person behind the <span className="highlight">code</span></h2>
                  <p className="lead mb-2">{profile.bio}</p>
                  {profile.bio_extra && <p className="muted" style={{ lineHeight: 1.8 }}>{profile.bio_extra}</p>}
                  {profile.resume_file && (
                    <div className="mt-4">
                      <a href={profile.resume_file} className="btn btn-outline" download>
                        <i className="bi bi-file-earmark-person" /> Download Resume
                      </a>
                    </div>
                  )}
                </div>
                <div className="reveal skills-block" style={{ transitionDelay: '.1s' }}>
                  <span className="label">Skills</span>
                  {Object.keys(skills_by_category).length ? (
                    Object.entries(skills_by_category).map(([category, skillList]) => (
                      <div className="mb-3" key={category}>
                        <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-subtle)', marginBottom: '.75rem' }}>{category}</p>
                        {skillList.map((skill) => (
                          <div className="skill-row" key={skill.id}>
                            <div className="skill-row-top">
                              <span style={{ fontWeight: 500, fontSize: '.83rem' }}>{skill.name}</span>
                              <span className="mono" style={{ color: 'var(--primary)', fontSize: '.78rem' }}>{skill.proficiency}%</span>
                            </div>
                            <div className="skill-track"><div className="skill-fill" data-w={`${skill.proficiency}%`} /></div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="muted" style={{ fontSize: '.85rem' }}>Add skills in the admin panel.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}

      {/* SERVICES */}
      {!!services.length && (
        <>
          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <div className="text-center mb-4 reveal">
                <span className="label">What I Do</span>
                <h2 className="h2">Services I <span className="highlight">offer</span></h2>
              </div>
              <div className="grid-3">
                {services.map((s, i) => (
                  <div className="card reveal" key={s.id} style={{ padding: '1.75rem', transitionDelay: `${i * 100}ms` }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-dim)', border: '1px solid rgba(88,166,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                      <i className={s.icon} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '.5rem' }}>{s.title}</h3>
                    <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}

      {/* FEATURED PROJECTS */}
      {!!featured_projects.length && (
        <>
          <section className="section">
            <div className="container">
              <div className="flex-between mb-4 reveal">
                <div>
                  <span className="label">Portfolio</span>
                  <h2 className="h2">Featured <span className="highlight">Projects</span></h2>
                </div>
                <Link to="/projects" className="btn btn-ghost">All projects <i className="bi bi-arrow-right" /></Link>
              </div>
              <div className="grid-3">
                {featured_projects.map((p, i) => (
                  <ProjectCard project={p} delay={i * 100} key={p.id} />
                ))}
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}

      {/* LATEST POSTS */}
      {!!latest_posts.length && (
        <>
          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <div className="flex-between mb-4 reveal">
                <div>
                  <span className="label">Writing</span>
                  <h2 className="h2">Latest <span className="highlight">Posts</span></h2>
                </div>
                <Link to="/blog" className="btn btn-ghost">All posts <i className="bi bi-arrow-right" /></Link>
              </div>
              <div className="grid-3">
                {latest_posts.map((post, i) => (
                  <PostCard post={post} delay={i * 100} key={post.id} />
                ))}
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container-sm text-center reveal">
          <span className="label">Let's Connect</span>
          <h2 className="h2 mb-2">Have a project in <span className="highlight">mind?</span></h2>
          <p className="lead mb-4">I'm always open to interesting work, collaborations, or just a good tech conversation.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary btn-lg"><i className="bi bi-send" /> Get in Touch</Link>
            {profile?.resume_file && (
              <a href={profile.resume_file} className="btn btn-outline btn-lg" download><i className="bi bi-download" /> Download CV</a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function SocialLink({ href, icon }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1rem' }}>
      <i className={`bi ${icon}`} />
    </a>
  );
}

function Stat({ num, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{num}</div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
    </div>
  );
}
