from django import forms
from .models import ContactMessage


class ContactForm(forms.ModelForm):
    class Meta:
        model  = ContactMessage
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name':    forms.TextInput(attrs={'placeholder': 'Your Name'}),
            'email':   forms.EmailInput(attrs={'placeholder': 'your@email.com'}),
            'subject': forms.TextInput(attrs={'placeholder': 'Subject'}),
            'message': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Your message...'}),
        }
