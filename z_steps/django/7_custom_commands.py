

""" 
# ======================================================================================
#                FOR CREATE YOUR ESPECIAL COMMANDS TO USE 
# ======================================================================================

# NOTE (OPTIONAL) create your own commands to execute

# Create the folder inside 'name_app'/managements/commands/'name_command.py'
# Include this base to run in name_command

import pandas as pd
from django.conf import settings
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Your custom command"
    
    def handle(self, *args, **kwargs):
        # Your code command
        
# To run it, use the console -> python manage.py name_command


# ======================================================================================
#                FOR CREATE CUSTOMS SCRIPTS/
# ======================================================================================

# NOTE (OPTIONAL) You can create custom scripts to make adjustments
# or to import them for commands in some cases, utils for deployment work
# check example in e-commerce/scripts/ scripts*.py

# At the beginning of your TODO # script.py add something like

# Add the root project directory to the PYTHONPATH so Django can find the modules

import os, sys, django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

# export the necessary models to work with the ORM

def load_store_init():
    # Your custom code
"""