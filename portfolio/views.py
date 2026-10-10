import json
import requests
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.conf import settings

from .models import (SiteProfile, Skill, Service, Experience,
                     Education, Project, BlogPost, Category, ContactMessage)
from .forms import ContactForm


# ─────────────────────────────────────────────
#  Helper: build chatbot context from DB
# ─────────────────────────────────────────────
def build_chatbot_context():
    lines = []
    profile = SiteProfile.objects.first()
    if profile:
        lines.append(f"Name: {profile.full_name}")
        lines.append(f"Title: {profile.title}")
        lines.append(f"Location: {profile.location}")
        lines.append(f"Email: {profile.email}")
        lines.append(f"Bio: {profile.bio}")
        if profile.bio_extra:
            lines.append(f"More about me: {profile.bio_extra}")
        if profile.availability:
            lines.append(f"Availability: {profile.availability}")
        if profile.github_url:
            lines.append(f"GitHub: {profile.github_url}")
        if profile.linkedin_url:
            lines.append(f"LinkedIn: {profile.linkedin_url}")
        lines.append(f"Years of experience: {profile.years_experience}")
        lines.append(f"Projects built: {profile.projects_count}")

    skills = Skill.objects.all()
    if skills.exists():
        lines.append("\n== SKILLS ==")
        for cat_code, cat_label in Skill.CATEGORY_CHOICES:
            cat_skills = skills.filter(category=cat_code)
            if cat_skills.exists():
                names = ', '.join(f"{s.name} ({s.proficiency}%)" for s in cat_skills)
                lines.append(f"{cat_label}: {names}")

    experiences = Experience.objects.all()
    if experiences.exists():
        lines.append("\n== WORK EXPERIENCE ==")
        for exp in experiences:
            lines.append(f"- {exp.role} at {exp.company} ({exp.get_period()}): {exp.description}")

    educations = Education.objects.all()
    if educations.exists():
        lines.append("\n== EDUCATION ==")
        for edu in educations:
            lines.append(f"- {edu.degree} at {edu.institution} ({edu.get_period()}). {edu.description}")

    projects = Project.objects.exclude(status='archived')
    if projects.exists():
        lines.append("\n== PROJECTS ==")
        for p in projects:
            line = f"- {p.title} ({p.status}): {p.short_description}. Tech: {p.tech_stack}."
            if p.github_url:
                line += f" GitHub: {p.github_url}"
            if p.live_url:
                line += f" Live: {p.live_url}"
            lines.append(line)

    services = Service.objects.all()
    if services.exists():
        lines.append("\n== SERVICES OFFERED ==")
        for s in services:
            lines.append(f"- {s.title}: {s.description}")

    return '\n'.join(lines)


# ─────────────────────────────────────────────
#  Pages
# ─────────────────────────────────────────────
def home(request):
    skills_by_category = {}
    for skill in Skill.objects.all():
        label = skill.get_category_display()
        skills_by_category.setdefault(label, []).append(skill)

    context = {
        'featured_projects': Project.objects.filter(featured=True)[:6],
        'skills_by_category': skills_by_category,
        'services': Service.objects.all(),
        'experiences': Experience.objects.all()[:4],
        'latest_posts': BlogPost.objects.filter(published=True)[:3],
    }
    return render(request, 'portfolio/home.html', context)


def projects(request):
    qs = Project.objects.exclude(status='archived')
    categories = Category.objects.filter(projects__isnull=False).distinct()
    cat_slug = request.GET.get('cat', '')
    if cat_slug:
        qs = qs.filter(category__slug=cat_slug)
    return render(request, 'portfolio/projects.html', {
        'projects': qs,
        'categories': categories,
        'active_cat': cat_slug,
    })


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    others  = Project.objects.exclude(pk=project.pk).exclude(status='archived')[:3]
    return render(request, 'portfolio/project_detail.html', {
        'project': project,
        'other_projects': others,
    })


def blog(request):
    posts = BlogPost.objects.filter(published=True)
    categories = Category.objects.filter(posts__published=True).distinct()
    cat_slug = request.GET.get('cat', '')
    if cat_slug:
        posts = posts.filter(category__slug=cat_slug)
    return render(request, 'portfolio/blog.html', {
        'posts': posts,
        'categories': categories,
        'active_cat': cat_slug,
    })


def blog_detail(request, slug):
    post = get_object_or_404(BlogPost, slug=slug, published=True)
    related = BlogPost.objects.filter(published=True).exclude(pk=post.pk)[:3]
    return render(request, 'portfolio/blog_detail.html', {
        'post': post,
        'related': related,
    })


def resume(request):
    return render(request, 'portfolio/resume.html', {
        'experiences': Experience.objects.all(),
        'educations':  Education.objects.all(),
        'skills':      Skill.objects.all(),
        'services':    Service.objects.all(),
    })


def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Message sent! I'll get back to you soon.")
            return redirect('contact')
    else:
        form = ContactForm()
    return render(request, 'portfolio/contact.html', {'form': form})


# ─────────────────────────────────────────────
#  Chatbot API endpoint (Gemini - Free)
# ─────────────────────────────────────────────
@require_POST
@csrf_exempt
def chatbot_api(request):
    try:
        data    = json.loads(request.body)
        message = data.get('message', '').strip()
        history = data.get('history', [])

        if not message:
            return JsonResponse({'error': 'Empty message'}, status=400)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return JsonResponse({'reply': "Chatbot is not configured yet. Please add your GEMINI_API_KEY to the .env file."})

        # Build system prompt dynamically from admin data
        context_text = build_chatbot_context()
        profile = SiteProfile.objects.first()
        name = profile.full_name if profile else 'this developer'

        system_prompt = f"""You are a friendly AI assistant embedded in {name}'s personal portfolio website.
Your job is to answer visitor questions about {name} — their background, skills, projects, experience, availability, and how to get in touch.

Here is everything you know about {name}:

{context_text}

Guidelines:
- Be warm, concise, and professional.
- Only answer questions about {name} and their work. For unrelated questions, politely redirect the visitor.
- If asked for contact info, provide the email above.
- If you don't know something specific, say so honestly and suggest they use the contact form.
- Keep replies under 150 words unless a detailed answer is clearly needed.
"""

        # Build conversation in Gemini format
        gemini_contents = []
        for h in history[-10:]:
            if h.get('role') in ('user', 'assistant'):
                gemini_role = 'user' if h['role'] == 'user' else 'model'
                gemini_contents.append({
                    'role': gemini_role,
                    'parts': [{'text': h['content']}]
                })
        gemini_contents.append({'role': 'user', 'parts': [{'text': message}]})

        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={api_key}',
            headers={'Content-Type': 'application/json'},
            json={
                'system_instruction': {'parts': [{'text': system_prompt}]},
                'contents': gemini_contents,
                'generationConfig': {'maxOutputTokens': 400, 'temperature': 0.7},
            },
            timeout=30,
        )

        if response.status_code == 200:
            reply = response.json()['candidates'][0]['content']['parts'][0]['text']
            return JsonResponse({'reply': reply})
        else:
            return JsonResponse({'reply': 'Sorry, I had trouble responding. Please try again.'})

    except Exception as e:
        return JsonResponse({'reply': 'Something went wrong. Please try again later.'})