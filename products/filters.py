

from django.db import models
from django.db.models import Q, Prefetch, QuerySet
from typing import Dict, List, Optional, Literal, Union

from products.models import PCategory, PSubcategory, PBrand, ProductImage
from products.utils import valid_id_or_None

# CONST TUPLES FILTERS
# para desempaquetar la tupla como argumentos para .only().
PRODUCT_FIELDS_UPDATE = (
    'name', 'slug', 'normalized_name', 'price', 'price_list', 'available', 'stock',
    'description', 'discount', 'updated_at', 'main_image',
    'subcategory__id', 'subcategory__name',
    'category__id', 'category__name', 
    'brand__id', 'brand__name'
)

PRODUCT_FIELDS_DETAIL = (
    'id', 'name', 'price', 'price_list', 'available', 'stock',
    'description', 'discount', 'updated_at', 'main_image',
    'subcategory__id', 'subcategory__name',
    'category__id', 'category__name', 
    'brand__id', 'brand__name'
)

PRODUCT_CARDS_LIST = (
    'id', 'slug', 'name', 'price', 'price_list', 'available', 'stock',
    'discount', 'updated_at', 'main_image',
    'subcategory__slug', 'subcategory__name', 'subcategory__is_default',
    'category__slug', 'category__name', 'category__is_default',
    'brand__slug', 'brand__name', 'brand__is_default'
)

PRODUCT_FIELDS_DETAIL_VIEW = (
    'id', 'slug', 'name', 'price', 'price_list', 'available', 'stock',
    'description', 'discount', 'updated_at', 'main_image',
    'subcategory__slug', 'subcategory__name', 'subcategory__is_default',
    'category__slug', 'category__name', 'category__is_default',
    'brand__slug', 'brand__name', 'brand__is_default'
)

# this is use for a product_list.html / views.product_lsit
VALUES_CARDS_LIST = (
    'id', 'slug', 'name', 'price', 'price_list', 'available', 'stock',
    'discount', 'updated_at', 'main_image',
    'subcategory__id', 'subcategory__slug', 'subcategory__name', 'subcategory__is_default',
    'category__id', 'category__slug', 'category__name', 'category__is_default',
    'brand__id', 'brand__slug', 'brand__name', 'brand__is_default'
)



def get_context_filtered_products(request) -> dict:
    """
    Extracts and validates filter parameters from the GET request, retrieves the filtered 
    list of products, and builds a context dictionary with relevant data for rendering.

    Parameters:
        request (HttpRequest): The incoming HTTP request containing GET parameters.

    Returns:
        dict: A context dictionary containing the following keys:
            - "products" (QuerySet): The filtered list of Product objects based on the parameters.
            - "category" (PCategory or None): The selected category object, or None if not found.
            - "subcategory" (PSubcategory or None): The selected subcategory object, or None if not found.
            - "brand" (PBrand or None): The selected brand object, or None if not found.
            - "available" (str): Availability filter value as a string ('0', '1', or '2'). Defaults to '1'.
                - '0' = only unavailable products
                - '1' = only available products
                - '2' = all products (available and unavailable)
            - "query" (str or None): The search query string, if any, used to filter products by name or other fields.
    """
    def _get_filtered_entity(model, id_value, is_default=False):
        """Función helper interna para obtener entidades filtradas por id."""
        if not id_value:
            return None
        return (
            model.objects.filter(id=id_value, is_default=is_default)
            .values('id', 'slug', 'name')
            .first()
        )
    
    # recuperar valores desde el request
    cat_id = valid_id_or_None(request.GET.get('category')) 
    subcat_id = valid_id_or_None(request.GET.get('subcategory'))
    brand_id = valid_id_or_None(request.GET.get('brand'))
    available = request.GET.get('available', '1')
    query = request.GET.get('query', '')
    top_query = request.GET.get('topQuery', '')

    # Obtener filtros usando la función helper interna
    category = _get_filtered_entity(PCategory, cat_id, is_default=False)
    subcategory = _get_filtered_entity(PSubcategory, subcat_id, is_default=False)
    brand = _get_filtered_entity(PBrand, brand_id, is_default=False)
    
    # Aplicar filtros
    filter_args = {
        'category': category.get('id') if category else None,
        'subcategory': subcategory.get('id') if subcategory else None,
        'brand': brand.get('id') if brand else None,
        'query': query,
        'top_query': top_query,
        'available': True if available == '1' else False, 
        'get_all': True if available == '2' else False,
    }
    products = get_products_filters(filter_args)

    # retornar el contexto a utilizar en un template
    return {
        "products": products,
        "category": category,
        "subcategory": subcategory,
        "brand": brand,
        "available": available,
        "query": query,
    }


