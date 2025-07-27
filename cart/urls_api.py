

from django.urls import path
from cart.views_api import *


# ==============================================================================
#                        DRF API ENDPOINTS
# ==============================================================================
# NOTE for NAME URL on dtf we use -

urlpatterns = [
    
    path('cart-get/', GetCartSession.as_view(), name='get-cart'),
    
    path('cart-add/', ProductAddCart.as_view(), name='cart-prod-add'),
    
    path('cart-subtract/', ProductSubtractCart.as_view(), name='cart-prod-subtract'),
    
    path('cart-delete/', ProductDeleteCart.as_view(), name='cart-prod-delete'),
    
    

]