

"""  

# ======================================================================================
#                FOR CONFIG YOUR CUSTOM USER MODEL
# ======================================================================================

# NOTE (OPTIONAL) Regarding creating a user system, in case you do so
# there is a very good example in ecommerce/users/models.py of how to do it and possible
# errors that might arise, recommended even if you don't create a custom user from the start
# modify the default user, check the example model

# modify settings.py to use a custom user model

# to use our custom user model, modify in settings.py -> add
AUTH_USER_MODEL = 'users.CustomUser'

# TODO EXAMPLE:
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

# Custom User Manager responsible for creating users and superusers
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        # Raise an error if no email is provided
        if not email:
            raise ValueError('The Email field must be set')
        
        # Normalize the email to ensure correct format
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        # Set the encrypted password
        user.set_password(password)
        # Save the user to the database
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        # Ensure that superusers have specific permissions
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Call the regular user creation for the superuser
        return self.create_user(email, password, **extra_fields)


# Modelo de usuario personalizado que reemplaza al modelo por defecto de Django
class CustomUser(AbstractUser):
    """
    Notes: 
        Para el futuro saber que este modelo se pudo realizar con migraciones personalizadas,
        primero hacer makemigrations y despues consultar como seguir en base a los campos 
        eliminados y/o faltantes, ver ejemplo en users/migrations/0002_xxx
        
        En caso de que salga un error de inconsistencia de migraciones como este
            django.db.migrations.exceptions.InconsistentMigrationHistory: Migration admin.0001_initial 
            is applied before its dependency users.0001_initial on database 'default'.
        
        la solucion más proxima es ir a 
            # settigs.py y comentar la app del admin
                # 'django.contrib.admin',
                
            # urls.py tambien ir y comentar el include del admin
                # path('admin/', admin.site.urls),
                
            # aplicar migraciones con alguna personalizada, como la anterior
                # makemigrations (opcional)
                # migrate users
            
            # descomentar todo lo anterior(lo de admin) y volver a realizar migraciones
                # makemigrations
                # migrate 
        
        fuente: 
            https://stackoverflow.com/questions/44651760/django-db-migrations-exceptions-inconsistentmigrationhistory
    """
    # Remove the 'username' field from the default model
    username = None 

    email = models.EmailField(unique=True)  # The email field must be unique for each user
    cellphone = models.CharField(max_length=20, blank=True, null=True)  # Phone number (optional)
    province = models.CharField(max_length=50, blank=True, null=True)  # User's province (optional)
    address = models.CharField(max_length=255, blank=True, null=True)  # User's address (optional)

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('buyer', 'Buyer'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')

    """ 
    Other fields:
    first_name: User's first name.
    last_name: User's last name.
    is_active: Boolean indicating if the user is active.
    is_staff: Boolean indicating if the user has admin privileges.
    is_superuser: Boolean indicating if the user is a superuser.
    last_login: Date and time of the user's last login.
    date_joined: Date and time when the user registered.
    groups: Groups the user belongs to.
    user_permissions: Specific permissions assigned to the user.
    """

    # Use email instead of 'username' for authentication
    USERNAME_FIELD = "email"

    # No additional fields are required to create a superuser (by default only email and password are needed)
    REQUIRED_FIELDS = []  # If you add extra fields, list them here

    # Assign the CustomUserManager to handle user creation
    objects = CustomUserManager()

    # Method to represent the user as a string (using email)
    def __str__(self):
        return self.email  # Returns the email address as the user's string representation