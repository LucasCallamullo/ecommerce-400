




function createCarouselBase(container) {

    const carousel = document.createElement("div");
    carousel.className = "w-100";
    carousel.innerHTML = `
        <!-- title of each swiper container -->
        <div class="cont-space-between cont_carousel__title">
            <div class="d-flex justify-start px-2 h-100 carousel__title">
                <h2 class="text-white">Favoritos</h2>
            </div>

            <div class="d-flex gap-1"> 
                <!-- Buttons will be handled with Swiper -->
                <div class="swiper-button-prev-product" id="prev-fav">
                    <i class="ri-arrow-left-s-line font-lg"></i>
                </div>
                <div class="swiper-button-next-product" id="next-fav">
                    <i class="ri-arrow-right-s-line font-lg"></i>
                </div>
            </div>
        </div>

        <!-- Swiper Carousel Container -->
        <div class="swiper-products" id="swiper-favs">
            <div class="swiper-wrapper">
                
            </div>
        </div>
    `;
    container.appendChild(carousel);
}


function createModalProductsCards(container) {
    

    //<div class="modal product-card__modal" id="product-card__modal" data-state="null">
    const modal = document.createElement("div");
    modal.classList.add('modal', 'product-card__modal');
    modal.id = 'product-card__modal';
    modal.dataset.state = 'null';
    modal.innerHTML = `
        <button class="btn btn-close btn-28 justify-self-end">
            <i class="ri-close-line font-xl"></i>
        </button>

        <div class="d-grid cont-grid-122">
            
            <!-- Primera Columna Modal		 -->
            <div>
                <div class="cont-img-100">
                    <img class="img-scale-down modal-img" src="" alt="">
                </div>
            </div>
            
            <!-- Segunda Columna Modal		 -->
            <div class="d-flex-col gap-1">

                <div class="d-flex gap-1 modal-cat-group">
                    <a class="p-1 w-min border-hover bg-secondary btn-primary modal-catSlug" href="#">
                        <b class="text-truncate font-sm modal-cat">  </b>
                    </a>
                    <a class="p-1 w-min border-hover bg-secondary btn-primary modal-subcatSlug" href="#">
                        <b class="text-truncate font-sm modal-subcat">  </b>
                    </a>
                </div>

                <div class="d-flex gap-1">
                    <div class="w-min p-1 px-2 pxr-3 border-hover bg-secondary">
                        <p class="text-secondary font-sm text-start bolder">Stock</p>
                        <p><b class="text-truncate modal-stock">  </b></p>    
                    </div>

                    <div class="w-min p-1 px-2 pxr-3 border-hover bg-secondary modal-stock-group">
                        <p class="text-secondary font-sm text-start bolder">Marca</p>
                        <a class="modal-brandSlug" href="#">
                            <b class="text-truncate modal-brand bold-main">  </b>
                        </a>
                    </div>
                </div>

                <!-- Name product - Price - Offer		 -->
                <h2 class="mt-2 ms-1 modal-title">  </h2>

                <div class="d-flex-col w-100 p-2 border-hover bg-secondary relative">
                    <div class="offer-tag modal-group-discount">
                        <b class="text-truncate text-white modal-discount"> </b>
                    </div>

                    <p class="text-center mt-2"> 
                        <b class="bold-orange modal-group-discount">
                            <i class="ri-fire-line font-xl"></i>
                        </b>
                        <b class="font-xl modal-price">  </b>
                        <b class="text-line-through text-secondary modal-group-discount font-lg modal-price-offer"> </b>
                    </p>
                
                    <p class="text-center text-secondary font-xs"><b>
                        Precio especial pagando por depósito o transferencia bancaria.
                    </b></p>
                </div>


                <a class="mt-5 mb-2 modal-id" href="#">
                    <b class="bold-main">Ver Producto Completo.</b>
                </a>

            </div>

        </div>
    `;
    container.appendChild(modal);

    // <div class="overlay" id="product-card__overlay"></div>
    const overlay = document.createElement("div");
    overlay.classList.add('overlay');
    overlay.id = 'product-card__overlay';
    container.appendChild(overlay);
}

