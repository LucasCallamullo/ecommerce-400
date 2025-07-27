

from django.core.cache import cache
from home.models import Store

def get_ecommerce_data(request):
    # Si no hay datos en caché, obtenemos los datos de la tienda
    # Intentamos obtener los datos de la tienda desde la caché
    
    # store = cache.get('store')
    
    # if not store:
        # .first() para obtener el primer objeto o None
    store = Store.objects.filter(id=1).first() 
        
        # Guardamos los datos en caché por 1 hora (3600 segundos)
        # cache.set('store', store, 3600)

    return {'store': store}

    
    