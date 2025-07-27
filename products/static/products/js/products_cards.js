

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/utils.js" />


/**
 * Populates the product modal with dynamic product data.
 *
 * @param {HTMLElement} modal - The modal element container.
 * @param {Object} product - The product data object (must contain name, price, discount, stock, slugs, etc.).
 */
function populateProductModal(modal, product) {
    // --- Title and detail link ---
    const title = modal.querySelector('.modal-title');
    title.textContent = product.name;

    const detailPage = modal.querySelector('.modal-id');
    detailPage.href = window.TEMPLATE_URLS.productDetail
        .replace('0', product.id)
        .replace('__SLUG__', product.slug);

    // --- Discount logic ---
    const discountLabel = modal.querySelector('.modal-discount');
    const discountGroup = modal.querySelectorAll('.modal-group-discount');

    const discount = parseInt(product.discount);
    const rawPrice = Number(product.price);
    let finalPrice = rawPrice;

    if (discount > 0) {
        finalPrice = rawPrice - (rawPrice * discount / 100);

        discountGroup.forEach(label => label.classList.remove('d-none'));
        discountLabel.textContent = `% ${discount} OFF`;

        const priceFormatted = formatNumberWithPoints(rawPrice);
        const priceOffer = modal.querySelector('.modal-price-offer');
        priceOffer.textContent = `$${priceFormatted}`;
    } else {
        discountGroup.forEach(label => label.classList.add('d-none'));
    }

    const finalPriceFormatted = formatNumberWithPoints(finalPrice);
    const priceLabel = modal.querySelector('.modal-price');
    priceLabel.textContent = `$${finalPriceFormatted}`;

    // --- Stock info ---
    const stockLabel = modal.querySelector('.modal-stock');
    const numStock = parseInt(product.stock);

    stockLabel.classList.remove('bold-red', 'bold-orange', 'bold-green');
    if (numStock === 0) {
        stockLabel.classList.add('bold-red');
        stockLabel.textContent = 'No disponible';
    } else if (numStock <= 3) {
        stockLabel.classList.add('bold-orange');
        stockLabel.textContent = 'Stock Bajo';
    } else {
        stockLabel.classList.add('bold-green');
        stockLabel.textContent = 'Disponible';
    }

    // --- Main image ---
    modal.querySelector('.modal-img').src = product.image;

    // --- Category ---
    const catLabel = modal.querySelector('.modal-cat');
    const catLink = modal.querySelector('.modal-catSlug');
    const catGroup = modal.querySelector('.modal-cat-group');

    if (product.catSlug !== 'sin-categoria') {
        catLabel.textContent = product.cat;
        catLink.href = window.TEMPLATE_URLS.category.replace('__CAT__', product.catSlug);
    } else {
        catGroup.classList.add('d-none');
    }

    // --- Subcategory ---
    const subcatLabel = modal.querySelector('.modal-subcat');
    const subcatLink = modal.querySelector('.modal-subcatSlug');
    if (product.subcatSlug !== 'sin-subcategoria') {
        subcatLabel.textContent = product.subcat;
        subcatLink.href = window.TEMPLATE_URLS.subcategory
            .replace('__CAT__', product.catSlug)
            .replace('__SUBCAT__', product.subcatSlug);
    } else {
        subcatLink.classList.add('d-none');
    }

    // --- Brand ---
    const brandLink = modal.querySelector('.modal-brandSlug');
    const brandLabel = modal.querySelector('.modal-brand');
    const brandGroup = modal.querySelector('.modal-stock-group');

    if (product.brandSlug !== 'sin-marca') {
        brandLabel.textContent = product.brand;
        brandLink.href = window.TEMPLATE_URLS.brand.replace('__BRAND__', product.brandSlug);
    } else {
        brandGroup.classList.add('d-none');
    }
}



/**
 * Assigns delegated click event to handle product card modals within a container.
 * Ensures only one event listener is attached to the container to avoid duplicates.
 * Dynamically looks up modal elements on each click to handle dynamic content changes.
 * Uses a Map to prevent multiple setups for the same button.
 * 
 * @param {HTMLElement} container - The parent container holding product cards.
 */
