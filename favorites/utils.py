

from products.models import Product

def get_favs_products(user, return_qs=False, only_ids=True):
    """
    Retrieves a user's favorite products in different formats depending on the parameters.

    Args:
        user (User): The authenticated user instance.
        return_qs (bool): If True, returns a Django QuerySet of Product objects.
        only_ids (bool): If True, returns only the set of favorite product IDs.

    Returns:
        set[int] | set[Product] | QuerySet[Product] | None:
            - Set of product IDs if only_ids is True (default).
            - QuerySet of Product objects if return_qs is True.
            - Set of full Product objects if both flags are False.
            - None if the user is not authenticated.
    """
    # Return None if the user is not logged in
    if not user.is_authenticated:
        return None

    # Return a set of product IDs (faster and lighter for comparisons)
    if only_ids and not return_qs:
        return set(user.favorites.values_list('product', flat=True))

    # Return a QuerySet of Product objects (allows further filtering and chaining)
    if return_qs:
        return Product.objects.filter(id__in=user.favorites.values_list('product', flat=True))

    # Return a set of full Product objects using select_related to avoid extra DB hits
    user_favorites = user.favorites.select_related('product')
    return {fav.product for fav in user_favorites}
