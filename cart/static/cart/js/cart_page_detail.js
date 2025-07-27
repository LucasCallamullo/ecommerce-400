/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../favorites/static/favorites/js/add_favorites.js" />


/**
 * Attaches a submit event listener to the given cart table container.
 * 
 * This function listens for form submissions within the `tableCartView` element and handles different
 * types of cart actions based on the class of the submitted form:
 * 
 * - `.form-to-like`   → Adds/removes product from favorites.
 * - `.form-to-add`    → Increases product quantity in cart.
 * - `.form-to-less`   → Decreases product quantity in cart.
 * - `.form-to-delete` → Removes product entirely from cart.
 * 
 * It delegates the handling to `handleGenericFormBase` with appropriate callbacks, and also uses 
 * `e.submitter` to access the actual button that triggered the submit.
 *
 * @param {HTMLElement} tableCartView - The DOM element representing the container for cart forms.
 */
function formsAddLessCartView(tableCartView) {

    tableCartView.addEventListener('submit', async (e) => {
        // Only handle form submissions
        if (!e.target.matches('form')) return;

        e.preventDefault();
        const form = e.target;
        const productId = form.dataset.index;

        /* ---- Handle product favorite (like) form ---- */
        if (form.classList.contains('form-to-like')) {
            const btn = e.submitter;  // The button that triggered the form submission
            await handleGenericFormBase({
                form: form,
                submitCallback: async () => formFavoritesEvents(productId, btn),
                flag_anim: false, // Disable spinner animation
            });
            return;
        }

        /* ---- Handle cart actions (add, subtract, delete) ---- */
        const stock = parseInt(form.dataset.stock) || 0;
        let action, value = 1;

        if (form.classList.contains('form-to-add')) {
            action = 'add';
        } else if (form.classList.contains('form-to-less')) {
            action = 'substract';
        } else if (form.classList.contains('form-to-delete')) {
            action = 'delete';
        } else {
            return; // Unrecognized form type
        }

        await handleGenericFormBase({
            form: form,
            submitCallback: async () => {
                await endpointsCartActions({
                    productId: productId,
                    action: action,
                    quantity: value,
                    stock: stock
                });
            }
        });
    });
}


/**
 * Updates the cart view in the UI based on the response data.
 *
 * @param {Object} data - An object containing updated cart information.
 * @param {number} data.total - The total price of the cart.
 * @param {string} data.cart_view_html - The new HTML to replace the current cart view.
 */
function updateCartView(data) {
    // Update all elements showing the total cart price
    const totals = document.querySelectorAll('.total-cart-view');
    const precioTotal = formatNumberWithPoints(data.total);
    totals.forEach(t => t.textContent = `$${precioTotal}`);

    // Replace the current cart table content with the updated HTML
    const tableCart = document.getElementById('cart-view-container');
    tableCart.innerHTML = data.cart_view_html;
}


/**
 * Initializes event listeners once the DOM is fully loaded.
 * 
 * - Attaches cart-related form functionality to the cart view container.
 * - Handles placeholders for future features such as coupon application and cart update.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    const tableCartView = document.getElementById('cart-view-container');
    // Attach event delegation logic to handle add/subtract/delete/favorite actions in cart
    formsAddLessCartView(tableCartView);

    /* Form Cupon hacer algun día */
    const formCupon = document.getElementById('form-coupon');
    formCupon.addEventListener('submit', (e) => {
        e.preventDefault();
        openAlert('trabajando en esto todavía.', 'orange', 1500);
    });

    /* Form Update Carrito hacer algun día */
    const formUpdateCart = document.getElementById('form-update-cart');
    formUpdateCart.addEventListener('submit', (e) => {
        e.preventDefault();
        openAlert('trabajando en esto todavía.', 'orange', 1500);
    });
});