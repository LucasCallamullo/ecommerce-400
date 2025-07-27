from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from favorites.models import FavoriteProduct
from products.models import Product
from products import utils


class ToggleFavoriteProduct(APIView):
    def post(self, request, product_id):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Please login session for save products.'}, status=status.HTTP_401_UNAUTHORIZED)

        product_id = utils.valid_id_or_None(product_id)
        if not product_id:    # stupid check
            return Response({'detail': 'Product ID is required or not found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        favorite_product, created = FavoriteProduct.objects.get_or_create(user=user, product=product)

        if not created:
            favorite_product.delete()
            return Response({'detail': 'Product removed from favorites'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Product added to favorites'}, status=status.HTTP_200_OK)
