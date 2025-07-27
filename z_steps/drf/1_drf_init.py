

# NOTE some utils commands
#    pip freeze > requirements.txt
#    .\.venv\Scripts\Activate.ps1


"""
# =======================================================================
#                Initial DRF Configuration and Installation
# =======================================================================

# NOTE install DRF

pip install djangorestframework

# NOTE modify your 'project_name' folder in settings.py

INSTALLED_APPS = [
    ...
    'rest_framework',
]

# NOTE also add this in settings.py

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        
        # This allows you to view the API in HTML format (browser interface)
        'rest_framework.renderers.BrowsableAPIRenderer',  
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
    ),
}

# NOTE To verify everything is working, do the following
python manage.py migrate

"""