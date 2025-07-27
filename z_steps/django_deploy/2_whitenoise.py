

# NOTE some utils commands
#    pip freeze > requirements.txt
#    .\.venv\Scripts\Activate.ps1


""" 
# NOTE Install whitenoise and modify the settings.py file

pip install whitenoise
pip freeze > requirements.txt    # Update requirements if needed
    
    
# NOTE In settings.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',         # Place it directly below
    ...
]
    
INSTALLED_APPS = [
    ...

    'whitenoise.runserver_nostatic',   # Add before your personal apps, after default apps
]
    
# NOTE To collect static files
# Path for collectstatic to execute, add this to .gitignore
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
"""