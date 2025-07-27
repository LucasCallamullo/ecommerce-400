

# NOTE some utils commands
#    pip freeze > requirements.txt
#    .\.venv\Scripts\Activate.ps1


""" 
# ======================================================================================
#                FOR SANITIZAR HTML CONTENT IN SOME FIELDS
# ======================================================================================
pip install bleach

# NOTE use in a serializer from drf o endpoint in django
import bleach

ALLOWED_TAGS = ['p', 'strong', 'em', 'ul', 'li', 'ol', 'br', 'span']
ALLOWED_ATTRIBUTES = {
    '*': ['style'],  # o podés eliminar esto si no querés atributos
}

def validate_description(self, value):
    clean_html = bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True  # elimina las etiquetas que no están permitidas
    )
    return clean_html
    
# html
<p>{{ name }}</p> {# esto escapa cualquier cosa rara automáticamente #}

<p>{{ description|safe }}</p> {# esto NO escapa, así que cuidado #}

# METODO SIN BLEACH
import re

def validate_description(self, value):
    if re.search(r'<[^>]+>', value):
        raise serializers.ValidationError("El campo 'description' no puede contener etiquetas HTML.")
    return value
"""