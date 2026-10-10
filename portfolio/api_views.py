from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import (SiteProfile, Skill, Service, Experience,
                      Education, Category, Project, BlogPost)
from .serializers import (SiteProfileSerializer, SkillSerializer, ServiceSerializer,
                           ExperienceSerializer, EducationSerializer, CategorySerializer,
                           ProjectSerializer, BlogPostSerializer, ContactMessageSerializer)
from .views import build_chatbot_context
import json
import requests
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def profile_view(request):
    profile = SiteProfile.get()
    serializer = SiteProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]


class ExperienceListView(generics.ListAPIView):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [AllowAny]


class EducationListView(generics.ListAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [AllowAny]


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Project.objects.exclude(status='archived')
        cat = self.request.query_params.get('cat')
        if cat:
            qs = qs.filter(category__slug=cat)
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(featured=True)
        return qs


class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


@api_view(['GET'])
@permission_classes([AllowAny])
def related_projects_view(request, slug):
    try:
        project = Project.objects.get(slug=slug)
    except Project.DoesNotExist:
        return Response([], status=200)
    others = Project.objects.exclude(pk=project.pk).exclude(status='archived')[:3]
    serializer = ProjectSerializer(others, many=True, context={'request': request})
    return Response(serializer.data)


class BlogListView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = BlogPost.objects.filter(published=True)
        cat = self.request.query_params.get('cat')
        if cat:
            qs = qs.filter(category__slug=cat)
        return qs


class BlogDetailView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.filter(published=True)
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


@api_view(['GET'])
@permission_classes([AllowAny])
def related_posts_view(request, slug):
    try:
        post = BlogPost.objects.get(slug=slug, published=True)
    except BlogPost.DoesNotExist:
        return Response([], status=200)
    related = BlogPost.objects.filter(published=True).exclude(pk=post.pk)[:3]
    serializer = BlogPostSerializer(related, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_create_view(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'detail': "Message sent! I'll get back to you soon."},
                         status=status.HTTP_201_CREATED)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def resume_view(request):
    """Aggregate endpoint used by the Resume page — one call instead of four."""
    return Response({
        'experiences': ExperienceSerializer(Experience.objects.all(), many=True).data,
        'educations': EducationSerializer(Education.objects.all(), many=True).data,
        'skills': SkillSerializer(Skill.objects.all(), many=True).data,
        'services': ServiceSerializer(Service.objects.all(), many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def home_view(request):
    """Aggregate endpoint used by the Home page — one call instead of five."""
    skills_by_category = {}
    for skill in Skill.objects.all():
        label = skill.get_category_display()
        skills_by_category.setdefault(label, []).append(SkillSerializer(skill).data)

    featured = Project.objects.filter(featured=True)[:6]
    return Response({
        'profile': SiteProfileSerializer(SiteProfile.get(), context={'request': request}).data,
        'featured_projects': ProjectSerializer(featured, many=True, context={'request': request}).data,
        'skills_by_category': skills_by_category,
        'services': ServiceSerializer(Service.objects.all(), many=True).data,
        'experiences': ExperienceSerializer(Experience.objects.all()[:4], many=True).data,
        'latest_posts': BlogPostSerializer(BlogPost.objects.filter(published=True)[:3],
                                            many=True, context={'request': request}).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_api(request):
    try:
        data = request.data
        message = (data.get('message') or '').strip()
        history = data.get('history', [])

        if not message:
            return Response({'error': 'Empty message'}, status=400)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response({'reply': "Chatbot is not configured yet. Please add your GEMINI_API_KEY to the .env file."})

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

        gemini_contents = []
        for h in history[-10:]:
            if h.get('role') in ('user', 'assistant'):
                gemini_role = 'user' if h['role'] == 'user' else 'model'
                gemini_contents.append({'role': gemini_role, 'parts': [{'text': h['content']}]})
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
            return Response({'reply': reply})
        return Response({'reply': 'Sorry, I had trouble responding. Please try again.'})

    except Exception:
        return Response({'reply': 'Something went wrong. Please try again later.'})
