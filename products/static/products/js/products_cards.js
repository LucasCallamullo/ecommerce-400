

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/utils.js" />
/// <reference path="../../../../favorites/static/favorites/js/add_favorites.js" />


/**
 * Populates the product modal with dynamic product data.
 *
 * @param {HTMLElement} modal - The modal element container.
 * @param {Object} product - The product data object (must contain name, price, discount, stock, slugs, etc.).
 */
function populateModalCard(modal, product_obj) {
    const product = deepEscape(product_obj);

    // --- Title and detail link ---
    const title = modal.querySelector('.modal-title');
    title.textContent = product.name;

    const detailPage = modal.querySelector('.modal-detail');
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
    stockLabel.classList.remove('bold-red', 'bold-orange', 'bold-green');
    
    if (product.stock === 0) {
        stockLabel.classList.add('bold-red');
        stockLabel.textContent = 'No disponible';
    } else if (product.stock <= 3) {
        stockLabel.classList.add('bold-orange');
        stockLabel.textContent = 'Stock Bajo';
    } else {
        stockLabel.classList.add('bold-green');
        stockLabel.textContent = 'Disponible';
    }

    const form = document.getElementById('form-modal-add');
    form.dataset.stock = product.stock;
    form.dataset.id = product.id;

    // --- Images ---
    modal.querySelector('.modal-img').src = product.main_image;

    // --- Category ---
    const catLabel = modal.querySelector('#modal-category');
    const catGroup = modal.querySelector('.modal-cat-group');

    if (product.category != null) {
        catLabel.textContent = product.category.name;
        catLabel.href = window.TEMPLATE_URLS.category.replace('__CAT__', product.category.slug);
    } 
    catGroup.style.display = (product.category) ? 'flex' : 'none';
    
    // --- Subcategory ---
    const subcatLabel = modal.querySelector('#modal-subcategory');
    if (product.subcategory != null) {
        subcatLabel.textContent = product.subcategory.name;
        subcatLabel.href = window.TEMPLATE_URLS.subcategory
            .replace('__CAT__', product.category.slug)
            .replace('__SUBCAT__', product.subcategory.slug);
    } 
    subcatLabel.style.display = (product.subcategory) ? 'flex' : 'none';

    // --- Brand ---
    const brandLabel = modal.querySelector('.modal-brand');
    const brandGroup = modal.querySelector('.modal-brand-group');

    if (product.brand != null) {
        brandLabel.textContent = product.brand.name;
        brandLabel.href = window.TEMPLATE_URLS.brand.replace('__BRAND__', product.brand.slug);
    }
    brandGroup.style.display = (product.brand) ? 'block' : 'none';

    imagesModalFetch(modal, product)
}

async function imagesModalFetch(modal, product) {
    
    let container = modal.querySelector('#modal-lil-images');
    container.innerHTML = '';

    const url = window.TEMPLATE_URLS.productImages.replace('{product_id}', `${product.id}`);
    const response = await fetch(url);
    const data = await response.json();
    const images = data.images || [];

    const cardMain = /*html*/`
        <div class="cont-img-100-off cont-lil-prod-img border-main">
            <img class="img-scale-down" src=${product.main_image} alt="Image">
        </div>
    `;
    container.insertAdjacentHTML('beforeend', cardMain);

    images.forEach((img, index) => {
        if (index > 2) return;

        const cardHtml = /*html*/`
            <div class="cont-img-100-off cont-lil-prod-img">
                <img class="img-scale-down" src=${img} alt="Image">
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    productImagesChange(modal, container);
}


function productImagesChange(modal, container) {
    // Limpiar eventos anteriores primero
    const leftBtnArrow = modal.querySelector(".left");
    const rightBtnArrow = modal.querySelector(".right");
    
    if (leftBtnArrow && leftBtnArrow._clickHandler) {
        leftBtnArrow.removeEventListener("click", leftBtnArrow._clickHandler);
    }
    
    if (rightBtnArrow && rightBtnArrow._clickHandler) {
        rightBtnArrow.removeEventListener("click", rightBtnArrow._clickHandler);
    }

    let currentIndex = 0;

    // Get all small image containers
    const smallImages = container.querySelectorAll(".cont-lil-prod-img");
    const mainImage = modal.querySelector("#prod-main-image");

    /**
     * Updates the main product image and active thumbnail class
     * @param {number} index - Index of the image to show
     */
    function changeMainImage(index) {
        currentIndex = index;

        const imageElement = smallImages[index].querySelector(".img-scale-down");
        if (!imageElement) return;

        mainImage.src = imageElement.src;

        // Update active class on thumbnails
        smallImages.forEach((cont, i) => {
            cont.classList.toggle("active", i === index);
        });
    }

    // Assign click event to thumbnails
    smallImages.forEach((container, index) => {
        container.addEventListener("click", () => changeMainImage(index));
    });

    // Eventos para flechas con referencia limpia
    if (leftBtnArrow) {
        const leftHandler = () => {
            const newIndex = (currentIndex - 1 + smallImages.length) % smallImages.length;
            changeMainImage(newIndex);
        };
        leftBtnArrow._clickHandler = leftHandler;
        leftBtnArrow.addEventListener("click", leftHandler);
    }

    if (rightBtnArrow) {
        const rightHandler = () => {
            const newIndex = (currentIndex + 1) % smallImages.length;
            changeMainImage(newIndex);
        };
        rightBtnArrow._clickHandler = rightHandler;
        rightBtnArrow.addEventListener("click", rightHandler);
    }
    // Initialize with the first image
    changeMainImage(0);
}


/**
 * Assigns delegated click event to handle product card modals within a container.
 * Ensures only one event listener is attached to the container to avoid duplicates.
 * Dynamically looks up modal elements on each click to handle dynamic content changes.
 * Uses a Map to prevent multiple setups for the same button.
 * 
 * @param {HTMLElement} container - The parent container holding product cards.
 */
function productCardModalEvent(container) {

    // Dynamically retrieve modal elements each time a button is clicked
    const modal = document.getElementById('product-card__modal');
    const overlay = document.getElementById('product-card__overlay');
    const modalClose = modal.querySelector('.btn-close');

    // Configura el modal UNA VEZ y obtén el método `open`
    const { open } = setupToggleableElement({
        closeButton: modalClose,
        element: modal,
        overlay: overlay,
        onOpenCallback: ({ params }) => {
            const { btn } = params;
            const prodId = parseInt(btn.dataset.id);
            const product = ProductStore.getData().find(p => p.id === prodId);
            if (product) populateModalCard(modal, product);
        },
    });

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('button.corner-box');
        if (!btn) return;
        open({ btn });
    });

    // set eventos for form in modal
    formAddProductModal(modal);
}


function formAddProductModal(modal) {
    const form = modal.querySelector('#form-modal-add');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = form.dataset.id;
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
}



/**
 * Assigns all product card related events within a given container.
 * 
 * @param {HTMLElement} container - The parent element that contains product cards.
 */
function productCardFormsEvents(container) {
    container.addEventListener('submit', async (e) => {
        const form = e.target.closest('form');
        if (!form) return;

        e.preventDefault();

        const productId = form.dataset.index;
        const btn = e.submitter || form.querySelector('button[type="submit"]');

        // Identificar tipo de formulario por clase
        if (form.classList.contains('form-btn__like')) {
            await handleGenericFormBase({
                form,
                submitCallback: async () => formFavoritesEvents(productId, btn),
                flag_anim: false,
            });
        }

        else if (form.classList.contains('product-card__extender-btn')) {
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
        }
    });
}

