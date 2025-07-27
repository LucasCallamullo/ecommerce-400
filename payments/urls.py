

from django.urls import path
from payments import views

urlpatterns = [
    path('payment-view/<int:order_id>/', views.payment_view, name='payment-view'),

    path('success/', views.success, name='payment_success'),
    path('failure/', views.failure, name='payment_failure'),
    path('pending/', views.pending, name='payment_pending'),
    

    # revisar en algun momento por mas cuotas de mp
    #   path("crear-preferencia/", views.crear_preferencia, name="crear_preferencia"),

]