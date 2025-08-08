
window.CART_BY_ID = {};


/**
 * Renders the shopping cart widgets in the page, including both mobile and desktop views.
 * Also updates the total item count badge and total price displays, and handles cart overlay toggling.
 */
function renderWidgetCart() {

    /**
     * Performs post-render updates such as:
     * - Updating the total quantity badge on desktop
     * - Updating total price displays
     * - Automatically opening the cart overlay on non-cart pages if it's closed
     */
    function renderWidgetPost() {
        // Determine device index: Mobile uses index 0, Desktop uses index 1
        const index = (window.innerWidth <= 992) ? 0 : 1;
        const header = document.querySelector('header');

        // On Desktop, update the badge showing the total quantity of items in the cart
        if (index === 1) {
            const badgeCantTotal = header.querySelector('#badge-cart-button');
            badgeCantTotal.textContent = `${window.CART_DATA.cart_quantity}`;
        }

        // Update all elements that display the total price in the cart widget
        const cTotals = header.querySelectorAll('.total__widget__cart');
        const totalPrice = formatNumberWithPoints(window.CART_DATA.cart_price);
        cTotals.forEach(t => { t.textContent = `$${totalPrice}` });

        // If the user is not on the cart page, check if the cart overlay is closed,
        // and open it automatically on either mobile or desktop.
        const cartView = (window.location.pathname === '/ver-carrito/');
        if (!cartView) {
            const cartContainer = header.querySelector('.cart-cont-overlay');
            const isOpenCart = cartContainer.getAttribute('data-state') === 'open';

            if (!isOpenCart) {
                const cartButtons = header.querySelectorAll('.cart-button');
                cartButtons[index].click();
            }
        }
    }

    /**
     * Creates a cart item card element from a product object.
     * Escapes data for safety and formats the price with thousands separators.
     * 
     * @param {Object} product - Product data with keys: id, name, image, price, quantity, stock
     * @returns {HTMLElement} - A DOM element representing the cart item
     */
    function renderWidget(product) {
        const prod = deepEscape(product);

        // Use a fallback image if the product image URL is relative or missing
        const imgSrc = prod.image.startsWith('http') ? prod.image : 'default-image.jpg';
        const price = formatNumberWithPoints(prod.price);
        const url = window.BASE_URLS.productDetail.replace('0', prod.id).replace('__SLUG__', prod.slug)
        
        const cardWidget = /*html*/`
            <form class="d-grid cont-cart__card mb-3" data-index="${prod.id}" data-stock="${prod.stock}">

                <a class="cont-img-100-off" href="${url}">
                    <img class="img-scale-down" src="${imgSrc}" alt="${prod.name}">
                </a>

                <a class="font-sm main-ref bolder mt-1" href="${url}">${prod.name}</a>

                <button class="btn btn-close btn-24 justify-self-end mt-1 me-1" type="submit" data-action="delete">
                    <i class="ri-close-fill font-lg"></i>
                </button>

                <span class="d-flex text-start ms-2 gap-1 bolder">
                    ${prod.quantity}
                    <i class="ri-close-line font-lg"></i>
                    $ ${price}
                </span>
                    
                <div class="cont-numeric-add-less cont-space-between">
                    <button class="btn btn-28 scale-on-touch" type="submit" data-action="substract">
                        <i class="ri-subtract-fill font-lg text-primary"></i>
                    </button>

                    <span class="cart-item-qty">${prod.quantity}</span>
                    
                    <button class="btn btn-28 scale-on-touch" type="submit" data-action="add">
                        <i class="ri-add-fill font-lg text-primary"></i>
                    </button>
                </div>
            </form>
        `;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardWidget;
        return wrapper.firstElementChild;
    }

    // Select all containers where the cart widget should be rendered (e.g., mobile and desktop)
    const widgets = document.querySelectorAll('.cont-cart__widget');
    const fragment = document.createDocumentFragment();

    // Render each product as a widget card, append to a document fragment for efficient DOM insertion
    window.CART_DATA.cart.forEach(product => {
        fragment.appendChild(renderWidget(product));

        // Optionally keep track of quantity by product ID for quick lookups (assuming CART_BY_ID exists)
        CART_BY_ID[product.id] = product.quantity;
    });

    // Clear existing content and append cloned widget cards to each container (mobile and desktop)
    widgets.forEach((container) => {
        container.innerHTML = '';
        container.appendChild(fragment.cloneNode(true)); // clone the fragment for each container
    });

    // Perform post-render updates (badges, totals, open overlay)
    renderWidgetPost();
}
