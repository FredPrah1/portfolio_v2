from rest_framework import serializers
from .models import (SiteProfile, Skill, Service, Experience,
                      Education, Category, Project, BlogPost, ContactMessage)


class SiteProfileSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    resume_file = serializers.SerializerMethodField()
    og_image = serializers.SerializerMethodField()

    class Meta:
        model = SiteProfile
        fields = [
            'full_name', 'title', 'tagline', 'bio', 'bio_extra',
            'profile_photo', 'email', 'location', 'availability', 'resume_file',
            'github_url', 'linkedin_url', 'twitter_url', 'website_url',
            'years_experience', 'projects_count', 'clients_count',
            'meta_description', 'og_image',
        ]

    def _abs(self, request, file_field):
        if not file_field:
            return None
        url = file_field.url
        return request.build_absolute_uri(url) if request else url

    def get_profile_photo(self, obj):
        return self._abs(self.context.get('request'), obj.profile_photo)

    def get_resume_file(self, obj):
        return self._abs(self.context.get('request'), obj.resume_file)

    def get_og_image(self, obj):
        return self._abs(self.context.get('request'), obj.og_image)


class SkillSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_display', 'proficiency', 'icon_class', 'order']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'title', 'description', 'icon', 'order']


class ExperienceSerializer(serializers.ModelSerializer):
    period = serializers.CharField(source='get_period', read_only=True)

    class Meta:
        model = Experience
        fields = ['id', 'company', 'role', 'location', 'start_date', 'end_date',
                  'current', 'description', 'order', 'period']


class EducationSerializer(serializers.ModelSerializer):
    period = serializers.CharField(source='get_period', read_only=True)

    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'field', 'start_year', 'end_year',
                  'current', 'description', 'order', 'period']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'order']


class ProjectSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tech_list = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'short_description', 'description',
                  'tech_stack', 'tech_list', 'image', 'github_url', 'live_url',
                  'status', 'status_display', 'featured', 'category',
                  'created_at', 'order']

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def get_tech_list(self, obj):
        return obj.get_tech_list()


class BlogPostSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    reading_time = serializers.CharField(source='reading_time', read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'category', 'excerpt', 'content', 'cover',
                  'published', 'created_at', 'updated_at', 'reading_time']

    def get_cover(self, obj):
        if not obj.cover:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.cover.url) if request else obj.cover.url


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'sent_at']
        read_only_fields = ['id', 'sent_at']