function createCarouselCards(container, products) {

    if (!container._InitBase) {
        createCarouselBase(container);
        createModalProductsCards(container);
        container._InitBase = true;
    }


    const swiper = container.querySelector('.swiper-wrapper');
    if (!swiper) {
        console.error('Swiper wrapper no encontrado');
        return;
    }

    swiper.innerHTML = '';     // limpiar tarjetas viejas

    products.forEach(p => {
        const prod = deepEscape(p);
        const brandName = prod.brand?.name ? prod.brand.name : 'sin-marca';
        const brandSlug = prod.brand?.slug ? prod.brand.slug : 'sin-marca';

        const catName = prod.category?.name ? prod.category.name : 'sin-categoria';
        const catSlug = prod.category?.slug ? prod.category.slug : 'sin-categoria';

        const subcatName = prod.subcategory?.name ? prod.subcategory.name : 'sin-subcategoria';
        const subcatSlug = prod.subcategory?.slug ? prod.subcategory.slug : 'sin-subcategoria';
        
        const urlDetail = window.TEMPLATE_URLS.productDetail
            .replace('0', prod.id)
            .replace('__SLUG__', prod.slug);

        const stockLabel = (!prod.available || prod.stock == 0)
            ? `<b class="bold-red font-sm">No disponible</b>`
            : (prod.stock <= 3)
                ? `<b class="bold-orange font-sm">Stock Bajo</b>`
                : `<b class="bold-green font-sm">Disponible</b>`;

        const price = formatNumberWithPoints(prod.price)

        let price_discount = price;
        if (prod.discount > 0) {
            price_discount = prod.price - (prod.price * prod.discount / 100);
            price_discount = formatNumberWithPoints(price_discount);
        }

        const discountLabel = (prod.discount > 0) ? `
            <div class="cont-space-between w-100">
                <b class="font-sm d-desktop-block">Descuento:</b>
                <b class="bold-red">% ${prod.discount} OFF</b>
            </div>

            <div class="cont-space-between w-100 font-sm">
                <b class="text-line-through text-secondary">Normal:</b>
                <b class="text-line-through text-secondary">$ ${price}</b>
            </div>

            <div class="cont-space-between w-100">
                <b class="bold-red">Oferta:</b>
                <b class="bold-red">$ ${price_discount}</b>
            </div>` 
            : `<b> $ ${price}</b>`

        const cardHTML = /*html*/`
            <article class="swiper-slide product__card">
                <button class="btn corner-box" data-product='{
                    "id": "${prod.id}",
                    "name": "${prod.name}",
                    "slug": "${prod.slug}",
                    "cat": "${catName}",
                    "catSlug": "${catSlug}",
                    "subcat": "${subcatName}",
                    "subcatSlug": "${subcatSlug}",
                    "brand": "${brandName}",
                    "brandSlug": "${brandSlug}",
                    "stock": "${prod.stock}",
                    "price": "${prod.price}",
                    "discount": "${prod.discount}",
                    "image": "${prod.main_image}"
                }'>
                    <i class="ri-focus-mode font-xl"></i>
                </button>
                
                <div class="d-grid cont-100 product-card__info">
                    <a href="${urlDetail}" class="cont-img-100">
                        <img class="img-scale-down" src="${prod.main_image}" 
                        alt="${prod.name}">
                    </a>

                    <a class="ms-2 text-sm me-2 text-truncate-multiline" href="${urlDetail}">
                        <b class="font-md">${prod.name}</b>
                    </a>

                    <div class="ms-2 me-2 cont-space-between">
                        ${stockLabel}
                    
                        <form class="form-btn__like" data-index="${prod.id}">
                            <button class="btn btn-like liked" type="submit">
                                <i class="ri-heart-fill font-xl"></i>
                            </button>
                        </form>
                    </div>
                    
                    <div class="ms-2 d-flex-col gap-1 font-md me-2">
                        ${discountLabel}
                    </div>
                </div>

                <form class="d-flex justify-center product-card__extender-btn" 
                data-index="${prod.id}" data-stock="${prod.stock}">
                    <button class="btn btn-main gap-1 btn-32 w-75 btn-add-product-pc" type="submit">
                        <b>Agregar</b> 
                        <i class="ri-shopping-basket-2-fill font-md"></i>
                    </button>
                </form>
            </article>
        `;

        swiper.insertAdjacentHTML('beforeend', cardHTML);
    });
}
