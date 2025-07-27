
""" 
# ======================================================================================
#                INSTALL DEPENDENCIES AND CONFIGURATION FOR MYSQL
# ======================================================================================

# NOTE install dependencies for MySQL (only one is required)
pip install pymysql                         # works with Railway deploy
pip install mysqlclient

# NOTE if you installed pymysql, you need to modify Django's settings.py by adding this at the top:
import pymysql
pymysql.install_as_MySQLdb()

# NOTE This should be installed alongside pymysql; test if it works without it first
pip install cryptography  
   
# NOTE configure DATABASE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # Use the MySQL backend
        'NAME': 'database_name',              # Name of your database
        'USER': 'mysql_user',                 # MySQL user
        'PASSWORD': 'mysql_password',         # Password for the user
        'HOST': 'localhost',                  # Host address (or IP)
        'PORT': '3306',                       # Port to connect to MySQL
    }
}


"""