def get_products_filters(filters: dict) -> QuerySet:
    from products.models import Product
    """
    Filters products based on provided dictionary filters.
    
    Args:
        filters (dict): Dictionary with optional keys:
            - 'category' (id or None PCategory)
            - 'subcategory' (id or None PSubcategory)
            - 'brand' (id or None PBrand)
            - 'stock' (bool) -> True to -> stock__gt=0
            - 'query' (str)
            - 'top_query' (str)
            - 'available' (bool)
            - 'get_all' (bool): If True, returns all products regardless of 'available'.
        
    Returns:
        QuerySet[Product]: Filtered queryset (may be empty if no matches).
    """
    get_all = filters.get('get_all', False)      # if u want different value
    available = filters.get('available', True)   # if u want different value
    category = valid_id_or_None(filters.get('category'))            # ID || None
    subcategory = valid_id_or_None(filters.get('subcategory'))      # ID || None
    brand = valid_id_or_None(filters.get('brand'))      # ID || None
    query = filters.get('query', '')               
    top_query = filters.get('top_query', '')            # query STR || ''
    stock = filters.get('stock', False)  

    # Si all está activo, no se filtra por disponibilidad
    products = Product.objects.all() if get_all else Product.objects.filter(available=available)
    
    if stock:
        products = products.filter(stock__gt=0)

    if category:
        products = products.filter(category_id=category)

    if subcategory:
        products = products.filter(subcategory_id=subcategory)
        
    if brand:
        products = products.filter(brand_id=brand)

    if query or top_query:
        chain = f'{query} {top_query}'

        # 1. Creamos una lista de condiciones Q (consultas) para cada palabra en la búsqueda:
        #    - Cada Q busca coincidencias parciales (icontains) en el campo normalized_name
        #    - Ejemplo: si query = "zapatilla nike", crea [Q(normalized_name__icontains='zapatilla'), Q(...='nike')]
        queries = [Q(normalized_name__icontains=word) for word in chain.split()]

        # 2. Extraemos la última condición Q como base para combinar las demás:
        #    - Usamos pop() para evitar modificar la lista mientras iteramos
        query_filter = queries.pop()

        # 3. Combinamos todas las condiciones Q usando AND lógico (&):
        #    - Esto obliga a que todas las palabras de búsqueda estén presentes en el nombre normalizado
        #    - Ejemplo: query_filter = (Q por 'zapatilla') & (Q por 'nike')
        for q in queries:
            query_filter &= q
            # query_filter |= q    # OR LOGICO capaz alguna vez me sirve...

        # 4. Aplicamos el filtro combinado al queryset de productos:
        #    - La consulta SQL resultante tendrá una cláusula WHERE con múltiples LIKE unidos por AND
        #    - Ejemplo: WHERE normalized_name LIKE '%zapatilla%' AND normalized_name LIKE '%nike%'
        products = products.filter(query_filter)

    return products


