

# Create your views here.
from django.shortcuts import render

def cart_page_detail(request):
    
    user = request.user
    favorite_product_ids = None
    if user.is_authenticated:
        # IDs de productos favoritos
        favorite_product_ids = set(user.favorites.values_list('product', flat=True)) 
    
    context = {
        'favorite_product_ids': favorite_product_ids
    }
    
    return render(request, "cart/cart_page_detail.html", context)
