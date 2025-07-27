

from django import template
from django.utils.html import escapejs
from django.utils.safestring import mark_safe
import json

register = template.Library()

@register.filter
def escape_data(value):
    """Escapa para atributos data-* y Unicode de forma segura."""
    if value is None or value == "None" or str(value).lower() == "none":
        return ''
            
    value = str(value)
    value = escapejs(value)
    value = (
        value.replace('"', '&quot;')
             .replace("'", '&#39;')
             .replace('<', '&lt;')  # Nuevo: protege contra HTML
             .replace('>', '&gt;')  # Nuevo: protege contra HTML
             .replace('\u2028', '\\u2028')
             .replace('\u2029', '\\u2029')
             .replace('&', '&amp;')  # Nuevo: escapa ampersands primero
    )
    return mark_safe(value)


@register.filter
def remove_param(query_dict, param_name):
    """Remove a GET param and return a query string."""
    if hasattr(query_dict, 'copy'):
        query_dict = query_dict.copy()
        query_dict.pop(param_name, None)
        return query_dict.urlencode()
    return ''


@register.filter
def intdot(value):
    """
        Formatea números con un punto como separador de miles.
    """
    try:
        value = float(value)
        
        if value == 0:
            return f"0"
        
        return f"{value:,.0f}".replace(",", ".")
    except (ValueError, TypeError):
        return value


@register.filter
def multiply(value, arg):
    """
    Multiplica dos valores.
    :param value: El primer valor (precio).
    :param arg: El segundo valor (cantidad).
    :return: El resultado de la multiplicación.
    """
    try:
        value = float(value) * int(arg)
        return f"{value:,.0f}".replace(",", ".")
    except (ValueError, TypeError):
        return 0
    