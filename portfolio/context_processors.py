from .models import SiteProfile


def site_profile(request):
    """Inject the SiteProfile into every template context."""
    try:
        profile = SiteProfile.objects.first()
    except Exception:
        profile = None
    return {'profile': profile}
