import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    api.blogPost(slug).then((res) => setPost(res.data)).catch(() => setNotFound(true));
    api.relatedPosts(slug).then((res) => setRelated(res.data)).catch(() => setRelated([]));
    api.profile().then((res) => setProfile(res.data)).catch(() => {});
  }, [slug]);

  useReveal([post]);

  if (notFound) {
    return (
      <section className="section-sm">
        <div className="container text-center">
          <h2 className="h2">Post not found</h2>
          <Link to="/blog" className="btn btn-outline mt-3"><i className="bi bi-arrow-left" /> All Posts</Link>
        </div>
      </section>
    );
  }

  if (!post) return <div className="spinner-wrap">Loading…</div>;

  return (
    <>
      <div style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container-sm">
          <ol className="flex-gap" style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
            <li style={{ color: 'var(--border)' }}>/</li>
            <li><Link to="/blog" style={{ color: 'var(--text-muted)' }}>Blog</Link></li>
            <li style={{ color: 'var(--border)' }}>/</li>
            <li style={{ color: 'var(--text)' }}>{post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title}</li>
          </ol>
          <div className="flex-gap mb-3">
            {post.category && <span className="badge badge-blue">{post.category.name}</span>}
            <span style={{ fontSize: '.8rem', color: 'var(--text-subtle)' }}>
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-subtle)' }}>· {post.reading_time}</span>
          </div>
          <h1 className="h1" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>{post.title}</h1>
          <p className="lead mt-2">{post.excerpt}</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container-sm">
          {post.cover && (
            <img src={post.cover} alt={post.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '2.5rem' }} />
          )}
          <div className="post-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <div className="divider" style={{ margin: '3rem 0' }} />
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '.75rem' }}>
            <Link to="/blog" className="btn btn-outline"><i className="bi bi-arrow-left" /> All Posts</Link>
            {profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>
                Written by <strong style={{ color: 'var(--text)' }}>{profile.full_name}</strong>
              </div>
            )}
          </div>

          {!!related.length && (
            <>
              <div className="divider" style={{ margin: '3rem 0 2rem' }} />
              <h3 className="h3 mb-3">More Posts</h3>
              <div className="grid-3">
                {related.map((p, i) => (
                  <Link to={`/blog/${p.slug}`} className="card reveal" key={p.id} style={{ textDecoration: 'none', color: 'inherit', transitionDelay: `${i * 100}ms` }}>
                    <div className="card-body">
                      <div style={{ fontSize: '.72rem', color: 'var(--text-subtle)', marginBottom: '.4rem' }}>
                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {p.reading_time}
                      </div>
                      <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.4rem' }}>{p.title}</div>
                      <p style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        .post-content { color: var(--text); line-height: 1.9; font-size: 1.05rem; }
        .post-content h1, .post-content h2, .post-content h3 { color: var(--text); margin: 2rem 0 .75rem; font-weight: 700; }
        .post-content h2 { font-size: 1.4rem; }
        .post-content h3 { font-size: 1.15rem; }
        .post-content p { margin-bottom: 1.25rem; }
        .post-content a { color: var(--primary); }
        .post-content ul, .post-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .post-content li { margin-bottom: .4rem; }
        .post-content code { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: .15rem .4rem; font-family: 'JetBrains Mono', monospace; font-size: .88em; color: var(--primary); }
        .post-content pre { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; overflow-x: auto; margin-bottom: 1.5rem; }
        .post-content pre code { background: none; border: none; padding: 0; font-size: .88rem; color: var(--text); }
        .post-content blockquote { border-left: 3px solid var(--primary); padding-left: 1.25rem; color: var(--text-muted); font-style: italic; margin: 1.5rem 0; }
        .post-content img { border-radius: 10px; border: 1px solid var(--border); margin: 1.5rem 0; }
      `}</style>
    </>
  );
}
