

from django.template.loader import render_to_string

def get_render_htmls(carrito, cart_view):
    
    # renderizar el nuevo html del widget que vamos a integrar con js al html
    context = {'carrito': carrito}
    widget_html = render_to_string('cart/widget_cart_items.html', context)
    
    # solo renderizar la vista del carrito en caso de que estemos en la pagina del carrito
    cart_view_html = None
    if cart_view:
        cart_view_html = render_to_string('cart/table_cart_detail.html', context)
    
    return widget_html, cart_view_html


import json
from products import utils
from products.models import Product
from cart.carrito import Carrito

def genereric_cart_actions(request, action='add'):
    try:
        # Verificar método HTTP
        if request.method != 'POST':
            raise ValueError("Método no permitido")

        # Parsear JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            raise ValueError("JSON inválido")

        # recover values from json
        product_id = utils.valid_id_or_None(data.get('product_id'))
        value_qty = utils.valid_id_or_None(data.get('quantity'))
        cart_qty = utils.valid_id_or_None(data.get('cart_qty')) or 0
        cart_view = data.get('cart_view', 'false').lower() in ['true', '1']
        
        # stupid checks
        if not product_id:
            raise ValueError("ID de producto inválido")
        if value_qty is None:
            raise ValueError("Cantidad inválida")
            
        # consultamos primero el producto para cancelar todo si no existiera
        try:
            product = ( 
                Product.objects
                .only(
                    'id', 'name', 'price',
                    'main_image', 'stock', 'available'
                )
                .get(id=product_id)
            )
        except Product.DoesNotExist:
            raise ValueError("No existe el producto ingresado.")
        
        # esto es una acción propia del action add se realiza antes del cart, para no consultar
        # innecesariamente al cart de la db, si el produc no cumpliera.
        if action == 'add':
            flag, _ = product.stock_or_available(quantity=value_qty + cart_qty)
            if not flag:
                raise ValueError(f"Producto ({product.name}) sin stock")
            
        # Recuperar carrito de la sesión del usuario
        cart = Carrito(request)
        
        if action == 'add':
            # Este metodo compara el stock con el value_add en la db, return True or False
            flag = cart.add_product(product=product, quantity=value_qty)
            message = 'Producto agregado.'
            if not flag:
                raise ValueError("Error al agregar producto.")
            
        elif action == 'substract':
            # quita productos del carrito, en caso de llegar a 0 lo elimina, mensajes basados en lo dicho
            delete_item = cart.subtract_product(product=product, qty= int(value_qty))
            message = "Producto eliminado del carrito." if delete_item else "Producto eliminado del carrito"
            
        elif action == 'delete':
            flag = cart.delete_product(product=product)
            message = 'Producto eliminado del carrito.'
            if not flag:
                raise ValueError("No esta el producto en el carrito..")

        # Generar respuestas HTML
        widget_html, cart_view_html = get_render_htmls(cart, cart_view)

        return {
            'success': True,
            'message': message,
            'color': 'green' if action == 'add' else 'red',
            'total': cart.total_price,
            'qty_total': cart.total_items,
            'widget_html': widget_html,
            'cart_view_html': cart_view_html
        }
        
    except Exception as e:
        raise