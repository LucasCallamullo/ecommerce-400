

function renderingListCard(container, products) {
    container.innerHTML = '';

    products.forEach(p => {
        const prod = deepEscape(p);
        const urlDetail = window.TEMPLATE_URLS.productDetail
            .replace('0', prod.id)
            .replace('__SLUG__', prod.slug);

        const stockLabel = (!prod.available || prod.stock == 0)
            ? /*html*/`<p class="text-start text-truncate bold-red">No disponible</p>`
            : (prod.stock <= 3)
                ? /*html*/`<p class="text-start text-truncate bold-orange">Stock Bajo</b>`
                : /*html*/`<p class="text-start text-truncate bold-green">Disponible</p>`;

        const favoritesLabel = (prod.is_favorited)
            ? /*html*/`
                <button class="btn btn-36 btn-like liked" type="submit">
                    <i class="ri-heart-fill font-xl"></i>
                </button>`
            : /*html*/`
                <button class="btn btn-36 btn-like" type="submit">
                    <i class="ri-heart-line font-xl"></i>
                </button>`;

        const price = formatNumberWithPoints(prod.price)
        let price_discount = price;
        if (prod.discount > 0) {
            price_discount = prod.price - (prod.price * prod.discount / 100);
            price_discount = formatNumberWithPoints(price_discount);
        }

        const discountLabel = (prod.discount > 0) ? /*html*/`
                <p class="text-start bolder">Descuento:</p>
                <p class="justify-self-end h-min bold-red">% ${prod.discount}OFF</p>
                <p class="text-start text-line-through text-secondary bolder">Normal:</p>
                <p class="justify-self-end text-line-through text-secondary bolder">$ ${price}</p>
                <p class="text-start bold-red font-md">Oferta:</p>
                <p class="justify-self-end bold-red font-md">$ ${price_discount}</p>`
            : /*html*/`
                <p class="text-start bolder font-md grid-col-all"> $ ${price}</p>`;

        const cardHTML = /*html*/`
            <article class="product__card w-100 relative">
                <button class="btn corner-box" data-id="${prod.id}">
                    <i class="ri-focus-mode font-xl"></i>
                </button>
                
                <div class="d-grid h-100 w-100 product-card__info">
                    <a href="${urlDetail}" class="cont-img-100">
                        <img class="img-scale-down" src="${prod.main_image}" alt="${prod.name}">
                    </a>

                    <a class="px-2 text-start text-truncate-multiline font-md bolder" href="${urlDetail}">
                        ${prod.name}
                    </a>

                    <div class="d-grid px-2 cont-grid-2 gap-2 align-center font-sm">
                        ${stockLabel}

                        <form class="justify-self-end form-btn__like" data-index="${prod.id}">
                            ${favoritesLabel}
                        </form>
                    
                        ${discountLabel}
                    </div>
                </div>

                <form class="d-flex justify-center product-card__extender-btn" 
                data-index="${prod.id}" data-stock="${prod.stock}">
                    <button class="btn btn-main gap-1 btn-32 w-75 btn-add-product-pc font-md bolder" type="submit">
                        Agregar<i class="ri-shopping-basket-2-fill"></i>
                    </button>
                </form>
            </article>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function renderingEmptyListCard(container) {
    container.innerHTML = '';

    const cardHtml = /*html*/`
        <h3 class="grid-col-all mt-1 text-break font-lg">Todavía no realizaste ninguna orden.</h3>
        <h4 class="grid-col-all text-break font-md">Mira todos nuestros productos:</h4>
        <div class="grid-col-all justify-self-center">
            <button class="w-min text-truncate btn btn-main gap-2 px-2 py-1 bolder font-md" id="get-all-products">
                <i class="ri-shopping-cart-2-line font-lg"></i>
                Todos los Productos
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHtml);

    const btn = container.querySelector('#get-all-products');
    if (btn) {
        btn.addEventListener('click', () => {
            fetchProductList({ available: 1, category: 0, subcategory: 0 });
        });
    }
}


function updateProductListCards(container, products, data = null) {

    if (!container) {
        console.error('container no encontrado');
        return;
    }

    if (products.length > 0) {
        renderingListCard(container, products);
    } else {
        renderingEmptyListCard(container, data);
    }

    // set events one time on static container
    if (!container._hasInitEvents) {
        productCardFormsEvents(container);
        productCardModalEvent(container);
        container._hasInitEvents = true;
    }
}



