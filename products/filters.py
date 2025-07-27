

from django.db import models
from django.db.models import Q, Prefetch, QuerySet
from typing import Dict, List, Optional, Literal

from products.models import PCategory, PSubcategory, PBrand, ProductImage
from products import utils

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

PRODUCT_FIELDS_DETAIL_VIEW = (
    'id', 'slug', 'name', 'price', 'price_list', 'available', 'stock',
    'description', 'discount', 'updated_at', 'main_image',
    'subcategory__slug', 'subcategory__name', 'subcategory__is_default',
    'category__slug', 'category__name', 'category__is_default',
    'brand__slug', 'brand__name', 'brand__is_default'
)

PRODUCT_CARDS_LIST = (
    'id', 'slug', 'name', 'price', 'price_list', 'stock',
    'discount', 'updated_at', 'main_image',
    'subcategory__slug', 'subcategory__name', 'subcategory__is_default',
    'category__slug', 'category__name', 'category__is_default',
    'brand__slug', 'brand__name', 'brand__is_default'
)


class OptimizedQuerySet(models.QuerySet):
    
    def selected_related_w_only(self: models.QuerySet, fk_fields: tuple= None, only_fields: tuple= None):
        """ 
        Encadenamiento de methodos 'Django Styles' --> Ejemplo de uso:
        products = (
            Product.objects
            .all()  # Opcional: .filter(...) si necesitas filtros base
            .selected_related_w_only(
                fk_fields=('category', 'subcategory', 'brand'),
                only_fields=('id', 'name', 'category__name', ...)
            )
            .prefetch_images_all(model_image)
        )
        """
        if fk_fields:
            self = self.select_related(*fk_fields)
        if only_fields:
            self = self.only(*only_fields)
        return self

    def prefetch_images_all(self: models.QuerySet, model_images: object):
        """ obtiene un modelo de imagenes asociado de muchos a uno ejemplo "ProductImage" """
        return self.prefetch_related(
            Prefetch(
                'images',
                queryset=model_images.objects.only('id', 'image_url', 'main_image'),
                to_attr='images_all'
            )
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
            - "available" (str): Availability filter value as a string ('0', '1', or '2'). Defaults to '1'.
                - '0' = only unavailable products
                - '1' = only available products
                - '2' = all products (available and unavailable)
            - "query" (str or None): The search query string, if any, used to filter products by name or other fields.
    """
    cat_id = utils.valid_id_or_None(request.GET.get('category')) 
    subcat_id = utils.valid_id_or_None(request.GET.get('subcategory'))
    query = request.GET.get('query')
    
    top_query = request.GET.get('topQuery')
    if not top_query:
        top_query = request.GET.get('lastQuery')

    # Forzar que solo sea '0', '1' o '2', si no es válido, usar '1'
    available = request.GET.get('available')
    available = available if available in ('0', '1', '2') else '1'

    category = PCategory.objects.filter(id=cat_id).first() if cat_id else None
    subcategory = PSubcategory.objects.filter(id=subcat_id).first() if subcat_id else None

    products = get_products_filters({
        'category': category,
        'subcategory': subcategory,
        'query': query,
        'top_query': top_query,
        'available': True if available == '1' else False, 
        'get_all': True if available == '2' else False
    })

    # retornar el contexto a utilizar en un template
    return {
        "products": products,
        "category": category,
        "subcategory": subcategory,
        "available": available,
        "query": query,
    }


def get_products_filters(filters: dict) -> QuerySet:
    from products.models import Product
    """
    Filters products based on provided dictionary filters.
    
    Args:
        filters (dict): Dictionary with optional keys:
            - 'available' (bool)
            - 'category' (instance PCategory)
            - 'subcategory' (instance PSubcategory)
            - 'query' (str)
            - 'get_all' (bool): If True, returns all products regardless of 'available'.
        
    Returns:
        QuerySet[Product]: Filtered queryset (may be empty if no matches).
    """
    get_all = filters.get('get_all', False)   # if u want different value
    available = filters.get('available', True)   # if u want different value
    category = filters.get('category')           # <- default: None
    subcategory = filters.get('subcategory')     # <- default: None
    query = filters.get('query')                 # <- default: None
    top_query = filters.get('top_query')         # <- default: None

    # Si all está activo, no se filtra por disponibilidad
    products = Product.objects.all() if get_all else Product.objects.filter(available=available)

    if category:
        products = products.filter(category=category)

    if subcategory:
        products = products.filter(subcategory=subcategory)

    if query:
        # 1. Creamos una lista de condiciones Q (consultas) para cada palabra en la búsqueda:
        queries = [Q(normalized_name__icontains=word) for word in query.split()]

        # 2. Extraemos la última condición Q de la lista para usarla como base:
        query_filter = queries.pop()

        # 3. Combinamos todas las condiciones Q restantes usando OR (|):
        #    - Recorremos las condiciones Q que quedaron en la lista
        #    - El operador |= va "sumando" condiciones con OR lógico
        #    - Ejemplo: query_filter = (Q por 'zapatilla') | (Q por 'nike')
        for q in queries:
            # query_filter |= q
            query_filter &= q  # AND lógico: todas las palabras deben aparecer

        # 4. Aplicamos el filtro combinado al queryset de productos:
        #    - La consulta SQL resultante tendrá una cláusula WHERE con múltiples LIKE unidos por OR
        #    - Ejemplo: WHERE normalized_name LIKE '%zapatilla%' OR normalized_name LIKE '%nike%'
        products = products.filter(query_filter)
        
    if top_query:
        queries = [Q(normalized_name__icontains=word) for word in top_query.split()]
        query_filter = queries.pop()
        for q in queries:
            query_filter |= q
        products = products.filter(query_filter)

    return products


def get_categories_n_subcategories(
    request = None, use: Literal['navbar', 'panel_admin'] = 'page'
    ) -> Dict[PCategory, Optional[List[PSubcategory]]]:
    """
    Returns a dictionary mapping each non-default product category to its corresponding list of valid subcategories.

    If `request` is provided, the function will attempt to retrieve the result from cache (key: 'categories_dropmenu').
    If not found, it will compute the result, store it in cache for future calls, and return it.
    If `request` is None, cache will be ignored and fresh data will be returned (used for admin panel, updates, etc.).

    Parameters:
        request (HttpRequest | None): If provided, enables caching logic.
        use (str): Indicates the context in which this function is used. Can be 'navbar' (default) or 'panel_admin'. 
                    This determines which fields are fetched from the database.

    Returns:
        dict: A dictionary mapping each `PCategory` instance to a list of valid `PSubcategory` instances (or None).
    """
    """
    Returns a dictionary mapping each non-default product category to its corresponding list of valid subcategories.

    Parameters:
        use (str): Indicates the context in which this function is used. 
                         Can be 'navbar' (default) or 'panel_admin'. 
                         This determines which fields are fetched from the database.

    Returns:
        dict: A dictionary where the keys are `PCategory` instances and the values are lists of subcategory instances 
              (ordered by name). If a category has no valid subcategories, the value will be None.
              
              Example:
              {
                  <PCategory: Electronics>: [<PSubCategory: Phones>, <PSubCategory: Laptops>],
                  <PCategory: Clothing>: None,
              }
    """
    if request:
        from django.core.cache import cache
        categories_dropmenu = cache.get('categories_dropmenu')
        if categories_dropmenu:
            return categories_dropmenu
    
    # Define fields to fetch based on usage context
    if use == 'navbar':
        fields = (
            'id', 'name', 'slug',
            'subcategories__id', 'subcategories__name', 'subcategories__slug'
        )
    elif use == 'panel_admin':
        fields = (
            'id', 'name', 'image_url',
            'subcategories__id', 'subcategories__name', 'subcategories__image_url'
        )

    # Fetch non-default categories and their related subcategories with selected fields only
    categories = (
        PCategory.objects
        .filter(is_default=False)
        .prefetch_related('subcategories')  # Efficiently loads subcategories in a single query
        .only(*fields)                      # Reduces selected columns to improve performance
        .order_by('name')
    )

    # Create a dictionary mapping each category to its subcategories (if any)
    categories_dropmenu = {}
    for category in categories:
        # Filter subcategories: exclude empty names and sort them
        valid_subcategories = [
            sub for sub in category.subcategories.all().order_by('name')
            if sub.name
        ]

        # Assign subcategories or None if the category has none
        categories_dropmenu[category] = valid_subcategories if valid_subcategories else None

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
def get_paginator(products: QuerySet, page_num: int = 1, quantity: int = 48) -> QuerySet:
    """
    Paginates a Django QuerySet and returns a Page object for the requested page number.

    This is a reusable utility function that handles pagination with proper error handling.
    It's particularly useful for views that need paginated results while maintaining
    all the benefits of Django's QuerySets.

    Args:
        products: Django QuerySet to be paginated.
        page_num: Current page number (defaults to 1). Can be:
                  - An integer (1-based index)
                  - A string that can be converted to an integer
                  - Any other value will fallback to page 1
        quantity: Number of items per page (defaults to 48).

    Returns:
        A Page object containing the items for the requested page, with these attributes:
        - object_list: Items for this page
        - number: Current page number
        - paginator: Associated Paginator object
        - has_next/has_previous: Boolean flags
        - next_page_number/previous_page_number: Methods

    Raises:
        ValueError: If quantity is <= 0.
        TypeError: If products is not a QuerySet.
    """
    # Input validation
    # if quantity <= 0:
    #    raise ValueError("Quantity per page must be positive")
    # if not isinstance(products, QuerySet):
    #    raise TypeError("Expected a Django QuerySet")
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
        page_obj = paginator.page(paginator.num_pages)
    
    return page_obj