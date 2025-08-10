from django.shortcuts import render

# Create your views here.
from home.models import Store, StoreImage
from django.db.models import Prefetch


import json
from products.models import Product
from products.filters import VALUES_CARDS_LIST
from products.serializers import ProductListSerializer

from favorites.utils import get_favs_products

def home(request):
    
    # Obtener el store con prefetch optimizado
    store = Store.objects.prefetch_related(
        Prefetch(
            'images', 
            queryset=StoreImage.objects.filter(available=True)
            .order_by('-main_image'),
            to_attr='all_images'
        ),
    ).get(id=1)
    
    headers_active = []
    banners_active = []
    for img in store.all_images:
        if img.image_type == 'header':
            headers_active.append(img)
        elif img.image_type == 'banner':
            banners_active.append(img)
    
    user = request.user
    favorites_ids = None
    if user.is_authenticated:
        # IDs de productos favoritos
        favorites_ids = get_favs_products(user)

    products = ( 
        Product.objects
            .filter(category__is_default=False)
            .values(*VALUES_CARDS_LIST)
            .order_by('price', 'id')[:100]    # limita a 100 la query
    )
    
    serializer = ProductListSerializer(products, many=True, context={'favorites_ids': favorites_ids})
    products_data = serializer.data
    
    # obtengo productos agrupados por category para renderizar en js
    products_by_category = {}
    for product in products_data:
        category_name = product['category']['name']
        if category_name not in products_by_category:
            products_by_category[category_name] = []
        products_by_category[category_name].append(product)
        
    context = {
        'headers_active': headers_active,  
        'banners_active': banners_active,
        'products_json': json.dumps(products_by_category)
    }

    return render(request, 'home/home.html', context)


def help_mp(request):
    from users.models import CustomUser
    users = CustomUser.objects.exclude(email__in=["lucascallamullo@hotmail.com", "lucascallamullo98@gmail.com"])
    return render(request, 'home/help_mp.html', {'users': users})







