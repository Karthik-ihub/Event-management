import os

# Update SECRET_KEY (replace with a secure key in production)
SECRET_KEY = 'your-secret-key'

# Add CORS settings for React frontend
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'events',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Allow React frontend (update with your frontend URL, e.g., http://localhost:3000)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

# MongoDB configuration
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'event_management_db',
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
        }
    }
}

# Media settings for file uploads
MEDIA_URL = 'E:/event-management-platform/media/events'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')