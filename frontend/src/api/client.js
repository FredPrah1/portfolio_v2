import axios from 'axios';

// Point this at your Django backend. Override with a .env file:
//   VITE_API_URL=http://127.0.0.1:8000
export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const api = {
  home: () => client.get('/home/'),
  profile: () => client.get('/profile/'),
  resume: () => client.get('/resume/'),

  projects: (catSlug) => client.get('/projects/', { params: catSlug ? { cat: catSlug } : {} }),
  project: (slug) => client.get(`/projects/${slug}/`),
  relatedProjects: (slug) => client.get(`/projects/${slug}/related/`),

  blogPosts: (catSlug) => client.get('/blog/', { params: catSlug ? { cat: catSlug } : {} }),
  blogPost: (slug) => client.get(`/blog/${slug}/`),
  relatedPosts: (slug) => client.get(`/blog/${slug}/related/`),

  categories: () => client.get('/categories/'),

  sendContact: (payload) => client.post('/contact/', payload),
  sendChat: (payload) => client.post('/chat/', payload),
};

export default client;