def get_categories_n_subcategories(
    request=None, use: Literal['navbar', 'panel_admin'] = 'page'
) -> Dict[int, Dict[str, Union[Dict, Optional[List[Dict]]]]]:
    """
    Retrieves a dictionary mapping each non-default product category to its corresponding list of subcategories.

    Parameters:
        request (HttpRequest, optional): If provided, attempts to retrieve the result from cache using this request.
        use (Literal['navbar', 'panel_admin']): Determines the context in which the data is used, and 
            which fields to retrieve. Use 'navbar' to get basic information (default), 
            or 'panel_admin' for extended admin panel use.

    Returns:
        dict: A dictionary where:
            - Each key is a category ID (int).
            - Each value is a dictionary with:
                - 'category': a dict representing the category (with selected fields).
                - 'subcategories': a list of subcategory dicts (or None if no subcategories).

    Example:
        {
            1: {
                'category': {'id': 1, 'name': 'Electronics', 'slug': 'electronics'},
                'subcategories': [
                    {'id': 10, 'name': 'Phones', 'slug': 'phones', 'category_id': 1},
                    {'id': 11, 'name': 'Laptops', 'slug': 'laptops', 'category_id': 1}
                ]
            },
            2: {
                'category': {'id': 2, 'name': 'Furniture', 'slug': 'furniture'},
                'subcategories': None
            }
        }
        
    Use Template:
        {% for item in categories_dropmenu.values %}
            {{ item.category.id }}
            {% if item.subcategories %}
                {% for subcat in item.subcategories %}
                    {{ item.category.name }} - {{ subcat.slug }}
    """
    if request:
        from django.core.cache import cache
        categories_dropmenu = cache.get('categories_dropmenu')
        if categories_dropmenu:
            return categories_dropmenu
    
    # Define fields to fetch based on usage context
    if use == 'navbar':
        FIELDS_CAT = ('id', 'name', 'slug')
        FIELDS_SUBCAT = ('id', 'name', 'slug', 'category_id')
    elif use == 'panel_admin':
        FIELDS_CAT = ('id', 'name', 'slug')
        FIELDS_SUBCAT = ('id', 'name', 'slug', 'category_id')
        fields = (
            'id', 'name', 'image_url',
            'subcategories__id', 'subcategories__name', 'subcategories__image_url'
        )

    categories = (
        PCategory.objects
        .filter(is_default=False)
        .order_by('name')
        .values(*FIELDS_CAT)
    )
    
    subcategories = (
        PSubcategory.objects
        .filter(is_default=False)    # name__isnull=False
        .order_by('name')
        .values(*FIELDS_SUBCAT)
    )

    # Create a dictionary mapping each category to its subcategories (if any)
    categories_dropmenu = {}
    for cat in categories:
        cat_id = cat['id']
        cat_subs = [sub for sub in subcategories if sub['category_id'] == cat_id]
        categories_dropmenu[cat_id] = {
            'category': cat,
            'subcategories': cat_subs if cat_subs else None
        }

    """ 
    # Fetch non-default categories and their related subcategories with selected fields only
    categories = (
        PCategory.objects
        .filter(is_default=False)
        .prefetch_related('subcategories')  # Efficiently loads subcategories in a single query
        .only(*fields)                      # Reduces selected columns to improve performance
        .order_by('name')
    )
    
    categories_dropmenu = {}
    for category in categories:
        # Filter subcategories: exclude empty names and sort them
        valid_subcategories = [
            sub for sub in category.subcategories.all().order_by('name')
            if sub.name
        ]

        # Assign subcategories or None if the category has none
        categories_dropmenu[category] = valid_subcategories if valid_subcategories else None
    """

    return categories_dropmenu


def get_brands(use: Literal['page', 'panel_admin'] = 'page') -> QuerySet:
    """
    Retrieve a queryset of brand objects with fields filtered based on the intended usage context.

    Parameters:
        use (Literal['page', 'panel_admin']): 
            Context in which the data will be used. 
            - If 'page', includes additional fields like 'slug'.
            - If 'panel_admin', fetches fewer fields.

    Returns:
        QuerySet: A Django queryset of `PBrand` instances ordered by name, 
                  with only the necessary fields selected to reduce query overhead.
    """
    if use == 'page':
        fields = ('name', 'slug', 'image_url')
    elif use == 'panel_admin':
        fields = ('id', 'name', 'image_url')
    
    brands = ( 
        PBrand.objects
        .filter(is_default=False)
        .only(*fields)
        .order_by('name')
    )
    
    return brands

    
