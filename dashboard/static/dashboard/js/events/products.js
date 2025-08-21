/// <reference path="../../../../../static/js/base.js" />
/// <reference path="../endpoints/products.js" />
/// <reference path="../generic/modal_form.js" />


/* =======================================================================
    FORMS DASH SECTION THAT IT S NOT CHANGES IN SECTION PRODCUTS
======================================================================= */
/**
 * Initializes the "Add Product" modal functionality:
 * 1. Gets all required DOM elements
 * 2. Sets up toggle behavior using a reusable component
 * 
 * @param {HTMLElement} dashSection - Container element holding modal components
 * @param {HTMLElement} overlay - overlay element holding modal components
 */
function formModalNewProduct(dashSection, overlay) {
    const btnToggle = dashSection.querySelector('#add-new-product');
    const form = dashSection.querySelector('#form-modal-product');
    const modalClose = form.querySelector('.form-modal-close');

    // 2. Modal configuration
    setupToggleableElement({
        toggleButton: btnToggle,
        closeButton: modalClose,
        element: form,
        overlay: overlay,    
        onOpenCallback: () => {       // Optional open event handler
            // a) Set initial form events (e.g., submission or validation)
            initInputImage(form);
            initModalCancelBtns(form, modalClose);

            // b) Set selects Choices for brands and categories
            const categorySelect = form.querySelector('.category-select');
            const brandSelect = form.querySelector('.brand-select');
            initSelectChoices(categorySelect);
            initSelectChoices(brandSelect);

            // c) Update the form inputs based on the selected row's data
            updateModalFormInputs({
                form: form,
                objectName: 'product',
                action: 'create'
            });
            calculateDiscountSubtotal(form);

            // c) Set up dynamic subcategory logic (e.g., dependent dropdowns)
            subcategorySelectEvents(form, true);

            // e) set action on create to send the final form
            form.dataset.action = 'create';

            // f) this is a logic to use the same modal, for updates or create, this cont
            // is only available in update forms
            const contImages = form.querySelector('.cont-block-update');
            toggleState(contImages, false);
        },

        onCloseCallback: () => {       // Optional close event handler
            resetInputsModalForm(form, false);
        }
    });

    // Submit modal form data using custom async handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const action = form.dataset.action
        await endpointsProduct(form, action, dashSection); 
    })
}


/**
 * Sets up dynamic form events for each row in the table section.
 * This function binds a modal form to each table row, allowing users to edit or view details
 * when a row is clicked. It initializes form behavior, image handling, and subcategory interactions.
 *
 * @param {HTMLElement} tableSection - The parent container that includes table rows and the modal elements.
 * @param {HTMLElement} overlay - overlay element holding modal components
 */
function rowsModalUpdateProduct(dashSection, overlay) {
    const form = dashSection.querySelector('#form-modal-product');
    const modalClose = form.querySelector('.form-modal-close');

    // Delegación de eventos en tableSection
    const tableProducts = dashSection.querySelector('#table-products');

    // Configura el modal UNA VEZ y obtén el método `open`
    const { open } = setupToggleableElement({
        closeButton: modalClose,
        element: form,
        overlay: overlay,
        onOpenCallback: ({ params }) => {
            const { row } = params;
            // a) Set initial form events (e.g., submission or validation)
            initInputImage(form);
            initModalCancelBtns(form, modalClose);

            // b) Attach main image change event handler
            changeMainImageEvent(form);

            // c) Update the form inputs based on the selected row's data
            const prodId = parseInt(row.dataset.id) || 0;

            // stupid check
            if (prodId === 0) {
                openAlert('Se produjo un error, por favor recargue la página.', 'orange', 2000);
                return;
            }

            const urlImages = window.TEMPLATE_URLS.imageProducts.replace('{product_id}', `${prodId}`);
            const product = window.ProductStore.getProductById(prodId);
            updateModalFormInputs({
                form: form,
                object: product,
                objectName: 'product',
                action: 'update',
                url: `${urlImages}?all=true`
            });
            calculateDiscountSubtotal(form);

            // d) Set up dynamic subcategory logic (e.g., dependent dropdowns)
            subcategorySelectEvents(form, true);

            // e) set action on create to send the final form
            form.dataset.action = 'update';
            form.dataset.index = prodId;

            // f) this is a logic to use the same modal, for updates or create, this cont
            // is only available in update forms
            const contImages = form.querySelector('.cont-block-update');
            toggleState(contImages, true);
        },
        onCloseCallback: () => {
            resetInputsModalForm(form, true);
        }
    });

    // Abre el modal con datos de la fila clickeada
    tableProducts.addEventListener('click', (e) => {
        const row = e.target.closest('.row-table');
        if (!row) return;
        open({ row });
    });
}


