

""" 
este modulo debera expandirs e afuturo  si se quiere buscar informacion sobre amazon 3wb s

# ======================================================================================
#                FOR MEDIA URL CONFIG
# ======================================================================================

# NOTE (OPTIONAL) This is to support the images for this app, add this in urls.py

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 

# NOTE you must add something like this in # settings.py

# Directory to store our images
import os.path
MEDIA_URL = 'media/' 
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
"""