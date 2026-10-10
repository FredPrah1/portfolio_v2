from django.urls import path
from . import api_views

urlpatterns = [
    path('home/', api_views.home_view, name='api_home'),
    path('profile/', api_views.profile_view, name='api_profile'),
    path('skills/', api_views.SkillListView.as_view(), name='api_skills'),
    path('services/', api_views.ServiceListView.as_view(), name='api_services'),
    path('experiences/', api_views.ExperienceListView.as_view(), name='api_experiences'),
    path('educations/', api_views.EducationListView.as_view(), name='api_educations'),
    path('categories/', api_views.CategoryListView.as_view(), name='api_categories'),
    path('resume/', api_views.resume_view, name='api_resume'),

    path('projects/', api_views.ProjectListView.as_view(), name='api_projects'),
    path('projects/<slug:slug>/', api_views.ProjectDetailView.as_view(), name='api_project_detail'),
    path('projects/<slug:slug>/related/', api_views.related_projects_view, name='api_project_related'),

    path('blog/', api_views.BlogListView.as_view(), name='api_blog'),
    path('blog/<slug:slug>/', api_views.BlogDetailView.as_view(), name='api_blog_detail'),
    path('blog/<slug:slug>/related/', api_views.related_posts_view, name='api_blog_related'),

    path('contact/', api_views.contact_create_view, name='api_contact'),
    path('chat/', api_views.chatbot_api, name='api_chat'),
]
