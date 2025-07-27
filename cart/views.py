

# Create your views here.
from django.shortcuts import render
from django.http import JsonResponse

from cart.utils import genereric_cart_actions


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


def add_product(request):
    try:
        response_data = genereric_cart_actions(request, action='add')
        return JsonResponse(response_data, status=200)
    
    except ValueError as e:
        print(e)
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    except Exception as e:
        print(e)
        return JsonResponse({'success': False, 'error': 'Error interno'}, status=500)


def subtract_product(request):
    try:
        response_data = genereric_cart_actions(request, action='substract')
        return JsonResponse(response_data, status=200)
    
    except ValueError as e:
        
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': 'Error interno'}, status=500)
        
        
def remove_product(request):
    try:
        response_data = genereric_cart_actions(request, action='delete')
        return JsonResponse(response_data, status=200)
    
    except ValueError as e:
        print(e)
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    except Exception as e:
        print(e)
        return JsonResponse({'success': False, 'error': 'Error interno'}, status=500)
        

