



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



function ordersTabEvents(container, tabId) {
    // Avoid attaching duplicate event listeners if already initialized
    if (container.dataset.listened === 'true') return;
    container.dataset.listened = 'true';

    /**
     * Handle form submission inside the container.
     * Submits the form via AJAX and updates the container with new content.
     */
    container.addEventListener('submit', async (e) => {
        const form = e.target.closest('form#form-order-table');
        if (!form) return;

        e.preventDefault(); // Prevent default form submission

        // Serialize form data into query parameters
        const formData = new FormData(form);
        const params = new URLSearchParams(formData).toString();

        await getTabContentAJAX({ container, tabId, params, isPanel: false })
    });

    /**
     * Handle changes in the status dropdown.
     * When a select element named 'status' is changed, submit the form automatically.
     */
    container.addEventListener('change', (e) => {
        if (e.target.matches("select[name='status']")) {
            const form = e.target.closest('form');
            if (form) form.requestSubmit(); // Submit the form programmatically
        }
    });
}









/**
 * Loads dynamic tab content via AJAX and inserts it into the specified container.
 * Also initializes the corresponding event handlers for interactive tabs.
 *
 * @async
 * @function getTabContentAJAX
 * @param {Object} options - Configuration object.
 * @param {HTMLElement} options.container - The DOM element where the tab content will be injected.
 * @param {string} options.tabId - The identifier of the tab (used to build the URL and initialize tab-specific logic).
 * @param {string} [options.params=''] - Optional query parameters to append to the URL.
 * @param {boolean} [options.isPanel=true] - Indicates whether tab-specific event setup should be run.
 *
 * @returns {Promise<void>}
 */
async function getTabContentAJAX({ container, tabId, params = '', isPanel = true } = {}) {
    // Construye la URL base reemplazando el nombre del tab
    const base_url = window.TEMPLATE_URLS.profileTabs.replace('{tab_name}', tabId);
    const url = (params) ? `${base_url}?${params}` : base_url;

    try {
        // Realiza la solicitud al servidor
        const response = await fetch(url);
        const data = await response.json();
    
        // Limpia el contenido actual del contenedor e inserta el nuevo HTML
        container.innerHTML = data.html;
    
        // Inicializa eventos específicos según el tab activo
        if (isPanel) {
            if (tabId === 'store-data-tab') {
                storeTabEvents(container);
            } else if (tabId === 'users-tab') {
                usersTabEvents(container, tabId);
            }
        }

    } catch (error) {
        // Manejo de errores en caso de fallo en la carga
        console.error('Error loading content:', error);
        container.innerHTML = '<p>Algo salió mal recargue la página.</p>';
    }
}


/**
 * Initializes the tab interface once the DOM is fully loaded.
 * 
 * - Adds click event listeners to tab buttons to load and display tab content dynamically.
 * - Hides all tab content divs and shows only the selected tab's content.
 * - Fetches tab content via AJAX using the tab's name in the URL.
 * - Calls specific event setup functions based on the active tab.
 * - Automatically triggers a click on the second tab on page load to display its content.
 */
document.addEventListener('DOMContentLoaded', () => {
    

    const contBtnTabs = document.querySelector('.cont-tabs');
    const btnTabs = document.querySelectorAll('.btn-tabs');
    const divTabs = document.querySelectorAll('.tab-content');
    
    contBtnTabs.addEventListener('click', async function (e) {

        const btn = e.target.closest('.btn-tabs');
        if (!btn) return; // Si no se hizo click en un .btn-tabs, ignorar

        // Opcional: evitar repetir acción si ya está activo
        if (btn.classList.contains('active')) return;

        // Remove 'active' class from all tab buttons
        btnTabs.forEach(btn => btn.classList.remove('active'));
        btn.classList.add('active');

        const tabId = btn.dataset.tab;
        const container = document.getElementById(tabId);

        // Hide all tab content divs and show only the selected one
        divTabs.forEach(div => div.style.display = 'none');
        container.style.display = 'block';

        await getTabContentAJAX({ container, tabId })
    })

    // Automatically trigger click on the second tab to show it on page load
    const firstTab = btnTabs[0];
    if (firstTab) {
        const tabId = firstTab.dataset.tab;
        const container = document.getElementById(tabId);
        getTabContentAJAX({ container, tabId })
    }
    
    // form to close session with drf api
    const formsClose = document.querySelectorAll('.form-close-profile');
    formsClose.forEach((form) => {
        if (form) widgetUserForms(form, "Close");
    });
});


