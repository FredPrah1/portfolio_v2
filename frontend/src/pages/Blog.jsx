import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';
import PostCard from '../components/PostCard';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';
  const [posts, setPosts] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setPosts(null);
    api.blogPosts(activeCat).then((res) => setPosts(res.data)).catch(() => setPosts([]));
  }, [activeCat]);

  useReveal([posts]);

  return (
    <>
      <div style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span className="label">Writing</span>
          <h1 className="h1">The <span className="highlight">Blog</span></h1>
          <p className="lead mt-2">Thoughts, tutorials, and notes on building software.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          {!!categories.length && (
            <div className="flex-gap" style={{ marginBottom: '2rem' }}>
              <FilterBtn active={!activeCat} onClick={() => setSearchParams({})}>All</FilterBtn>
              {categories.map((cat) => (
                <FilterBtn key={cat.id} active={activeCat === cat.slug} onClick={() => setSearchParams({ cat: cat.slug })}>
                  {cat.name}
                </FilterBtn>
              ))}
            </div>
          )}

          {posts === null ? (
            <div className="spinner-wrap">Loading…</div>
          ) : posts.length ? (
            <div className="post-grid grid-3">
              {posts.map((post, i) => (
                <PostCard post={post} delay={i * 10} key={post.id} />
              ))}
            </div>
          ) : (
            <div className="empty" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <i className="bi bi-journal-x" style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }} />
              <h5>No posts yet</h5>
              <p>{activeCat ? <>No posts in this category. <Link to="/blog">Show all</Link></> : 'Check back soon — posts coming!'}</p>
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
