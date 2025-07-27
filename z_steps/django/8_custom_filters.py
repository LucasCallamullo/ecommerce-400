

""" 
# ======================================================================================
#                FOR CREATE CUSTOM FILTERS TO USE IN TEMPLATES
# ======================================================================================

# NOTE (OPTIONAL) Podes crear tus propios filter_tags de esta forma
# crear en tu app 'name_app'/template_tags/custom_filters.py

# NOTE en custom_filters.py hacer algo como

from django import template
register = template.Library()

@register.filter
def intdot(value):
    # Formatea números con un punto como separador de miles.
    
    try:
        value = float(value)
        return f"{value:,.0f}".replace(",", ".")
    except (ValueError, TypeError):
        return value
        
# NOTE para usar en los templates debes cargarlo y acceder por ejemplo 
{% load custom_filters %}

<h1> Price: $ {{ value.price|intdot }} </h1>
"""