

from django.shortcuts import render
from django.http import JsonResponse
from django.template.loader import render_to_string

from products import filters

from users.permissions import admin_or_superuser_required
from django.db.models import Prefetch, F

from home.models import Store, StoreImage
from products.serializers import ProductListSerializer

@admin_or_superuser_required
def dash_filter_products(request):
    """ this view return a queryset products filters or sorteds by some field """
    # this get a context['products', 'category', 'subcategory', 'query', 'available']
    context = filters.get_context_filtered_products(request)
    
    # optimized consult for products
    products = (
        context['products'].values(*filters.VALUES_DASHBOARD_PRODUCTS)
        .order_by('name', 'id').annotate(
            category_id=F("category__id"),
            subcategory_id=F("subcategory__id"),
            brand_id=F("brand__id"),
        )
    )

    # Serializar los productos de la página actual    page.object_list
    page_num = request.GET.get('page')
    products_page, pagination = filters.get_paginator(products=products, page_num=page_num, quantity=5)
    context['pagination'] = pagination
    
    serializer = ProductListSerializer(products_page, many=True, context={'favorites_ids': None})
    context['products'] = serializer.data
    return JsonResponse(context)
    

@admin_or_superuser_required
def get_dashboard(request, section_name):
    
    if section_name == "products":
        # this get a context['products', 'category', 'subcategory', 'query', 'available']
        context = filters.get_context_filtered_products(request)
        
        # this add to the context the keys 'brands', 'categories'
        context['brands'] = filters.get_serializer_brands(values=('id', 'name', 'is_default'), exclude_default=False)
        context['categories'] = filters.get_categories_n_subcategories(
            from_cache=True, from_dashboard=True,
            values_cat=('id', 'name', 'is_default'),
            values_sub=('id', 'name', 'is_default', 'category_id')
        )
        
        # optimized consult for products
        products = (
            context['products'].values(*filters.VALUES_DASHBOARD_PRODUCTS)
            .order_by('name', 'id').annotate(
                category_id=F("category__id"),
                subcategory_id=F("subcategory__id"),
                brand_id=F("brand__id"),
            )
        )

        # Serializar los productos de la página actual    page.object_list
        page_num = request.GET.get('page')
        products_page, pagination = filters.get_paginator(products=products, page_num=page_num, quantity=5)
        context['pagination'] = pagination
        
        serializer = ProductListSerializer(products_page, many=True, context={'favorites_ids': None})
        context['products'] = serializer.data
        return JsonResponse(context)
        
    if section_name == 'store':
        # Obtener el store con prefetch optimizado
        store = Store.objects.prefetch_related(
            Prefetch(
                'images', 
                queryset=StoreImage.objects.all().order_by('-main_image'),
                to_attr='all_images'
            ),
        ).get(id=1)
        
        active_headers = []
        inactive_headers = []
        active_banners = []
        inactive_banners = []
        for img in store.all_images:
            if img.image_type == 'header':
                active_headers.append(img) if img.available else inactive_headers.append(img)
                    
            elif img.image_type == 'banner':
                active_banners.append(img) if img.available else inactive_banners.append(img)

        context = {
            'active_headers': active_headers,
            'inactive_headers': inactive_headers,
            'active_banners': active_banners,
            'inactive_banners': inactive_banners,
        }
        
        html = render_to_string("dashboard/dash_store.html", context)
        return JsonResponse({"html": html})
        
        
    if section_name == 'categories':
        context = {}
        context['brands'] = filters.get_brands(use='panel_admin')
        context['categories'] = filters.get_categories_n_subcategories(use='panel_admin')
        html = render_to_string("dashboard/dash_categories.html", context)
        return JsonResponse({"html": html})
        

    context = {'sectionId': section_name}
    html = render_to_string("dashboard/dash_default.html", context)
            
    return JsonResponse({"html": html})


@admin_or_superuser_required
def main_dashboard(request):
    
    
    context = {
        'msg': 'Hola',
    }
    
    return render(request, "dashboard/dashboard.html", context)