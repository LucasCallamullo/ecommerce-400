

from django.urls import path
from users import views


urlpatterns = [
    path('register-user/', views.register_user, name='register_user_page'),
    
    path('perfil/', views.profile_page, name='profile_user'),
    
    path('profile/tab/<str:tab_name>/', views.profile_tabs, name='profile_tabs'),
]