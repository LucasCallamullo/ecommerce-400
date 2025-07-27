

from cart.carrito import Carrito


def carrito_total(request):
    """
    Notes:
        Al pasar el total ya calculado, no necesita que el renderizado recalcule cada vez el valor cuando lo paso
        esto debería mejorar el rendimiento de la app
    """
    carrito = Carrito(request)
    
    context = {
        'carrito': carrito,
        'total_price': carrito.total_price,
        'total_items': carrito.total_items,
    }

    return context
