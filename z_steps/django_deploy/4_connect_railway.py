

""" 
# ======================================================================================
#                         CONFIGURE MYSQL ON RAILWAY
# ======================================================================================

# NOTE For Railway, see the example in e-commerce-generico/settings.py
    
# The Railway MySQL URL looks something like this and is published as an environment variable:
# mysql://root:AOwcsdSjJOMLtUPZCLLfItxKRIGjXrxM@autorack.proxy.rlwy.net:28472/railway 

# In settings, we have our remote connection; this should be used if necessary.
# autorack.proxy.rlwy.net:28472


# NOTE Keep in mind that these variables must be shared with the project since Railway
# creates a separate server for MySQL, not the default one.


# NOTE Remember that all this configuration can use environment variables. Check the settings.py example.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # Use MySQL as the backend
        'NAME': 'railway',  # Database name
        'USER': 'root',  # Database user
        'PASSWORD': 'AOwcsdSjJOMLtUPZCLLfItxKRIGjXrxM',  # User password
        'HOST': 'autorack.proxy.rlwy.net',  # Or the MySQL server address
        'PORT': '28472',  # Default MySQL port
    }
}


# NOTE remember you must make this
python manage.py makemigrations
python manage.py migrate
"""