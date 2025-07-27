from django.urls import path
from cart import views


urlpatterns = [

    path('ver-carrito/', views.cart_page_detail, name='cart_page_detail'),

    # Use this endpoints if u want use django render html
    path('carrito/add/', views.add_product, name='cart_add_product'),
    path('carrito/subtract/', views.subtract_product, name='cart_substract_product'),
    path('carrito/remove/', views.remove_product, name='cart_remove_product'),
]