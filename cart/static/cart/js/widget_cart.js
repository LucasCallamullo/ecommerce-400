

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/forms.js" />
/// <reference path="../../../../static/js/utils.js" />
/// <reference path="../../../../static/js/overlay-modal.js" />


// async function handleCartActions(productId, action, value=1) {
async function endpointsCartActions({ productId, action = 'add', quantity = 1, stock = 0 }) {
    try {
        // stupid check
        if (!productId) throw new Error("Faltan parámetros requeridos");

        // CART_DATA is a global variable from base.html
        const cartQty = parseInt(CART_DATA[productId]) || 0;
    
        // Depend of the action we can call some endpoint
        let endpoint = '';
        switch (action) {
            case 'add':
                // Verificar stock en frontend (opcional)
                if ( (cartQty + quantity) > stock ) {
                    openAlert("No hay suficiente stock", "red", 2000);
                    throw new Error("Stock insuficiente");
                }

                endpoint = window.BASE_URLS.addToCart;
                break;

            case 'substract':
                endpoint = window.BASE_URLS.substractToCart;
                break;

            case 'delete':
                endpoint = window.BASE_URLS.deleteToCart;
                break;
                
            default:
                throw new Error('Acción desconocida');
        }

        // Configuración de la petición dependiendo de la pagina ver-carrito
        const cartView = (window.location.pathname === '/ver-carrito/');
        const bodyParams = {
            product_id: productId,
            quantity: quantity,
            cart_qty: cartQty,
            cart_view: cartView.toString()    // 'true' 'false'
        };
        
        // Se realiza el fetch según el endpoint de la acción
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(bodyParams)
            // credentials: 'include'  // Descomenta si necesitas cookies/CORS
        });

        // recibimos json de respuesta
        const data = await response.json();
        if (!response.ok) {
            openAlert(data.message, 'red', 1500);   
            throw new Error('Network response was not ok');
        }

        // Actualización del carrito en frontend para verificaciones de stock
        if (action === 'add') {
            CART_DATA[productId] = (CART_DATA[productId] || 0) + quantity;
        } else if (action === 'substract') {
            CART_DATA[productId] = Math.max(0, (CART_DATA[productId] || 0) - quantity);
        } else if (action === 'delete') {
            delete CART_DATA[productId];
        }

        // Handle interactive alert // remember, all responses have this data
        openAlert(data.message, data.color, 1200);

        // This function update content with html responses
        widgetCartUpdateHtml(data, cartView);

        // if you are in the cart-view-page update the view
        // typeof == only use the function if is define in my current context
        if (cartView && typeof updateCartView === 'function') {
            updateCartView(data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}


/**
 * Updates the cart widget view with new data from the server.
 *
 * This function replaces the cart's total price and item list with the updated HTML,
 * updates any UI badges, reassigns necessary event listeners,
 * and optionally opens the cart overlay if the user is not on the full cart page.
 *
 * @param {Object} data - The JSON response containing the updated cart data.
 * @param {number} data.total - The new total price of the cart.
 * @param {number} data.qty_total - The updated total quantity of items.
 * @param {string} data.widget_html - The HTML markup for the updated cart items.
 * @param {boolean} cartView - Indicates whether the current page is the cart page.
 *                              If false, the function will open the cart overlay.
 */
function widgetCartUpdateHtml(data, cartView) {
    // Determine device index: Mobile uses index 0, Desktop uses index 1
    const index = (window.innerWidth <= 992) ? 0 : 1;

    // On Desktop, update the badge showing the total quantity of items
    if (index === 1) {
        const badgeCantTotal = document.getElementById('badge-cart-button');
        badgeCantTotal.textContent = `${data.qty_total}`;
    }

    // Get all total price elements and cart content containers
    const cTotals = document.querySelectorAll('.total__widget__cart');
    const cConts = document.querySelectorAll('.cont-cart__widget');

    // Format and update the total price for each total element
    const totalPrice = formatNumberWithPoints(data.total);
    cTotals.forEach(t => { t.textContent = `$${totalPrice}` });

    // Replace the inner HTML of each cart content container
    cConts.forEach(c => { c.innerHTML = data.widget_html; });

    // If not on the cart page, open the cart overlay if it is not already open
    if (!cartView) {
        const cartContainers = document.querySelectorAll('.cart-cont-overlay');
        const isOpenCart = cartContainers[index].getAttribute('data-state') === 'open';

        if (!isOpenCart) {
            const cartButtons = document.querySelectorAll('.cart-button');
            cartButtons[index].click();
        }
    }
}


/**
 * Sets up delegated event listeners on multiple cart container elements.
 * 
 * This function attaches a single 'submit' event listener to each container,
 * instead of binding individual listeners to each button or form.
 * 
 * It uses event delegation: the listener checks if the submitted form matches 
 * one of the expected form types (add, subtract, delete). This approach ensures 
 * that new forms dynamically added via innerHTML replacement will still be handled 
 * without needing to re-assign individual listeners.
 * 
 */
function widgetCartButtons() {
    // contsWidgetCart - A list of cart container elements where cart forms are rendered dynamically.
    const contsWidgetCart = document.querySelectorAll('.cont-cart__widget ');

    contsWidgetCart.forEach(container => {
        container.addEventListener('submit', async (e) => {
            // Only handle form submissions
            if (!e.target.matches('form')) return;

            e.preventDefault();

            const form = e.target;    
            const productId = form.dataset.index;
            const stock = parseInt(form.dataset.stock);

            // Determine action type based on form's class
            let action, value = 1;

            if (form.classList.contains('form-to-add')) {
                action = 'add';
            } else if (form.classList.contains('form-to-less')) {
                action = 'substract';
            } else if (form.classList.contains('form-to-delete')) {
                action = 'delete';
            } else {
                return; // Form does not match a recognized cart action
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
    });
}


/**
 * Handles the opening behavior of the shopping cart widget.
 * 
 * - Blocks the cart from opening on specific pages (order and payment).
 * - Shows an alert instead if the user tries to open it on those pages.
 * - On allowed pages, connects each cart button with its corresponding
 *   cart container, overlay, and close button using `setupToggleableElement`.
 */
function widgetCartOpenEvent() {
    // Define the pages where the cart widget should NOT be activated
    const blockedPages = [
        "/order/",       // Blocked: order page
        "/payment-view/" // Blocked: payment view page
    ];

    // Get the current page path
    const currentPath = window.location.pathname;

    // If the current page is blocked, disable cart functionality
    if (blockedPages.includes(currentPath)) {
        // Find all cart buttons
        const cBtns = document.querySelectorAll('.cart-button');

        // Add a click event listener to each cart button to show an alert
        cBtns.forEach((Btn) => {
            Btn.addEventListener('click', () => {
                openAlert('No puedes usar el Carrito durante el pedido y/o pago.', 'green', 2000);
            });
        });

        // Stop the function to prevent further setup
        return;
    }

    // Get all cart buttons and related elements
    const cBs = document.querySelectorAll('.cart-button');         // Cart buttons
    const cCs = document.querySelectorAll('.cart-cont-overlay');   // Cart container overlays
    const cOs = document.querySelectorAll('.cart-overlay');        // Cart content overlays
    const cBCs = document.querySelectorAll('.close-widget-cart');  // Cart close buttons

    /* / stupid Check to new develop
    if (cBs.length !== cCs.length || cBs.length !== cOs.length || cBs.length !== cBCs.length) {
        console.error('The number of buttons, containers, overlays, and close buttons does not match.');
    } */

    // For each cart button, associate it with its corresponding elements
    cBs.forEach((Btn, index) => {
        const cont = cCs[index];
        const overlay = cOs[index];
        const btnClose = cBCs[index];

        // Setup toggle behavior for this cart widget
        setupToggleableElement({
            toggleButton: Btn,
            closeButton: btnClose,
            element: cont,
            overlay: overlay,
        });
    });
}


/* ==========================================================================================
                   "Función" para Eventos de mostrar y ocultar el carrito
========================================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // open events
    widgetCartOpenEvent();

    // Reasignar eventos al cargar la pagina
    widgetCartButtons();
});