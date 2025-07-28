



/// <reference path="../../../../static/js/base.js" />


// ================================================================================
//                        Profile home Handle ajax 
// ================================================================================
/// <reference path="../../../../products/static/products/js/products_cards.js" />
/// <reference path="../../../../products/static/products/js/products_carousel.js" />


function initSwiperFavorites () { 
    // el nombre de la clase  es el que define a que swiper corresponde esta config
    const swiper = new Swiper(`#swiper-favs`, {
        loop: true, // Evita acumulación de slides mal posicionados
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
        },
        slidesPerView: "auto", // Se ajusta con el CSS
        centeredSlides: false, // Evita que los slides se centren incorrectamente
        grabCursor: true,
        navigation: {
            nextEl: `#next-fav`,
            prevEl: `#prev-fav`,
        },
    });

}


function onloadEventsTabs(container, tabId) {
    if (tabId === "favorites-tab") {
        initSwiperFavorites();
        assignProductCardsForms(container);
        assignProductCardsModals(container);
    }
}


document.addEventListener('DOMContentLoaded', () => {


    const formsClose = document.querySelectorAll('.form-close-profile');
    formsClose.forEach((form) => {
        if (form) widgetUserForms(form, "Close");
    });


    const menuItems = document.querySelectorAll('.btn-tabs');
    const divTabs = document.querySelectorAll('.tab-content');

    menuItems.forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();

            // Quitar clase 'active' de todos los elementos
            menuItems.forEach(i => i.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.getAttribute('data-tab');
            const container = document.getElementById(tabId);

            // Oculta otros tabs y muestra el actual
            divTabs.forEach(div => div.style.display = 'none');
            container.style.display = 'block';

            try {
                const url = window.TEMPLATE_URLS.profileTabs.replace('{tab_name}', tabId);
                const response = await fetch(url);
                const data = await response.json();
            
                // Limpia el contenedor y añade un wrapper interno
                container.innerHTML = data.html; // Limpiar
            
                onloadEventsTabs(container, tabId);


            } catch (error) {
                console.error('Error loading content:', error);
                container.innerHTML = '<p>Error loading content.</p>';
            }
        });
    });

    // Llama al clic del primer tab automáticamente al cargar la página
    const firstTab = menuItems[0];
    if (firstTab) {
        firstTab.click();
    }
});
