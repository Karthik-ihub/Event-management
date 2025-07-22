from django.urls import path
from . import admins, users

urlpatterns = [
    # Admin endpoints
    path('admin/register/', admins.register, name='admin_register'),
    path('admin/login/', admins.login, name='admin_login'),
    path('admin/events/', admins.create_event, name='create_event'),
    path('admin/dashboard/', admins.dashboard, name='admin_dashboard'),
    path('admin/generate-description/', admins.generate_description, name='generate_description'),
    # User endpoints
    path('user/signup/', users.signup, name='user_signup'),
    path('user/login/', users.login, name='user_login'),
    path('user/dashboard/', users.dashboard, name='dashboard'),
]