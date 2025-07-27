

# NOTE some utils commands
#    pip freeze > requirements.txt
#    .\.venv\Scripts\Activate.ps1


"""
# ======================================================================================
#                             DEPLOY STUFF
# ======================================================================================

# NOTE Remember to activate your environment ------------> .\venv\Scripts\Activate.ps1
# Remember to update when necessary --------------------> pip freeze > requirements.txt


# NOTE To deploy on Railway using only SQLite, we need the following:
# Configure CSRF tokens in settings.py, replacing the URL with the one provided.

CSRF_TRUSTED_ORIGINS = ['https://web-production-8df2.up.railway.app', 'http://localhost']


# NOTE Install gunicorn (there's an example configuration in e-commerce-generico/)

pip install gunicorn


# NOTE CREATE THE FOLLOWING FILES in the main folder and complete them with the indicated content.
# "runtime.txt"
3.11

# "Procfile" (in a single line)
web: python manage.py collectstatic --no-input && gunicorn "NAME_PROJECT".wsgi --log-file -


# NOTE Modify settings.py
# Allow all domains (in production, you can specify only the Railway domain)

ALLOWED_HOSTS = ['*']      # without https//

""" 