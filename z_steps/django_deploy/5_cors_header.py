

""" 
# ======================================================================================
#                         CONFIGURE CORS - ORIGIN
# ======================================================================================
# NOTE this is for use backend and front separated

# NOTE add this to the end of settings or early
ALLOWED_HOSTS = ['127.0.0.1', 'project-ecommerce-w-payments.up.railway.app']
CSRF_TRUSTED_ORIGINS = ['https://project-ecommerce-w-payments.up.railway.app', 'http://localhost']


# NOTE to install
pip install django-cors-headers

"""