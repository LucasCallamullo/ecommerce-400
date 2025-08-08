

from cart.models import Cart

class CartMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # DB Cart
            cart, _ = Cart.objects.get_or_create(user=request.user)
            request.cart = cart
        else:
            # Session Cart
            request.cart = None

        return self.get_response(request)