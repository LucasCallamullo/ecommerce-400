


from django.template.loader import render_to_string

from favorites import utils
from products import filters
from home.models import Store


from orders.models import Order, ItemOrder
from orders.models import ShipmentMethod, PaymentMethod, StatusOrder
from users.models import CustomUser
from django.db.models import Prefetch

def profile_tabs_user(user, tab_name):
    if tab_name == 'orders-tab':
        orders = (
            Order.objects.filter(user=user)
            .values('id', 'created_at', 'total', 'status__name')
            .order_by('-updated_at')
        )
        
        context = { 
            'orders': orders,
            'is_admin': False 
        }
        html = render_to_string('profiles/user/tab_orders.html', context)
        return html
        

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
        html = render_to_string('profiles/user/tab_favorites.html', context)
        return html


    if tab_name == 'third-tab':
        context = {"none": None}
        html = render_to_string('profiles/user/tab_invoices.html', context)
        return html


def profile_tabs_admin(request, tab_name):
    from products.utils import valid_id_or_None
    
    if tab_name == 'orders-tab':
        order_id = request.GET.get('search', '')   # Si no hay, devuelve ''
        status_id = request.GET.get('status', '')  # Por defecto 'buyer'
        
        order_id = valid_id_or_None(order_id)
        status_id = valid_id_or_None(status_id)
        
        orders = Order.objects.all()
        if order_id:
            orders = orders.filter(id=order_id)
        if status_id and not order_id:
            orders = orders.filter(status_id=status_id)
            
        orders = orders.values('id', 'created_at', 'total', 'status__name').order_by('-updated_at')

        status_orders = StatusOrder.objects.values(
            'id', 'name'
        ).order_by('id')
        
        context = { 
            'orders': orders,
            'status_orders': status_orders,
            'status_id': status_id,
            'is_admin': True 
        }
        html = render_to_string('profiles/user/tab_orders.html', context)
        return html
    
    if tab_name == 'store-data-tab':
        shipments = ShipmentMethod.objects.values(
            'id', 'name', 'price', 'is_active', 'description'
        ).order_by('id')
        
        payments = PaymentMethod.objects.values(
            'id', 'name', 'time', 'is_active', 'description'
        ).order_by('id')
        
        store = Store.objects.values(
            'id', 'name', 'address', 'email', 'cellphone', 'name', 'ig_url', 'fb_url', 'tt_url',
            'wsp_number', 'google_url', 'tw_url'
        ).get(id=1)
        
        # Pasar los datos al contexto para el template
        context = {
            'store': store,
            'shipments': shipments,
            'payments': payments
        }
        html = render_to_string('profiles/admin/tab_store.html', context)
        return html
    
    if tab_name == 'users-tab':
        # Recuperar parámetros GET
        search = request.GET.get('search', '')   # Si no hay, devuelve ''
        role = request.GET.get('role', 'buyer')  # Por defecto 'buyer'

        users = CustomUser.objects.all()
        if search:
            users = users.filter(email__icontains=search)
        if role:
            users = users.filter(role=role)
            
        # Solo obtener los campos necesarios
        users = users.values('id', 'first_name', 'last_name', 'email', 'role')

        context = {
            'users': users,
            'choices': CustomUser.ROLE_CHOICES,
            'choice': role,   # Para que tu <select> quede marcado
        }
        html = render_to_string('profiles/admin/tab_roles.html', context)
        return html