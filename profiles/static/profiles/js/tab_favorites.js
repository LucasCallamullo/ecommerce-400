



// ================================================================================
//                        Logica del tab de favoritos
// ================================================================================
function initSwiper () { 
    // el nombre de la clase  es el que define a que swiper corresponde esta config
    const swiper = new Swiper(`#swiper-fav`, {
        loop: true, // Carrusel infinito
        navigation: {
            nextEl: '.swiper-button-next', // Botón "siguiente"
            prevEl: '.swiper-button-prev', // Botón "anterior"
        },
        slidesPerView: 3, // Número de ítems visibles
        spaceBetween: 16, // Espaciado entre slides (en px)
        autoplay: {
            delay: 3000, // Cambia automáticamente cada 3 segundos
            disableOnInteraction: false, // Continúa tras interacción manual
        },
        grabCursor: true, // Cambia el cursor al estilo "agarre"
    });
}

// Reasigna eventos a los botones de incremento
function assignButtonsAddCartFavs() {
    document.querySelectorAll('.carousel-btn-carrito').forEach(button => {
        
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-index');
            const qty_add = 1;
            handleCartActions(productId, 'add', qty_add);
        });
    });
}
