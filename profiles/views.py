

from django.shortcuts import render, redirect
from django.http import JsonResponse

from profiles import utils_tabs


# Create your views here.
def profile_page(request):
    user = request.user
    
    if not user.is_authenticated:
        return redirect('/')

    # Verificar si es admin o superadmin
    if user.id == 1 or user.role == 'admin':
        return render(request, 'profiles/admin/adm_profile.html')

    # User Profile Comun
    return render(request, 'profiles/user/user_profile.html')


def profile_tabs(request, tab_name):
    """ 
        cada condicion devuelve de forma asincrona mediante un fetch el html renderizado ademas de un javascript
        asociado para poder utilizar en la pagina
    """
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'detail': 'No estás registrado..'}, status=404)
    
    if user.role == 'buyer':
        context = utils_tabs.profile_tabs_user(user, tab_name)
        if context:
            # return JsonResponse({'html': html})
            return JsonResponse(context, status=200)
    
    elif user.role == 'admin':
        html = utils_tabs.profile_tabs_admin(request, tab_name)
        if html:
            return JsonResponse({'html': html})
        
    return JsonResponse({'detail': 'Tab not found.'}, status=404)