# 🚀 Personal Developer Portfolio — Django REST API + React Frontend

This project was converted from a server-rendered Django app into a **decoupled full-stack app**:

- **Backend** (`/portfolio_v2`) — Django 4.2 + Django REST Framework, serving a JSON API. Still admin-driven — same models, same admin panel.
- **Frontend** (`/portfolio_v2/frontend`) — React 19 (Vite) + React Router, consuming the API. Same visual design as the original (dark/light GitHub-style theme, same layout, chatbot widget, etc.), rebuilt as components.

The old server-rendered Django templates (`portfolio/templates/`) and views (`portfolio/views.py`, `portfolio/urls.py`) are **left in place and still work** if you want to keep the classic version running side-by-side — the new API lives alongside it under `/api/`.

---

## 🏁 Quick Start

### 1. Backend (Django API)

```bash
cd portfolio_v2
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # fill in SECRET_KEY, GEMINI_API_KEY, etc.

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver         # http://127.0.0.1:8000
```

Visit `http://127.0.0.1:8000/admin/` to manage all content (profile, skills, projects, blog posts, etc.) — same as before.

The JSON API is now available under `http://127.0.0.1:8000/api/`:

| Endpoint | Description |
|---|---|
| `GET /api/home/` | Aggregated homepage data (profile, featured projects, skills, services, latest posts) |
| `GET /api/profile/` | Site profile |
| `GET /api/projects/?cat=<slug>&featured=true` | Project list, optional category/featured filter |
| `GET /api/projects/<slug>/` | Project detail |
| `GET /api/projects/<slug>/related/` | Related projects |
| `GET /api/blog/?cat=<slug>` | Blog post list |
| `GET /api/blog/<slug>/` | Blog post detail |
| `GET /api/blog/<slug>/related/` | Related posts |
| `GET /api/resume/` | Aggregated resume data (experience, education, skills, services) |
| `GET /api/categories/` | Categories |
| `POST /api/contact/` | Submit contact form (`name`, `email`, `subject`, `message`) |
| `POST /api/chat/` | Chatbot endpoint (`message`, `history`) — needs `GEMINI_API_KEY` in `.env` |

### 2. Frontend (React)

In a second terminal:

```bash
cd portfolio_v2/frontend
npm install
cp .env.example .env               # VITE_API_URL=http://127.0.0.1:8000
npm run dev                        # http://127.0.0.1:5173
```

Open `http://127.0.0.1:5173` — it talks to the Django API for all data.

For production, `npm run build` outputs static files to `frontend/dist/`, which you can serve from any static host (Vercel, Netlify, Nginx, Whitenoise, etc.) — just point `VITE_API_URL` at your deployed Django backend.

---

## 🔧 What changed from the original

- Added `rest_framework` + `corsheaders` to `INSTALLED_APPS`, plus `portfolio/serializers.py` and `portfolio/api_views.py`.
- Added `portfolio/api_urls.py`, mounted at `/api/` in `portfolio_site/urls.py`.
- `CORS_ALLOWED_ORIGINS` in `settings.py` defaults to the Vite dev server (`http://localhost:5173`) — update this (or set the `CORS_ALLOWED_ORIGINS` env var) for your deployed frontend URL.
- The chatbot view was ported to a DRF `@api_view` at `/api/chat/` — same Gemini-based logic as before.
- Contact form now POSTs JSON to `/api/contact/` instead of a Django form submission.
- The React app replicates every page (Home, Projects, Project Detail, Blog, Blog Detail, Resume, Contact) and the dark/light theme toggle, scroll-reveal animations, skill bars, and floating chatbot — all in `frontend/src/`.

Everything else (models, admin panel, migrations, media uploads) is unchanged.

---

## 🎛 Admin Guide

Same as before — go to `/admin/` and fill in, in order: **Site Profile → Skills → Services → Categories → Projects → Experience → Education → Blog Posts**. See inline `help_text` on each field in the admin for guidance.

## 🤖 Chatbot Setup

1. Get a free API key at **https://aistudio.google.com/**
2. Add `GEMINI_API_KEY=...` to `portfolio_v2/.env`
3. Restart the Django server

## 📁 Project Structure

```
portfolio_v2/
├── requirements.txt
├── manage.py
├── portfolio_site/
│   ├── settings.py          # + rest_framework, corsheaders
│   └── urls.py               # + /api/ routes
├── portfolio/
│   ├── models.py
│   ├── serializers.py         # NEW — DRF serializers
│   ├── api_views.py           # NEW — DRF API views
│   ├── api_urls.py            # NEW — /api/ routing
│   ├── views.py                # unchanged (old template views + chatbot helper)
│   ├── urls.py                  # unchanged (old template routes)
│   └── templates/portfolio/     # unchanged (classic server-rendered version)
└── frontend/                    # NEW — React app
    ├── index.html
    ├── package.json
    └── src/
        ├── api/client.js        # Axios client for the Django API
        ├── context/              # Theme + Toast providers
        ├── hooks/useReveal.js    # scroll-reveal animation hook
        ├── components/           # Navbar, Footer, Chatbot, cards
        ├── pages/                 # Home, Projects, ProjectDetail, Blog, BlogDetail, Resume, Contact
        ├── App.jsx
        └── main.jsx
```
