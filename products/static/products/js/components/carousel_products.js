


/// <reference path="../../../../../static/js/base.js" />
/// <reference path="../../js/logic/cards_products.js" />


function initSwipers(container) {

    // Loop through all swiper containers with the class "swiper-products"
    const swipers = container.querySelectorAll('.swiper-products')
    swipers.forEach((swiperContainer, index) => {

        // Count how many slides this container has
        const slides = swiperContainer.querySelectorAll('.swiper-slide').length;

        // Minimum slides needed for loop to work properly.
        // For 'slidesPerView: auto', a practical safe value is 4 or more.
        const shouldLoop = slides >= 4;

        // Initialize Swiper with dynamic loop value
        const swiper = new Swiper(`#swiper-${index}`, {
            loop: shouldLoop,    // Evita acumulación de slides mal posicionados
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            slidesPerView: "auto",    // Se ajusta con el CSS
            centeredSlides: false,    // Evita que los slides se centren incorrectamente
            grabCursor: true,
            navigation: {
                nextEl: `#next-${index}`,
                prevEl: `#prev-${index}`,
            },
        });
    });
}


function renderSwiperCategory(category, counter) {
    const swiperHtml = /*html*/`
        <div class="carousel-category">
            <!-- title of each swiper container -->
            <div class="cont-space-between cont_carousel__title">
                <div class="d-flex justify-start px-2 h-100 carousel__title">
                    <a class="font-md" href="#"> 
                        <b class="text-white">${category}</b>
                    </a>
                </div>
        
                <div class="d-flex gap-1"> 
                    <!-- Buttons will be handled with Swiper -->
                    <div class="swiper-button-prev-product" id="prev-${counter}">
                        <i class="ri-arrow-left-s-line font-lg"></i>
                    </div>
                    <div class="swiper-button-next-product" id="next-${counter}">
                        <i class="ri-arrow-right-s-line font-lg"></i>
                    </div>
                </div>
            </div>
        
            <!-- Swiper Carousel Container -->
            <div class="swiper-products" id="swiper-${counter}">
                <div class="swiper-wrapper"></div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = swiperHtml;

    const swiperWrapper = container.querySelector('.swiper-wrapper');
    return { element: container.firstElementChild, swiperWrapper };
}


window.ProductStore = {
    data: [],
    setData(newData) {
        /**
         * Sets the internal product data store.
         *
         * @param {Array} newData - An array of product objects to be stored.
         */
        this.data = newData;
    },
    getData() {
        /**
         * Returns the current product data.
         *
         * @returns {Array} - The array of stored product objects.
         */
        return this.data;
    },
}


function createCarouselCards() {
    const container = document.getElementById('cont-swipers-home');
    if (!container) {
        console.error('container no encontrado');
        return;
    }

    if (window.productList) {
        const fragment = document.createDocumentFragment();
        let counter = 0;
        let listToSet = [];

        for (const [category, products] of Object.entries(window.productList)) {
            const { element, swiperWrapper } = renderSwiperCategory(category, counter);

            products.forEach(product => {
                swiperWrapper.appendChild(renderCards(product, true));
                listToSet.push(product);
            });

            fragment.appendChild(element);
            counter++;
        }
        ProductStore.setData(listToSet);

        container.appendChild(fragment); // Finalmente, insertás todo al DOM

        initSwipers(container);
    }

    // set events one time on static container
    if (!container._hasInitEvents) {
        productCardFormsEvents(container);
        productCardModalEvent(container);
        container._hasInitEvents = true;
    }
}
