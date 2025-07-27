

""" 
# ======================================================================================
#                         DJANGO COMPRESS
# ======================================================================================
# NOTE minimize and compress JS and CSS files with  
pip install django-compressor

# NOTE we must add the collectstatic directories to settings before this  
# NOTE whitenoise step  
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'  

# NOTE add the following to settings.py  
INSTALLED_APPS = [  
    ...,  
    'compressor',  
]  

STATICFILES_FINDERS = [  
    'django.contrib.staticfiles.finders.FileSystemFinder',  
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',  
    'compressor.finders.CompressorFinder',  # Add this line  
]  

COMPRESS_ENABLED = True    
COMPRESS_OFFLINE = True    
COMPRESS_CSS_FILTERS = ["compressor.filters.cssmin.CSSMinFilter"]    
COMPRESS_JS_FILTERS = ["compressor.filters.jsmin.JSMinFilter"]    

# NOTE use it this way in templates to group different CSS or JS files,  
# NOTE it respects the loading order  
{% load compress %}  

{% compress js %}  
    <script src="{% static 'js/overlay.js' %}"></script>  
    <script src="{% static 'js/dark_mode.js' %}"></script>  
{% endcompress %}  

{% compress css %}  
    <link rel="stylesheet" href="{% static 'css/style.css' %}">  
{% endcompress %}  

# NOTE use this command to regenerate the minified files with updates  
python manage.py compress  
"""