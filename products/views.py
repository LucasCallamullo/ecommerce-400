

# Create your views here.
from django.shortcuts import render
from django.http import JsonResponse
from django.template.loader import render_to_string

from products.models import Product, PCategory, PSubcategory
from products import filters, utils
from products.serializers import ProductListSerializer

from favorites.utils import get_favs_products
from users.permissions import admin_or_superuser_required
import json


def product_brands(request, brand_slug=None):
    pass


def product_list(request, cat_slug=None, subcat_slug=None):
    """
    Function used for rendering HTML based on filters for categories and subcategories if
    they are passed as parameters.

    Args:
        cat_slug (str, optional): Slug field of the category to filter by. Defaults to None.
        subcat_slug (str, optional): Slug field of the subcategory to filter by. Defaults to None.
    """
    # Get category and subcategory if exists
    category = None
    if cat_slug:
        category = ( 
            PCategory.objects.filter(slug=cat_slug, is_default=False)
            .values('id', 'slug', 'name').first()
        )

    subcategory = None
    if subcat_slug:
        subcategory = ( 
            PSubcategory.objects.filter(slug=subcat_slug, is_default=False)
            .values('id', 'slug', 'name').first()
        )
    
    # Apply optimizacions
    products = filters.get_products_filters({
        'category': category['id'] if category else None, 
        'subcategory': subcategory['id'] if subcategory else None
    })
    products = products.values(*filters.VALUES_CARDS_LIST).order_by('price', 'id')
    
    # Serializar los productos de la página actual  
    page_num = request.GET.get('page')
    products_page, pagination = filters.get_paginator(products=products, page_num=page_num, quantity=100)
    
    favorites_ids = get_favs_products(request.user)
    serializer = ProductListSerializer(products_page, many=True, context={'favorites_ids': favorites_ids})
    productos_json = json.dumps(serializer.data)
    
    context = {
        'productos_json': productos_json,
        'pagination': pagination,
        'category': category if category else None,
        'subcategory': subcategory if subcategory else None
    }
    
    return render(request, "products/products_list.html", context)


def product_top_search(request):
    """
    Function used to perform filtering on the top search bar.
    
    # topQuery is the name of the input in base.html, coincidentally it matches
    # with the topQuery call from the sidebar in product_list.html
    """
    # obtener un set de ids para comparacion en template
    favs_products_ids = get_favs_products(request.user)
    
    # We normalize the top query for comparison
    top_query = request.GET.get('topQuery', '')
    page_number = request.GET.get('page')      # Obtener el número de página desde la URL
    
    if top_query:
        top_query = utils.normalize_or_None(top_query)
        products = filters.get_products_filters({'query': top_query})

        context = {
            # 'products': products,
            'products': filters.get_paginator(products=products, page_num=page_number),
            'query': top_query,
            'favorite_product_ids': favs_products_ids
        }
        return render(request, 'products/products_list.html', context)
    
    # in case we dont have topQuery

    #    'sort_by': request.GET.get('sort_by', None),
    #    'asc': request.GET.get('asc', None)
    
    context = filters.get_context_filtered_products(request)
    
    context['favorite_product_ids'] = favs_products_ids
    
    html = render_to_string("products/products_list_cards.html", context)
    return JsonResponse({"html_cards": html})


def product_detail(request, id=None, slug=None):
    from products.models import ProductImage
    """
    Args:
        id (int, optional): ID of the product to search and display its detail. Defaults to None.
        slug (str, optional): actually not used, just for the URL. Defaults to None.

    Raises:
        Http404: Error raised if no ID is passed.
    """
    value_id = utils.valid_id_or_None(id)
    if not value_id:
        context = {'message': 'todavía falta definir bien la 404'}
        return render(request, 'home/404.html', context)
    
    # 3. Verificación de existencia (consulta a DB sólo si el ID es válido)
    try:
        product = (
            Product.objects
            .select_related('category', 'subcategory', 'brand')
            .only(*filters.PRODUCT_FIELDS_DETAIL_VIEW)
            .get(id=id)
        )
    except Product.DoesNotExist:
        context = {'message': 'todavía falta definir bien la 404'}
        return render(request, 'home/404.html', context)
    
    

    # We get all the necessary data from the product
    category = product.category
    subcategory = product.subcategory
    brand = product.brand
    images_urls = product.get_all_images_url()
    context = {
        'product': product,
        'images_urls': images_urls,
        'category': category if not category.is_default else None,
        'subcategory': subcategory if not subcategory.is_default else None,
        'brand': brand if not brand.is_default else None
    }
    return render(request, 'products/product_detail.html', context)


from django.db.models import F
@admin_or_superuser_required
def reset_stocks(request):
    """
    Reinicia los stocks sumando el stock reservado al stock general para los productos afectados.
    """
    # Actualizar en bloque usando F() para optimizar
    Product.objects.filter(stock_reserved__gt=0).update(
        stock=F('stock') + F('stock_reserved'),
        stock_reserved=0  # Opcional: reinicia el stock reservado si es necesario
    )

    # Mensaje de confirmación para el usuario (si es necesario)
    return render(request, 'home/home.html')
