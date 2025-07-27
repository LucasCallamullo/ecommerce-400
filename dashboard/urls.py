

from django.urls import path
from dashboard import views

urlpatterns = [
    
    path('main-dashboard/', views.main_dashboard, name='main_dashboard'),
    
    # get diferrents dashboard stuff
    path('get-dashboard/<str:section_name>/', views.get_dashboard, name='get-dashboard'),
    
    
    # html response
    path('dashboard/filter/products', views.dash_filter_products, name='dash-filter-products'),
    
]
