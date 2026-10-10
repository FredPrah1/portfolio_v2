from django.contrib import admin
from django.utils.html import format_html
from .models import (SiteProfile, Skill, Service, Experience,
                     Education, Category, Project, BlogPost, ContactMessage)


@admin.register(SiteProfile)
class SiteProfileAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Personal Info', {'fields': ('full_name', 'title', 'tagline', 'bio', 'bio_extra', 'profile_photo', 'resume_file')}),
        ('Contact & Location', {'fields': ('email', 'location', 'availability')}),
        ('Social Links', {'fields': ('github_url', 'linkedin_url', 'twitter_url', 'website_url')}),
        ('Hero Stats', {'fields': ('years_experience', 'projects_count', 'clients_count')}),
        ('SEO', {'fields': ('meta_description', 'og_image')}),
    )

    def has_add_permission(self, request):
        return not SiteProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'proficiency_bar', 'order')
    list_editable = ('order',)
    list_filter   = ('category',)

    def proficiency_bar(self, obj):
        return format_html(
            '<div style="width:100px;background:#eee;border-radius:4px;">'
            '<div style="width:{}px;background:#58a6ff;height:10px;border-radius:4px;"></div></div> {}%',
            obj.proficiency, obj.proficiency
        )
    proficiency_bar.short_description = 'Proficiency'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ('title', 'icon', 'order')
    list_editable = ('order',)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display  = ('role', 'company', 'get_period', 'current', 'order')
    list_editable = ('order',)
    list_filter   = ('current',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display  = ('degree', 'institution', 'get_period', 'order')
    list_editable = ('order',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'order')
    list_editable = ('order',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display   = ('title', 'category', 'status', 'featured', 'order')
    list_editable  = ('featured', 'order', 'status')
    list_filter    = ('status', 'featured', 'category')
    search_fields  = ('title', 'description', 'tech_stack')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Info', {'fields': ('title', 'slug', 'category', 'short_description', 'description')}),
        ('Media & Links', {'fields': ('image', 'github_url', 'live_url')}),
        ('Meta', {'fields': ('tech_stack', 'status', 'featured', 'order')}),
    )


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display   = ('title', 'category', 'published', 'created_at')
    list_editable  = ('published',)
    list_filter    = ('published', 'category')
    search_fields  = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category', 'cover', 'excerpt', 'content', 'published')}),
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = ('name', 'email', 'subject', 'sent_at', 'read')
    list_editable = ('read',)
    list_filter   = ('read',)
    readonly_fields = ('name', 'email', 'subject', 'message', 'sent_at')

    def has_add_permission(self, request):
        return False


# Customise admin site header
admin.site.site_header  = 'Portfolio Admin'
admin.site.site_title   = 'Portfolio'
admin.site.index_title  = 'Content Manager'
