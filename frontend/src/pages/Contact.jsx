import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';
import { useToast } from '../context/ToastContext';

const initialForm = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.profile().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  useReveal([profile]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    try {
      const { data } = await api.sendContact(form);
      showToast(data.detail || "Message sent! I'll get back to you soon.");
      setForm(initialForm);
    } catch (err) {
      const resErrors = err.response?.data?.errors;
      if (resErrors) {
        const flat = {};
        Object.entries(resErrors).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(flat);
        showToast('Please fix the errors below.', 'error');
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span className="label">Contact</span>
          <h1 className="h1">Let's <span className="highlight">Talk</span></h1>
          <p className="lead mt-2">Have a project, opportunity, or just want to say hi? I'd love to hear from you.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div className="contact-grid responsive-grid-2" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '4rem', alignItems: 'start' }}>
            <div className="reveal">
              <h3 className="h3 mb-3">Get in Touch</h3>
              {profile ? (
                <>
                  {profile.email && <InfoItem icon="bi-envelope" k="Email"><a href={`mailto:${profile.email}`}>{profile.email}</a></InfoItem>}
                  {profile.location && <InfoItem icon="bi-geo-alt" k="Location">{profile.location}</InfoItem>}
                  {profile.availability && <InfoItem icon="bi-calendar-check" k="Availability"><span style={{ color: 'var(--green)' }}>{profile.availability}</span></InfoItem>}
                </>
              ) : (
                <p className="muted" style={{ fontSize: '.875rem' }}>Add your contact info in the admin panel.</p>
              )}

              {profile && (
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.5rem' }}>
                  {profile.github_url && <SocialBtn href={profile.github_url} icon="bi-github" />}
                  {profile.linkedin_url && <SocialBtn href={profile.linkedin_url} icon="bi-linkedin" />}
                  {profile.twitter_url && <SocialBtn href={profile.twitter_url} icon="bi-twitter-x" />}
                </div>
              )}
            </div>

            <div className="reveal" style={{ transitionDelay: '.1s' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '2rem' }}>
                <h3 className="h3 mb-3" style={{ fontSize: '1.1rem' }}>Send a Message</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Name</label>
                      <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="form-input" placeholder="Your Name" />
                      {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@email.com" />
                      {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input id="subject" name="subject" type="text" value={form.subject} onChange={handleChange} className="form-input" placeholder="What's this about?" />
                    {errors.subject && <div className="form-error">{errors.subject}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Message</label>
                    <textarea id="message" name="message" value={form.message} onChange={handleChange} className="form-input" placeholder="Tell me about your project..." />
                    {errors.message && <div className="form-error">{errors.message}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '.75rem' }} disabled={sending}>
                    <i className="bi bi-send" /> {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoItem({ icon, k, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: '.75rem' }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-dim)', border: '1px solid rgba(88,166,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--primary)', flexShrink: 0 }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-subtle)', marginBottom: '.2rem' }}>{k}</div>
        <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{children}</div>
      </div>
    </div>
  );
}

function SocialBtn({ href, icon }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
      <i className={`bi ${icon}`} />
    </a>
  );
}
