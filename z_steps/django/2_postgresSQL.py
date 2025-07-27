# TODO Step-by-step guide to using PostgreSQL with Django

"""
# 1. NOTE - Create a new database from the command line
psql -U postgres    


# 2. NOTE - Enter your user (usually already set, you just need to enter the password)
password = 1234    (local development)

# 3. NOTE - Create the database in the command line with this command: 
CREATE DATABASE ecommerce_proofs;       # the name may vary depending on your choice

# 3. NOTE - Connect with DBeaver to visually inspect the database

    3.a. Click on "New Connection".
    3.b. Select PostgreSQL.
    3.c. Fill in the following details:
        Host: localhost
        Port: 5432
        Database: ecommerce_proofs        # the name may vary depending on your choice
        User: postgres                    # default
        Password: your_password    
        
# 4. NOTE - Install the required dependency to handle PostgreSQL with Python
pip install virtual .venv            # or your environment name, e.g., ".venv"
.\.venv\Scripts\Activate.ps1        
pip install psycopg2-binary
pip freeze > requirements.txt      

        
# 5. NOTE - Connect PostgreSQL in Django's settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ecommerce',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# 6. NOTE - Run migrations to apply changes
python manage.py makemigrations
python manage.py migrate

# NOTE - Possible issues
    Open the "Services" panel in Windows (services.msc) and look for "postgresql-XX" 
    (where XX is the version, e.g., postgresql-15). 
    Make sure it says "Running". If not, right-click → Start.
"""
