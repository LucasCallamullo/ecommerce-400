

# NOTE some utils commands
#    pip freeze > requirements.txt
#    .\.venv\Scripts\Activate.ps1


""" 
# ======================================================================================
#                   START A PROJECT AND INSTALL DEPENDENCIES
# ======================================================================================
# NOTE create a virtual environment
pip install virtual .venv                      # if you get a "create" prompt, accept it
python -m venv .venv            

# NOTE activate the environment
.\.venv\Scripts\Activate.ps1

# NOTE install django and create a project
pip install django
django-admin startproject "name_project" .

# NOTE Modify the settings.py file, adding the following lines

# Recognizer for global shared static files, use this folder (like base.css .js .html)
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static')
]

# NOTE To create an app and add it to our Django project

python manage.py startapp "name_app"

# settings.py -> add
INSTALLED_APPS = [
    ...
    'name_app',
]

# NOTE Modify the urls.py file created in the "name_project" folder, adding this:

from django.urls import include
path('', include("name_app.urls")),

# NOTE create a urls.py file in the "name_app" folder, and add this
from django.urls import path
urlpatterns = [
    path('productos/', views.producto, name="Producto"),
]


# NOTE you can do it this in settings.py for use ngrok to webhook

ALLOWED_HOSTS = ['127.0.0.1']

CSRF_TRUSTED_ORIGINS = [
    'http://127.0.0.1',
]

BASE_URL_PAGE = "https://3388-2803-9800-9884-be88-6c79-ba8f-3c65-2fff.ngrok-free.app"

if DEBUG:
    ALLOWED_HOSTS = ['*']
    CSRF_TRUSTED_ORIGINS.append(BASE_URL_PAGE)
"""