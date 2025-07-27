

""" 
# ======================================================================================
#                             ENVIRONMENT VARIABLES
# ======================================================================================

# NOTE Full example in e-commerce-generico/settings.py
# On Railway, we used shared variables. Check the settings.py example to see how to retrieve the variables.
    
    
# NOTE Install environ, configure it, and create a .env file in root_app project

pip install django-environ

# .env (example)
SECRET_KEY='django-insecure-(%i0-mf2^t5jx=!_llsi9jybw-s7txe+1wbp$e9c^==-ft2pp&'
MERCADO_PAGO_PUBLIC_KEY='TEST-46272'
MERCADO_PAGO_ACCESS_TOKEN='TEST-1385281144028688'
DEBUG=True
MYSQL_DATABASE="ecommerce"
MYSQL_USER="root"
MYSQL_PASSWORD="1234"
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
"""

# NOTE Modify and add the following in settings.py
# NOTE Now that we have environment variables, modify settings.py like this:
# =====================================================================================
#             EVERYTHING RELATED TO ENVIRONMENTAL VARIABLES n DB
# =====================================================================================
import environ, os
env = environ.Env()    # Init the environment

try:
    # In local we use environ to bring keys from the .env file, in "Railway" this does not work
    # as such and we must use the "except" block to configure correctly with the environment variables
    # that are added in the "Railway" panel
    environ.Env.read_env()
    MERCADO_PAGO_PUBLIC_KEY = env('MERCADO_PAGO_PUBLIC_KEY')
    MERCADO_PAGO_ACCESS_TOKEN = env('MERCADO_PAGO_ACCESS_TOKEN')
    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY = env('SECRET_KEY')
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = env('DEBUG')
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('postgres_DATABASE'),
            'USER': env('postgres_USER'),
            'PASSWORD': env('postgres_PASSWORD'),
            'HOST': env('postgres_HOST'),
            'PORT': env('postgres_PORT'),
        }
    }


except environ.ImproperlyConfigured:
    # This is for deploy on railway
    MERCADO_PAGO_PUBLIC_KEY = os.getenv('MERCADO_PAGO_PUBLIC_KEY', 'default_public_key')
    MERCADO_PAGO_ACCESS_TOKEN = os.getenv('MERCADO_PAGO_ACCESS_TOKEN', 'default_access_token')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
    DEBUG = os.getenv('DEBUG', True)
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('MYSQL_DATABASE', 'railway'),
            'USER': os.getenv('MYSQL_USER', 'root'),
            'PASSWORD': os.getenv('MYSQL_PASSWORD', 'default_password'),
            'HOST': os.getenv('MYSQL_HOST', 'localhost'),
            'PORT': os.getenv('MYSQL_PORT', '53817'),
        }
    }
    