/**
 * Initializes filter button and form interactions by:
 * 1. Setting up form submission handling
 * 2. Configuring click-outside close behavior
 * 3. Initializing subcategory selection events
 * 
 * @param {HTMLElement} dashSection - Container element holding filter components
 */
function formSelectFiltersProducts(dashSection) {
    const btnFilter = dashSection.querySelector('#btn-filter');
    const formFilter = btnFilter.querySelector('.form-select-filters');
    
    // 1. Configure form submission
    formFilter.addEventListener("submit", (e) => {
        e.preventDefault();
        updateDashboardSection(formFilter, 'table-products', dashSection);
    });

    // 2. Set up dropdown behavior
    setupClickOutsideClose({
        triggerElement: btnFilter,
        targetElement: formFilter,
        customToggleFn: () => {
            // 2.1 Toggle visual active state
            const isExpanded = toggleState(formFilter);
            btnFilter.classList.toggle('active-main', isExpanded);
            return isExpanded
        }
    });

    // 3. Initialize subcategory selection handlers
    subcategorySelectEvents(formFilter);
};


/**
 * Attaches `submit` event handlers to all forms with the class `form-reset-filters`
 * within the given dashboard section. These forms are typically used to reset filters 
 * in admin panels or product tables.
 *
 * When a form is submitted, the default submission is prevented, and a custom 
 * dashboard update function is triggered instead. The submit button that initiated 
 * the form submission receives temporary visual feedback (via a CSS class).
 *
 * @param {HTMLElement} dashSection - The container element that holds the reset filter forms.
 */
function formResetFilters(dashSection) {
    const forms = dashSection.querySelectorAll('.form-reset-filters');

    // this is to not set a params in the filtered products
    const params = {
        category: -1, subcategory: -1, brand: -1, query: '', page: 1
    }
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.submitter;
            
            // Trigger the dashboard update with the current form
            updateDashboardSection(form, 'table-products', dashSection, params);

            // Add a visual indicator (CSS class) to the submit button
            if (btn) {
                btn.classList.add('active-main');

                // Remove the class after 2 seconds to reset the visual feedback
                setTimeout(() => { btn.classList.remove('active-main'); }, 2000);
            }
        });
    });
}


/**
 * Initializes real-time search functionality within a given dashboard section.
 *
 * Features implemented:
 * 1. Debounced Input Handling
 *    - Avoids excessive form submissions by delaying the trigger until the user has paused typing.
 * 
 * 2. Form Submission Control
 *    - Prevents default form submission and instead triggers a custom handler to update the UI dynamically.
 * 
 * 3. Dynamic Filter Transfer 
 *    - Ensures that additional filters (e.g., category, subcategory, availability) are copied from a hidden form
 *      and included in the active search query.
 *
 * @param {HTMLElement} dashSection - The parent container element that includes the search form and filters.
 */
function formInputSearchRealTime(dashSection) {
    const formInput = dashSection.querySelector('#search-dashboard');
    const searchInput = formInput?.querySelector('input[name="query"]');
    if (!formInput || !searchInput) return;

    // --- SERVER search on submit ---
    /**
     * Triggers a server-side search by submitting hidden filters form
     */
    const formSelect = dashSection.querySelector('.form-select-filters');
    const inputQuery = formSelect.querySelector('input[name="query"]');
    const btn = formSelect.querySelector('button[type="submit"]');
    formInput.addEventListener('submit', (e) => {
        e.preventDefault();
        // Trigger the dashboard update with the current form
        inputQuery.value = searchInput.value.trim();
        btn.click();     // triggers full submit (respects form submit handlers)
    });

    /**
     * Triggers client-side filtering using ProductStore (in-memory)
     */
    function filterLocal(query = '') {
        if (!window.ProductStore) return;

        const filtered = (query != '') ? 
            window.ProductStore.filterByName(query) :
            window.ProductStore.getData();

        const table = dashSection.querySelector('#table-products');
        renderProductsTable(table, filtered);
    }

    // --- CLIENT search on input ---
    const DELAY = 400;
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query.length < 3) {
            inputQuery.value = '';    // reset on main form
            filterLocal(''); // show all or reset
            return;
        }

        // debounce to avoid flooding
        if (searchInput.dataset.debounceTimer) {
            clearTimeout(Number(searchInput.dataset.debounceTimer));
        }
        searchInput.dataset.debounceTimer = setTimeout(() => {
            filterLocal(query);
        }, DELAY);
    });
}


