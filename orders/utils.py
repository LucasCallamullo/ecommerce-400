

from django.db import transaction


from orders.models import ShipmentMethod, ShipmentOrder, PaymentMethod
from orders.models import StatusOrder, Order, ItemOrder
from cart.models import CartItem

from datetime import timedelta
from django.utils import timezone


from rest_framework import status
from rest_framework.response import Response

from products.utils import valid_id_or_None

def get_order_detail_context(order_id, user):
    # Optimización de consultas con select_related
    order_id = valid_id_or_None(order_id)
    if not order_id:
        return None, None
    
    try:
        order = (
            Order.objects
            .select_related('payment', 'shipment', 'shipment__method', 'status')
            .only(
                'id', 'created_at', 'expire_at', 'name', 'email', 'shipment_cost', 'total', 'discount', 
                'shipment__id', 'shipment__address', 
                'status__id', 'status__name',
                'payment__id', 'payment__name', 'payment__time', 
                'shipment__method__id', 'shipment__method__name'
            )
            .get(id=order_id, user=user)
        )
    except Order.DoesNotExist:
        return None, None
    
    # get selected relateds for context
    shipment_method = order.shipment.method          # get method envio associeted with the order
    payment = order.payment                          # get payment from order created
    status = order.status                            # get status from order created

    items = (             # get items from order
        ItemOrder.objects    
        .filter(order=order)
        .select_related('product')  # trae todos los datos del producto relacionados
        .only('quantity', 'price', 'product__id', 'product__name', 'product__main_image')
    )

    context = {
        # order stuff
        'items': items,
        
        'date': order.created_at,
        'expire_date': order.expire_at,
        
        'order_email': order.email,
        'complete_name': order.name,
        'total_cart': order.total,
        'discount': order.discount,
        'shipment_cost': order.shipment_cost,
        
        'shipment_method': shipment_method,
        'address': order.shipment.address,
        'status': status,
        'payment': payment
    }
    
    return order, context


def create_order_pending(order_data, user, products, cart_items):
    from decimal import Decimal
    """
    # example on order data
    order_data = {
        "first_name": "Lucas",
        "last_name": "Martinez",
        "email": "lucas.martinez@example.com",
        "cellphone": "3515437688",
        "dni": "41224335",
        "detail_order": "Por favor, entregar antes de las 18:00.",
        
        # NOTE if id_envio_method == '1': # this is only for retire local
        "name_retire": "lucas",
        "dni_retire": "martinez",
        
        # NOTE if id_envio_method != '1': # Home delivery
        "province": "Córdoba",
        "city": "Córdoba Capital",
        "address": "Av. Colón 1234",
        "postal_code": "5000",
        "detail": "Departamento 2B",
        
        # NOTE this is for use to complete de order
        "shipping_method_id": "2", 
        "payment_method_id": "3"
    }
    """
    try:
        shipping_method = ShipmentMethod.objects.only('id').get(id=order_data['shipping_method_id'])
    except ShipmentMethod.DoesNotExist:
        return None, Response({'detail': 'Método de envío no válido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payment_method = PaymentMethod.objects.only('id', 'time').get(id=order_data['payment_method_id'])
    except PaymentMethod.DoesNotExist:
        return None, Response({'detail': 'Método de pago no válido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        status_order = StatusOrder.objects.only('id').get(id=2)  # Orden en estado "Pendiente"
    except ShipmentMethod.DoesNotExist:
        return None, Response({'detail': 'Estado de orden no válido'}, status=status.HTTP_400_BAD_REQUEST)
    

    with transaction.atomic():
        
        # Create shipping order to associate with the order
        shipment = ShipmentOrder.objects.create(
            method=shipping_method,
            name_pickup=order_data.get("name_retire", ""),
            dni_pickup=order_data.get("dni_retire", ""),
            address=order_data.get("address", ""),
            province=order_data.get("province", ""),
            city=order_data.get("city", ""),
            postal_code=order_data.get("postal_code", ""),
            detail=order_data.get("detail", ""),
        )
        
        # Create expired time for the order, to apply maybe with a signal?
        expire_at = timezone.now() + timedelta(hours=payment_method.time)
        name = f'{order_data.get("first_name", "")} {order_data.get("last_name", "")}'
        # Create new Order
        new_order = Order.objects.create(
            user=user,
            status=status_order,
            payment=payment_method,
            shipment=shipment,
            name=name,
            email=order_data.get("email", ""),
            cellphone=order_data.get("cellphone", ""),
            dni=order_data.get("dni", ""),
            detail_order=order_data.get("detail_order", ""),
            invoice=None, # primero será null y se creara despues una vez confirmado el pago
            expire_at=expire_at
        )
        
        # crear order items
        order_items = []
        
        # update post
        subtotal = 0
        shipment_cost = shipping_method.price
        # maybe more logic like coupon model in the future
        # discount = Decimal(order_data.get("discount", "0"))    
        discount = Decimal("2.00")
        
        for item in cart_items:
            product = products.get(item.product_id)
            
            if product is None:
                transaction.set_rollback(True)
                return None, Response({'detail': 'Productos no validos.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calcular subtotal de productos
            price_decimal = product.calc_discount_decimal()
            subtotal += ( price_decimal * item.quantity )    # get float price
            
            order_items.append(ItemOrder(
                order=new_order,
                product=product,
                quantity=item.quantity,
                price=price_decimal
            ))
                
        ItemOrder.objects.bulk_create(order_items)
        
        # Eliminar items del carrito solo si todo lo anterior salió bien
        CartItem.objects.filter(id__in=[item.id for item in cart_items]).delete()
        
    # Calcular total
    total = subtotal + shipment_cost - discount

    # Actualizar la orden con estos campos
    new_order.shipment_cost = shipment_cost
    new_order.discount = discount
    new_order.total = total
    new_order.save(update_fields=["shipment_cost", "discount", "total"])
        
    return new_order, None
    

from products.models import Product
def confirm_stock_availability(cart_items):
    """
        Función optimizada para reservar stock de los productos en el carrito.
        Utiliza transacciones atómicas y bloqueo de registros para evitar condiciones de carrera.
    """
    with transaction.atomic():
        
        if not cart_items.exists():
            transaction.set_rollback(True)
            return None, Response({'detail': 'No hay productos agregados'}, status=status.HTTP_400_BAD_REQUEST)
        
        # CASO 3: Bloqueo concurrente de productos
        # Obtenemos y bloqueamos todos los productos necesarios en una sola consulta
        # Esto previene condiciones de carrera en operaciones concurrentes
        product_ids = [item.product.id for item in cart_items]
        products = (
            Product.objects
            .filter(id__in=product_ids)
            .select_for_update()
            .only('id', 'name', 'stock', 'stock_reserved', 'available', 'price', 'discount')
            .in_bulk()
        )

        # guardamos lista en memoria para bulk final
        modified_products = []

        for item in cart_items:
            product = products.get(item.product_id)

            if product is None or not product.make_stock_reserved(item.quantity):
                transaction.set_rollback(True)
                return None, Response({'detail': f'Stock Insuficiente {product.name}'}, status=status.HTTP_400_BAD_REQUEST)

            # Modificamos en memoria, no guardamos aún
            modified_products.append(product)

        # Bulk update de una sola vez
        Product.objects.bulk_update(modified_products, ['stock', 'stock_reserved'])
            
    return products, None
