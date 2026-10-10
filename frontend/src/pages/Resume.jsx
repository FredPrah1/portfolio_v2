import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';

export default function Resume() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.resume().then((res) => setData(res.data)).catch(() => setData({}));
    api.profile().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  useReveal([data]);

  if (!data) return <div className="spinner-wrap">Loading…</div>;

  const { experiences = [], educations = [], skills = [], services = [] } = data;

  const skillsGrouped = {};
  skills.forEach((s) => {
    const key = s.category_display;
    skillsGrouped[key] = skillsGrouped[key] || [];
    skillsGrouped[key].push(s);
  });

  return (
    <>
      <div style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="label">Resume</span>
              <h1 className="h1">{profile?.full_name || 'Resume'}</h1>
              {profile?.title && <p className="lead mt-1">{profile.title}</p>}
            </div>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              {profile?.resume_file && (
                <a href={profile.resume_file} className="btn btn-primary" download>
                  <i className="bi bi-download" /> Download PDF
                </a>
              )}
              <button onClick={() => window.print()} className="btn btn-outline" type="button">
                <i className="bi bi-printer" /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', alignItems: 'start' }} className="responsive-grid-2">
            <div>
              {!!experiences.length && (
                <div className="mb-4 reveal">
                  <SectionTitle>Work Experience</SectionTitle>
                  <div className="timeline">
                    {experiences.map((exp) => (
                      <TimelineItem
                        key={exp.id}
                        title={exp.role}
                        sub={`${exp.company}${exp.location ? ` · ${exp.location}` : ''}`}
                        period={exp.period}
                        body={exp.description}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!!educations.length && (
                <div className="mb-4 reveal">
                  <SectionTitle>Education</SectionTitle>
                  <div className="timeline">
                    {educations.map((edu) => (
                      <TimelineItem
                        key={edu.id}
                        title={`${edu.degree}${edu.field ? ` — ${edu.field}` : ''}`}
                        sub={edu.institution}
                        period={edu.period}
                        body={edu.description}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!experiences.length && !educations.length && (
                <p className="muted">Add experience and education from the admin panel.</p>
              )}
            </div>

            <div>
              {!!skills.length && (
                <div className="mb-4 reveal">
                  <SectionTitle>Skills</SectionTitle>
                  {Object.entries(skillsGrouped).map(([group, list]) => (
                    <div key={group} style={{ marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-subtle)', marginBottom: '.5rem' }}>{group}</p>
                      <div className="flex-gap" style={{ gap: '.4rem' }}>
                        {list.map((s) => <span key={s.id} className="badge badge-blue">{s.name}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profile && (
                <div className="mb-4 reveal">
                  <SectionTitle>Contact</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.875rem' }}>
                    {profile.email && <div><i className="bi bi-envelope" style={{ color: 'var(--primary)', marginRight: '.4rem' }} /><a href={`mailto:${profile.email}`}>{profile.email}</a></div>}
                    {profile.location && <div><i className="bi bi-geo-alt" style={{ color: 'var(--primary)', marginRight: '.4rem' }} />{profile.location}</div>}
                    {profile.github_url && <div><i className="bi bi-github" style={{ color: 'var(--primary)', marginRight: '.4rem' }} /><a href={profile.github_url} target="_blank" rel="noreferrer">GitHub</a></div>}
                    {profile.linkedin_url && <div><i className="bi bi-linkedin" style={{ color: 'var(--primary)', marginRight: '.4rem' }} /><a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></div>}
                  </div>
                </div>
              )}

              {!!services.length && (
                <div className="mb-4 reveal">
                  <SectionTitle>Services</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {services.map((s) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.875rem' }}>
                        <i className={s.icon} style={{ color: 'var(--primary)' }} />
                        <span>{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .timeline { position: relative; padding-left: 1.75rem; }
        .timeline::before { content: ''; position: absolute; left: 0; top: 4px; bottom: 0; width: 2px; background: var(--border); border-radius: 1px; }
        .timeline-item { position: relative; margin-bottom: 2rem; }
        .timeline-item::before { content: ''; position: absolute; left: -1.875rem; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--primary); border: 2px solid var(--bg); box-shadow: 0 0 0 2px var(--primary); }
        @media print {
          .navbar, .footer, .chat-bubble, .chat-panel, .toast-wrap { display: none !important; }
          .page-wrap { padding-top: 0; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text-subtle)', marginBottom: '1.25rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

function TimelineItem({ title, sub, period, body }) {
  return (
    <div className="timeline-item">
      <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.3rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: '.875rem', color: 'var(--primary)', fontWeight: 500 }}>{sub}</div>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.75rem', color: 'var(--text-subtle)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
          {period}
        </span>
      </div>
      {body && <div style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '.4rem' }}>{body}</div>}
    </div>
  );
}
