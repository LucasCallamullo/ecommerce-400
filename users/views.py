

# Create your views here.
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.http import JsonResponse


def register_user(request):
    PROVINCIAS_CHOICES = [
        ('', 'Selecciona una provincia'),
        ('Buenos Aires', 'Buenos Aires'),
        ('Catamarca', 'Catamarca'),
        ('Chaco', 'Chaco'),
        ('Chubut', 'Chubut'),
        ('CABA', 'Ciudad Autónoma de Buenos Aires'),
        ('Córdoba', 'Córdoba'),
        ('Corrientes', 'Corrientes'),
        ('Entre Ríos', 'Entre Ríos'),
        ('Formosa', 'Formosa'),
        ('Jujuy', 'Jujuy'),
        ('La Pampa', 'La Pampa'),
        ('La Rioja', 'La Rioja'),
        ('Mendoza', 'Mendoza'),
        ('Misiones', 'Misiones'),
        ('Neuquén', 'Neuquén'),
        ('Río Negro', 'Río Negro'),
        ('Salta', 'Salta'),
        ('San Juan', 'San Juan'),
        ('San Luis', 'San Luis'),
        ('Santa Cruz', 'Santa Cruz'),
        ('Santa Fe', 'Santa Fe'),
        ('Santiago del Estero', 'Santiago del Estero'),
        ('Tierra del Fuego', 'Tierra del Fuego'),
        ('Tucumán', 'Tucumán')
    ]
    context = {'provinces': PROVINCIAS_CHOICES}
    return render(request, 'users/register_user.html', context)


from orders.models import Order
from orders.models import ShipmentMethod, PaymentMethod, StatusOrder
from users.models import CustomUser
from django.db.models import Prefetch


def profile_page(request):
    user = request.user
    
    # Si no está autenticado, redirigir al home
    if not user.is_authenticated:
        return redirect('/')

    # Verificar si es admin o superadmin
    if user.id == 1 or user.role == 'admin':
        shipments = ShipmentMethod.objects.all().order_by('id')
        payments = PaymentMethod.objects.all().order_by('id')
        users = CustomUser.objects.all()

        # Pasar los datos al contexto para el template
        context = {
            # Listas ya filtradas en el prefetch mejor performance
            'users': users,
            'shipments': shipments,
            'payments': payments
        }
        
        return render(request, 'users/admin_profile.html', context)

    # User Profile Comun
    return render(request, 'users/profile.html')





def profile_tabs(request, tab_name):
    """ 
    cada condicion devuelve de forma asincrona mediante un fetch el html renderizado ademas de un javascript
    asociado para poder utilizar en la pagina
    """
    from favorites import utils
    from products import filters
    from home.models import Store
    
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'Tab not found'}, status=404)
    
    if user.role == 'buyer':
    
        if tab_name == 'first-tab':
            user = request.user
            # Trae órdenes junto con la factura en una sola consulta SQL
            
            if user.is_superuser:    # verificamos si es admin
                orders = Order.objects.all()
            else:
                orders = user.orders.select_related("invoice").all()
            
            context = { 'orders': orders }
            html = render_to_string('users/tabs/pedidos.html', context)
            return JsonResponse({'html': html})
            

        if tab_name == 'favorites-tab':
            products = (
                utils.get_favs_products(user, return_qs=True)
                .selected_related_w_only(
                    fk_fields=('category', 'subcategory', 'brand'),
                    only_fields=(filters.PRODUCT_CARDS_LIST)
                )
                .order_by('-created_at')
            )
            
            context = {'products': products}
            html = render_to_string('users/tabs/favorites.html', context)
            return JsonResponse({'html': html})


        if tab_name == 'third-tab':
            context = {"none": None}
            html = render_to_string('users/tabs/compras.html', context)
            return JsonResponse({'html': html})
        
    elif user.role == 'admin':
        if tab_name == 'store-data-tab':
            shipments = ShipmentMethod.objects.all().order_by('id')
            payments = PaymentMethod.objects.all().order_by('id')
            
            store = Store.objects.filter(id=1).first() 

            # Pasar los datos al contexto para el template
            context = {
                'store': store,
                'shipments': shipments,
                'payments': payments
            }
            html_content = render_to_string('users/tabs/adm_store.html', context)
            return JsonResponse({'html': html_content})
        
        if tab_name == 'users-tab':
            # Recuperar parámetros GET
            search = request.GET.get('search', '')   # Si no hay, devuelve ''
            role = request.GET.get('role', 'buyer')  # Por defecto 'buyer'

            # Por ejemplo, filtrar usuarios:
            users = CustomUser.objects.all()

            if search:
                users = users.filter(email__icontains=search)

            if role:
                users = users.filter(role=role)

            context = {
                'users': users,
                'choices': CustomUser.ROLE_CHOICES,
                'choice': role,   # Para que tu <select> quede marcado
            }
            html = render_to_string('users/tabs/adm_users.html', context)
            return JsonResponse({'html': html})
   
    return JsonResponse({'error': 'Tab not found'}, status=404)

