

from django.shortcuts import render
from django.http import JsonResponse
from django.template.loader import render_to_string

from products import filters
from users.permissions import admin_or_superuser_required
from django.db.models import Prefetch

@admin_or_superuser_required
def dash_filter_products(request):
    """ this view return a queryset products filters or sorteds by some field """
    context = filters.get_context_filtered_products(request)
    
    # sort by is ('name', 'category__name', 'available', 'updated_at', 'stock', 'price') OR None
    sort_by = request.GET.get('sort_by')
    sorted_flag = request.GET.get('sorted')
    
    # this get a context['products', 'category', 'subcategory', 'query', 'available']
    context = filters.get_context_dashboard_products(context, sort_by=sort_by, sorted_flag=sorted_flag)
    
    context['brands'] = filters.get_brands(use='panel_admin')
    context['categories'] = filters.get_categories_n_subcategories(use='panel_admin')
    
    html = render_to_string("dashboard/table_products.html", context)
    return JsonResponse({"html": html})


@admin_or_superuser_required
def get_dashboard(request, section_name):
    from home.models import Store, StoreImage
    
    if section_name == "products":
        # this get a context['products', 'category', 'subcategory', 'query', 'available']
        context = filters.get_context_filtered_products(request)
        context = filters.get_context_dashboard_products(context)
        
        # this add to the context the keys 'brands', 'categories'
        context['brands'] = filters.get_brands(use='panel_admin')
        context['categories'] = filters.get_categories_n_subcategories(use='panel_admin')
        html = render_to_string("dashboard/dash_products.html", context)
        return JsonResponse({"html": html})
        
        
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