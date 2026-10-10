from django.db import models
from django.utils.text import slugify


class SiteProfile(models.Model):
    """Singleton model — stores all personal info shown across the site."""
    full_name       = models.CharField(max_length=150)
    title           = models.CharField(max_length=200, help_text="e.g. Full-Stack Developer & Open Source Enthusiast")
    tagline         = models.CharField(max_length=300, help_text="Short punchy line shown in hero")
    bio             = models.TextField(help_text="Main about-me paragraph")
    bio_extra       = models.TextField(blank=True, help_text="Second about-me paragraph (optional)")
    profile_photo   = models.ImageField(upload_to='profile/', blank=True, null=True)
    email           = models.EmailField()
    location        = models.CharField(max_length=150, blank=True)
    availability    = models.CharField(max_length=100, blank=True, help_text="e.g. Available for freelance")
    resume_file     = models.FileField(upload_to='resume/', blank=True, null=True, help_text="PDF of your CV")

    # Social links
    github_url      = models.URLField(blank=True)
    linkedin_url    = models.URLField(blank=True)
    twitter_url     = models.URLField(blank=True)
    website_url     = models.URLField(blank=True, help_text="Any other personal website")

    # Hero stats
    years_experience = models.PositiveIntegerField(default=0)
    projects_count   = models.PositiveIntegerField(default=0)
    clients_count    = models.PositiveIntegerField(default=0)

    # SEO
    meta_description = models.CharField(max_length=160, blank=True, help_text="Google search snippet (max 160 chars)")
    og_image         = models.ImageField(upload_to='seo/', blank=True, null=True, help_text="Social share image (1200x630px)")

    class Meta:
        verbose_name = 'Site Profile'

    def __str__(self):
        return self.full_name or 'Site Profile'

    def save(self, *args, **kwargs):
        # Ensure only one profile exists
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('language',  'Programming Language'),
        ('framework', 'Framework / Library'),
        ('tool',      'Tool / DevOps'),
        ('soft',      'Soft Skill'),
        ('other',     'Other'),
    ]
    name        = models.CharField(max_length=100)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    proficiency = models.PositiveIntegerField(default=80, help_text="0–100 percent")
    icon_class  = models.CharField(max_length=100, blank=True, help_text="Devicon class e.g. devicon-python-plain")
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class Service(models.Model):
    """What you offer — shown in the home page services section."""
    title       = models.CharField(max_length=150)
    description = models.TextField()
    icon        = models.CharField(max_length=80, help_text="Bootstrap icon class e.g. bi-code-slash")
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Experience(models.Model):
    company     = models.CharField(max_length=200)
    role        = models.CharField(max_length=200)
    location    = models.CharField(max_length=150, blank=True)
    start_date  = models.DateField()
    end_date    = models.DateField(blank=True, null=True)
    current     = models.BooleanField(default=False, help_text="Tick if this is your current job")
    description = models.TextField(help_text="Describe your responsibilities and achievements")
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.role} @ {self.company}"

    def get_period(self):
        start = self.start_date.strftime('%b %Y')
        end   = 'Present' if self.current else (self.end_date.strftime('%b %Y') if self.end_date else '')
        return f"{start} — {end}"


class Education(models.Model):
    institution = models.CharField(max_length=200)
    degree      = models.CharField(max_length=200, help_text="e.g. BSc Computer Science")
    field       = models.CharField(max_length=200, blank=True)
    start_year  = models.PositiveIntegerField()
    end_year    = models.PositiveIntegerField(blank=True, null=True)
    current     = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_year']

    def __str__(self):
        return f"{self.degree} — {self.institution}"

    def get_period(self):
        end = 'Present' if self.current else (str(self.end_year) if self.end_year else '')
        return f"{self.start_year} — {end}"


class Category(models.Model):
    name  = models.CharField(max_length=100)
    slug  = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Project(models.Model):
    STATUS_CHOICES = [
        ('completed',   'Completed'),
        ('in_progress', 'In Progress'),
        ('archived',    'Archived'),
    ]
    title             = models.CharField(max_length=200)
    slug              = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=300)
    description       = models.TextField()
    tech_stack        = models.CharField(max_length=400, help_text="Comma-separated e.g. Python, Django, PostgreSQL")
    image             = models.ImageField(upload_to='projects/', blank=True, null=True)
    github_url        = models.URLField(blank=True)
    live_url          = models.URLField(blank=True)
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    featured          = models.BooleanField(default=False)
    category          = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    created_at        = models.DateTimeField(auto_now_add=True)
    order             = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_tech_list(self):
        return [t.strip() for t in self.tech_stack.split(',') if t.strip()]


class BlogPost(models.Model):
    title      = models.CharField(max_length=250)
    slug       = models.SlugField(unique=True, blank=True)
    category   = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    excerpt    = models.CharField(max_length=350, help_text="Short summary shown on the blog listing page")
    content    = models.TextField(help_text="Supports Markdown")
    cover      = models.ImageField(upload_to='blog/', blank=True, null=True)
    published  = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def reading_time(self):
        words = len(self.content.split())
        minutes = max(1, round(words / 200))
        return f"{minutes} min read"


class ContactMessage(models.Model):
    name     = models.CharField(max_length=150)
    email    = models.EmailField()
    subject  = models.CharField(max_length=200)
    message  = models.TextField()
    sent_at  = models.DateTimeField(auto_now_add=True)
    read     = models.BooleanField(default=False)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.name} — {self.subject}"
