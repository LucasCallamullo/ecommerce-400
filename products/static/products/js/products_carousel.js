

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../js/products_cards.js" />


function initSwipers() {

    // Loop through all swiper containers with the class "swiper-products"
    document.querySelectorAll('.swiper-products').forEach((swiperContainer, index) => {

        // Count how many slides this container has
        const slides = swiperContainer.querySelectorAll('.swiper-slide').length;

        // Minimum slides needed for loop to work properly.
        // For 'slidesPerView: auto', a practical safe value is 4 or more.
        const shouldLoop = slides >= 4;

        // Initialize Swiper with dynamic loop value
        const swiper = new Swiper(`#swiper-${index + 1}`, {
            loop: shouldLoop,    // Evita acumulación de slides mal posicionados
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            slidesPerView: "auto",    // Se ajusta con el CSS
            centeredSlides: false,    // Evita que los slides se centren incorrectamente
            grabCursor: true,
            navigation: {
                nextEl: `#next-${index + 1}`,
                prevEl: `#prev-${index + 1}`,
            },
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    initSwipers();

    // Assign Events of products cards into the carousel
    const swipers = document.querySelectorAll('.swiper-wrapper');
    swipers.forEach((container) => { 
        assignProductCardsForms(container);
        assignProductCardsModals(container);
    });
});
