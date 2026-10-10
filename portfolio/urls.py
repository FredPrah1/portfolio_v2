from django.urls import path
from . import views

urlpatterns = [
    path('',                        views.home,          name='home'),
    path('projects/',               views.projects,      name='projects'),
    path('projects/<slug:slug>/',   views.project_detail,name='project_detail'),
    path('blog/',                   views.blog,          name='blog'),
    path('blog/<slug:slug>/',       views.blog_detail,   name='blog_detail'),
    path('resume/',                 views.resume,        name='resume'),
    path('contact/',                views.contact,       name='contact'),
    path('api/chat/',               views.chatbot_api,   name='chatbot_api'),
]
