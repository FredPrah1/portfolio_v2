import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { api } from './api/client';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Resume from './pages/Resume';
import Contact from './pages/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ profile }) {
  return (
    <>
      <Navbar profile={profile} />
      <div className="page-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer profile={profile} />
      <Chatbot profile={profile} />
    </>
  );
}

function NotFound() {
  return (
    <section className="section-sm">
      <div className="container text-center">
        <span className="label">404</span>
        <h2 className="h2">Page not found</h2>
        <p className="lead mt-2">The page you're looking for doesn't exist.</p>
      </div>
    </section>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.profile().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout profile={profile} />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
