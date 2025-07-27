from django.shortcuts import render

# Create your views here.

from users.models import CustomUser
from products.models import Product


from home.models import Store, StoreImage
from django.db.models import Prefetch


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
    favorite_product_ids = None
    if user.is_authenticated:
        # IDs de productos favoritos
        favorite_product_ids = set(user.favorites.values_list('product', flat=True)) 


    products = (
        Product.objects.select_related('category').all()
    )
    
    products_by_category = {}
    for product in products:
        
        if not product.category:
            continue
        
        category_name = product.category.name
        if category_name not in products_by_category:
            products_by_category[category_name] = []
        products_by_category[category_name].append(product)
        
    context = {
        'headers_active': headers_active,  
        'banners_active': banners_active,
        
        "favorite_product_ids": favorite_product_ids,
        'products_by_category': products_by_category,
        'products': products
    }

    return render(request, 'home/home.html', context)


def help_mp(request):
    users = CustomUser.objects.exclude(email__in=["lucascallamullo@hotmail.com", "lucascallamullo98@gmail.com"])

    
    return render(request, 'home/help_mp.html', {'users': users})







