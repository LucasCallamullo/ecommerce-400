

from django.urls import path
from orders import views


urlpatterns = [
    path('order/', views.order, name='order'),
]