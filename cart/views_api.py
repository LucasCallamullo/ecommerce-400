

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from cart.carrito import Carrito
from cart.utils import get_render_htmls
from products.models import Product


from rest_framework.permissions import AllowAny


class GetCartSession(APIView):
    def get(self, request):
        carrito = Carrito(request)
        
        response_data = {
            'carrito': carrito.carrito,
            'total': carrito.total_price,
            'qty_total': carrito.total_items,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    
class BaseCartView(APIView):
    def get_product_or_404(self, producto_id):
        return get_object_or_404(Product, id=producto_id)

    def validate_cart_contains_product(self, carrito, producto_id):
        if producto_id not in carrito.carrito:
            raise ValueError("El producto no está en el carrito.")

    def create_response(self, color, message, carrito):
        return {
            'flag_custom': True,
            'color': color,
            'message': message,
            'carrito': carrito.carrito,
            'total': carrito.total_price,
            'qty_total': carrito.total_items,
        }


class ProductAddCart(BaseCartView):
    permission_classes = [AllowAny]  # Permite a cualquier usuario acceder a esta vista
    
    def post(self, request):
        # Para acceder a los datos JSON
        producto_id = request.data.get('productId')
        value_qty = request.data.get('quantity', '1')

        if not value_qty.isdigit():
            return Response({'flag_custom': False, 'message': "Ingrese un número válido.", 'color': 'red'}, status=status.HTTP_400_BAD_REQUEST)

        product = self.get_product_or_404(producto_id)
        carrito = Carrito(request)

        if not carrito.add_product(product=product, qty=int(value_qty)):
            return Response({'flag_custom': False, 'message': "Producto sin stock.", 'color': 'red'}, status=status.HTTP_400_BAD_REQUEST)
  
        message = "Producto agregado."
        
        response_data = self.create_response('green', message, carrito)
        return Response(response_data, status=status.HTTP_200_OK)


class ProductSubtractCart(BaseCartView):
    def post(self, request):
        # Para acceder a los datos JSON
        producto_id = request.data.get('productId')
        value_qty = request.data.get('quantity', '1')

        if not value_qty.isdigit():
            return Response({'flag_custom': False, 'message': "Ingrese un número válido.", 'color': 'red'}, status=status.HTTP_400_BAD_REQUEST)

        product = self.get_product_or_404(producto_id)
        carrito = Carrito(request)

        try:
            self.validate_cart_contains_product(carrito, producto_id)
        except ValueError as e:
            return Response({'flag_custom': False, 'message': str(e), 'color': 'red'}, status=status.HTTP_400_BAD_REQUEST)

        delete_item = carrito.subtract_product(product=product, qty=int(value_qty))
        message = "Producto eliminado del carrito." if delete_item else "Producto reducido del carrito."

        response_data = self.create_response('red', message, carrito)
        return Response(response_data, status=status.HTTP_200_OK)


class ProductDeleteCart(BaseCartView):
    def delete(self, request):
        # Para acceder a los datos JSON
        producto_id = request.data.get('productId')
        
        product = self.get_product_or_404(producto_id)
        carrito = Carrito(request)

        try:
            self.validate_cart_contains_product(carrito, producto_id)
        except ValueError as e:
            return Response({'flag_custom': False, 'message': str(e), 'color': 'red'}, status=status.HTTP_400_BAD_REQUEST)

        carrito.remove_product(product=product)
        message = "Producto eliminado del carrito."
        
        response_data = self.create_response('red', message, carrito)
        return Response(response_data, status=status.HTTP_200_OK)
