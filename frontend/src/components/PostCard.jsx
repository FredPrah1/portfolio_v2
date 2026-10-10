import { Link } from 'react-router-dom';

export default function PostCard({ post, delay = 0 }) {
  return (
    <Link to={`/blog/${post.slug}`} className="reveal" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%', transitionDelay: `${delay}ms` }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 180, overflow: 'hidden', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {post.cover ? (
            <img src={post.cover} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <i className="bi bi-journal-text" style={{ fontSize: '2rem', color: 'var(--text-subtle)', opacity: 0.3 }} />
          )}
        </div>
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="flex-gap" style={{ fontSize: '.75rem', color: 'var(--text-subtle)', marginBottom: '.5rem' }}>
            {post.category && <span className="badge badge-blue">{post.category.name}</span>}
            <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>· {post.reading_time}</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.5rem', lineHeight: 1.4 }}>{post.title}</div>
          <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.65, flex: 1 }}>{post.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