function assignProductCardsModals(container) {
    // Map to track buttons that have already been initialized to prevent duplicate setup
    const initializedButtons = new Map();

    // Attach a single delegated click listener to the container if not already assigned
    if (!container._hasModalClickListener) {
        container.addEventListener('click', (e) => {
            // Find the closest button with the 'corner-box' class from the click target
            const btn = e.target.closest('button.corner-box');
            if (!btn) return;

            // Dynamically retrieve modal elements each time a button is clicked
            const modal = document.getElementById('product-card__modal');
            const overlay = document.getElementById('product-card__overlay');
            const btnCloseModal = modal.querySelector('.btn-close');

            // If this button has not been initialized yet, set up the toggleable modal
            if (!initializedButtons.has(btn)) {
                setupToggleableElement({
                    toggleButton: btn,
                    closeButton: btnCloseModal,
                    element: modal,
                    overlay: overlay,
                    flagStop: true,
                    onOpenCallback: () => {
                        // Parse product data from button dataset and populate the modal content
                        const product = JSON.parse(btn.dataset.product);
                        populateProductModal(modal, product);
                    }
                });
                initializedButtons.set(btn, true);
            }

            // Simulate a click on the button to open the modal
            btn.click();
        });

        // Mark container as having the modal click listener attached to avoid duplicates
        container._hasModalClickListener = true;
    }
}


/**
 * Lógica para añadir o quitar favoritos de un producto.
 * 
 * @param {string} productId - ID del producto.
 * @param {HTMLButtonElement} btn - Botón de submit que activó el formulario.
 */
async function formFavoritesEvents(productId, btn) {

    // Si no está logueado, muestra alerta y detiene el flujo con un error.
    if (!AUTH_STATUS) {
        openAlert('Debe logearse para guardar en Favoritos.', 'red', 2500);
        return;
    }

    try {
        const url = window.TEMPLATE_URLS.favorites.replace('{product_id}', productId);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Django CSRF
            },
            body: JSON.stringify({ product_id: productId }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Si la API devuelve error de lógica
            openAlert('Error al guardar favorito.' || data.detail, 'red', 1500);
            return;
        }

        // Alternar clases visuales
        const isLiked = btn.classList.contains("liked");
        const icon = btn.querySelector('i');

        if (isLiked) {
            btn.classList.remove("liked");
            icon.classList.replace(ICONS.heart, ICONS.heartEmpty);
            openAlert('Producto eliminado como Favorito.', 'red', 1500);
        } else {
            btn.classList.add("liked");
            icon.classList.replace(ICONS.heartEmpty, ICONS.heart);
            openAlert('Producto agregado como Favorito!', 'green', 1500);
        }

    } catch (error) {
        console.error('Error:', error);
        throw error; // Permite manejarlo fuera si se necesita
    }
}


/**
 * Assigns all product card related events within a given container.
 * 
 * This function is designed to work with dynamic containers (e.g., Swiper carousels)
 * and attaches:
 *   - Submit handlers for "Favorite" buttons inside forms.
 *   - Submit handlers for "Add to Cart" buttons inside forms.
 *   - Click handlers for "corner-box" buttons that open product modals.
 * 
 * By passing a specific container, the queries are scoped locally,
 * which improves performance and allows for multiple independent instances.
 * 
 * @param {HTMLElement} container - The parent element that contains product cards.
 */
function assignProductCardsForms(container) {

    // --- Favorite button (heart icon) forms ---
    const btnsLikes = container.querySelectorAll('.form-btn__like');
    btnsLikes.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = form.dataset.index;
            const btn = e.submitter || form.querySelector('button[type="submit"]');

            await handleGenericFormBase({
                form: form,
                submitCallback: async () => formFavoritesEvents(productId, btn),
                flag_anim: false, // Enable spinner animation if needed
            });
        });
    }); 

    // --- "Add to Cart" forms ---
    const btnsAddPc = container.querySelectorAll('.product-card__extender-btn');
    btnsAddPc.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = form.dataset.index;
            const stock = parseInt(form.dataset.stock);

            await handleGenericFormBase({
                form,
                submitCallback: async () => {
                    await endpointsCartActions({
                        productId: productId,
                        action: 'add',
                        quantity: 1,
                        stock: stock
                    });
                },
            });
        });
    });
}
