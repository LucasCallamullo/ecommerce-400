from django.shortcuts import render

# Create your views here.
from orders.models import ShipmentMethod, PaymentMethod

def order(request):
    """ 
        Esta vista se llama para ver el formulario (se valida con serializers), ver opciones
        de metodos de pago y envío, y actuar en consecuencia segun el metodo de pago y envío.
    """
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
    
    if not request.user.is_authenticated:
        context = {'flag_to_login': True}
        return render(request, "users/register_user.html", context)
        
    # Obtenemos los distintos envios y metodos de pago para actualizar dinamicamente
    envios_methods = ShipmentMethod.objects.filter(is_active=True)
    payment_methods = PaymentMethod.objects.filter(is_active=True)
    
    context = {
        'envios_methods': envios_methods,
        'payment_methods': payment_methods,
        'provinces': PROVINCIAS_CHOICES
    }
    
    return render(request, "orders/order_page.html", context)