/**
 * Initializes and manages table sorting behavior for a dashboard section.
 *
 * Functionality:
 * 1. Locates all sortable column buttons inside the given dashboard section.
 * 2. Sets up a click event listener on the table header.
 * 3. When a sort button is clicked:
 *    - Determines which column to sort by (using `data-sort-by`).
 *    - Toggles the sorting direction (`asc` <-> `desc`).
 *    - Calls the corresponding sorting function from `ProductStore`.
 *    - Re-renders the products table with the sorted results.
 *
 * @param {HTMLElement} dashSection - The parent element containing the table and sort buttons.
 *
 * Example:
 * HTML:
 * <th class="btn-sorted" data-sort-by="price" data-asc="asc">Price</th>
 *
 * JavaScript:
 * formArrowsSortedProducts(document.querySelector('#dashboard-section'));
 */
function formArrowsSortedProducts(dashSection) {

    // 1. Get all sort buttons in the container
    const tableHeader = dashSection.querySelector('.table-header');
    const table = dashSection.querySelector('#table-products');
    if (!tableHeader || !table) return;

    // 2. Mapa de funciones de ordenamiento
    const sortedFunctions = {
        'price': (asc) => window.ProductStore.orderByPrice(asc),
        'name': (asc) => window.ProductStore.orderByName(asc),
        'stock': (asc) => window.ProductStore.orderByStock(asc),
        'updated_at': (asc) => window.ProductStore.orderByUpdatedAt(asc),
        'sales': (asc) => window.ProductStore.orderBySales(asc),
        'available': (asc) => window.ProductStore.orderByAvailable(asc),
        'category': (asc) => window.ProductStore.orderByCategory(asc)
    };

    // event delegation on table header
    tableHeader.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-sorted');
        if (!btn) return;

        const sortBy = btn.dataset.sortBy;          // ej: 'price'
        const asc = btn.dataset.asc === 'asc';     // true o false
        btn.dataset.asc = asc ? 'desc' : 'asc';     // toggle en el dataset

        // this is from sections/products/table.js
        if (sortedFunctions[sortBy]) {
            const products = sortedFunctions[sortBy](asc); // execute function based on sortBy
            renderProductsTable(table, products);
        }
    })
};


/**
 * Updates the summary of applied filters in the table header.
 *
 * This function dynamically generates a string that lists all active filters
 * (category, subcategory, brand, and search query) and inserts it into the
 * specified DOM element. If no filters are applied, a default message is shown.
 *
 * @param {HTMLElement} dashSection - The parent element containing the table and filters summary.
 * @param {Object} data - An object containing the current filter values.
 * @param {Object} [data.category] - Category filter, with at least a `name` property.
 * @param {Object} [data.subcategory] - Subcategory filter, with at least a `name` property.
 * @param {Object} [data.brand] - Brand filter, with at least a `name` property.
 * @param {string} [data.query] - Search query string.
 *
 */
function updateSpansFiltersTable(dashSection, data) {
    const spanFiltersHeader = dashSection.querySelector('#resume-filters');
    if (spanFiltersHeader) {
        const resumen = [
            data.category && `Categoría: ${data.category.name}`,
            data.subcategory && `Subcategoría: ${data.subcategory.name}`,
            data.brand && `Marca: ${data.brand.name}`,
            data.query && `Buscador: ${data.query}`,
        ]
        .filter(Boolean)
        .join(" | ");

        spanFiltersHeader.textContent = resumen || "Sin filtros aplicados.";
    }
}

