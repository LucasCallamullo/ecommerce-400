

"""
# NOTE para trabajar en local y ver queries optimizadas o no

pip install virtual .venv            # or your environment name, e.g., ".venv"
.\.venv\Scripts\Activate.ps1        


pip install django-debug-toolbar
pip freeze > requirements.txt    


# NOTE configurar solo para debug en local despues eliminar antes de produccion
# settings.py
DEBUG = True  # Solo en desarrollo (nunca en producción)

if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1', '::1']  # Solo accesible localmente


# urls.py    principal proyecto raiz
from django.conf import settings

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns


# NOTE para eliminarlo
pip uninstall django-debug-toolbar
pip freeze > requirements.txt  # Ahora sin debug-toolbar

"""









"""  
# NOTE originales
asgiref==3.8.1
bleach==6.2.0
certifi==2025.4.26
charset-normalizer==3.4.2
Django==5.2.1
django-environ==0.12.0
djangorestframework==3.16.0
et_xmlfile==2.0.0
gunicorn==23.0.0
idna==3.10
mercadopago==2.3.0
openpyxl==3.1.5
packaging==25.0
psycopg2-binary==2.9.10
requests==2.32.3
sqlparse==0.5.3
tzdata==2025.2
urllib3==2.4.0
webencodings==0.5.1
whitenoise==6.9.0


django-debug-toolbar==5.2.0
"""