def get_context_dashboard_products(context:dict , sort_by=None, sorted_flag=True) -> dict:
    """
    Enhances the context dictionary with optimized product data for dashboard display.
    Applies sorting (if requested) and queryset optimizations, then adds related brand/category data.

    Steps:
    1. Applies sorting to products if sort_by parameter is provided
    2. Optimizes the queryset with select_related and prefetch_related

    Parameters:
        request (HttpRequest): Django request object containing GET parameters
        context (dict): Initial context dictionary containing at least:
            - 'products': Base Product queryset
        sort_by (str, optional): Field name to sort by. Defaults to None.
    
    Returns:
        dict: Enhanced context with:
            - products: Optimized and potentially sorted Product queryset
    
    Usage Example:
        >>> context = {'products': Product.objects.all()}
        >>> enhanced_context = get_context_dashboard_products(request, context, sort_by='price')
    """
    
    # Step 1: Apply sorting if requested
    if sort_by:
        context["products"] = apply_product_sorting(
            queryset=context["products"],
            sort_by=sort_by,
            sorted_flag=sorted_flag
        )
    
    # Step 2: Apply queryset optimizations
    context["products"] = (
        context["products"]
        .select_related('category', 'subcategory', 'brand')
        .only(*PRODUCT_FIELDS_DETAIL)
        .prefetch_related(
            Prefetch(
                'images',
                queryset=ProductImage.objects.only('id', 'image_url', 'main_image'),
                to_attr='images_all'
            )
        )
    )
    return context


def apply_product_sorting(queryset, sort_by, sorted_flag):
    """
    Apply sorting to products queryset based on parameters
    
    Args:
        queryset: Products queryset
        sort_by: Field to sort by (must be in ALLOWED_SORT_FIELDS)
        sorted_flag: 'desc' for descending or any other for ascending
        
    Returns:
        Sorted queryset if valid sort params, else original queryset
    """
    tupla = ('name', 'category__name', 'available', 'updated_at', 'stock', 'price')
    if not sort_by or sort_by not in tupla:
        return queryset
    
    if sorted_flag == 'desc':
        sort_by = f'-{sort_by}'
        
    return queryset.order_by(sort_by)


from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
def get_paginator(products: QuerySet, page_num: int = 1, quantity: int = 100) -> tuple:
    """
    Paginates a Django QuerySet and returns the items for the current page
    along with pagination metadata.

    Args:
        products (QuerySet): Django QuerySet to be paginated.
        page_num (int): Current page number (defaults to 1).
        quantity (int): Number of items per page (defaults to 48).

    Returns:
        tuple: A tuple containing:
            - products_page (QuerySet): A sliced QuerySet containing items for the current page.
              If no items exist, returns the full original QuerySet or an empty list.
            - pagination (dict): A dictionary with pagination metadata:
                - 'page' (int): Current page number, or 0 if no valid page exists.
                - 'total_pages' (int): Total number of pages available.
    """
    paginator = Paginator(products, quantity)
    
    if page_num is None:
        page_num = 1

    try:
        # 3. Obtener la página actual
        page_obj = paginator.page(page_num)
    except PageNotAnInteger:
        # Si 'page' no es un entero, mostrar la primera página
        page_obj = paginator.page(1)
    except EmptyPage:
        # Si la página está fuera de rango (ej: 9999), mostrar la última página
        # page_obj = paginator.page(paginator.num_pages)
        if paginator.num_pages == 0:
            # No hay ningún resultado, devolver None o lista vacía segura
            page_obj = None
        else:
            # Página fuera de rango, mostrar la primera
            page_obj = paginator.page(1)
    
    
    products_page = page_obj.object_list if page_obj else products
    pagination = {
        'page': page_obj.number if page_obj else 0,
        'total_pages': page_obj.paginator.num_pages if page_obj else 0,
        'results_on_page': len(products_page),
        'total_results': paginator.count
    }
    return products_page, pagination