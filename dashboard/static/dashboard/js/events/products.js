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
            btnToggle.dataset.object = 'product';
            btnToggle.dataset.action = 'create';
            updateModalFormInputs(btnToggle, form);
            calculateDiscountSubtotal(form);

            // c) Set up dynamic subcategory logic (e.g., dependent dropdowns)
            subcategorySelectEvents(form, true);
            
            // d) Load and set the product description dynamically into the modal
            descriptionModalEvents(form);

            // set datasets form
            form.dataset.action = 'create';

            // close container only in create form
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
            row.dataset.object = 'product';
            row.dataset.action = 'update';
            updateModalFormInputs(row, form);
            calculateDiscountSubtotal(form);

            // d) Set up dynamic subcategory logic (e.g., dependent dropdowns)
            subcategorySelectEvents(form, true);

            // e) Load and set the product description dynamically into the modal
            const productId = row.dataset.index;
            descriptionModalEvents(form, productId, tableProducts);

            // set datasets form
            form.dataset.action = 'update';
            form.dataset.index = productId;

            // open container only in update form
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
 * Attaches `submit` event handlers to all forms with the class `form-reset-filters`
 * within the given dashboard section. These forms are typically used to reset filters 
 * in admin panels or product tables.
 *
 * When a form is submitted, the default submission is prevented, and a custom 
 * dashboard update function is triggered instead. The submit button that initiated 
 * the form submission receives temporary visual feedback (via a CSS class).
 *
 * @param {HTMLElement} dashSection - The container element that holds the reset filter forms.
 * @param {string} tableId - The ID or key used to identify and update the corresponding data table or section.
 */
function formResetFilters(dashSection, tableId) {
    const formsReset = dashSection.querySelectorAll('.form-reset-filters');
    
    formsReset.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.submitter;
            
            // Trigger the dashboard update with the current form
            updateDashboardSection(form, tableId);

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
    // Cache key DOM elements
    const formInputDash = dashSection.querySelector('#search-dashboard');          // Main visible search form
    const searchInput = formInputDash?.querySelector('input[name="query"]');       // Text input field for search queries    

    /**
     * Handles form submission by injecting query and filters into the visible form,
     * then programmatically triggering a submit action.
     *
     * @param {string} query - The search query to submit (defaults to empty string)
     */
    function submitSearch(query = '') {
        // 1.0 Refresh form references (post-DOM update)
        let formAllFilters = dashSection.querySelector('#form-hidden-filters');

        // 1.1 Update form values
        formAllFilters.query.value = query;

        // 1.2 Trigger form submission
        let submitBtn = formAllFilters.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click(); // Esto sí dispara el evento 'submit'
    }

    /**
     * Custom form submission event handler
     * Prevents default form reload and instead performs an AJAX-like update.
     */
    formInputDash.addEventListener('submit', (e) => {
        e.preventDefault();
        submitSearch(formInputDash.query.value)
    });

    const DELAY = 500; // Delay (in milliseconds) before triggering search
    const MIN_CHARS = 3;        // Minimum number of characters required to trigger a search
    
    /**
     * Handles input events on the search field.
     * - Debounces input to limit request rate.
     * - Triggers reset or search depending on input length.
     */
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        // Reset search if query becomes too short
        if (query.length < MIN_CHARS) {
            submitSearch('');
            return;
        }

        // Do not trigger search for short queries
        if (query.length < MIN_CHARS) return;

        // 1. Debounce logic using dataset
        if (searchInput.dataset.debounceTimer) {
            clearTimeout(Number(searchInput.dataset.debounceTimer));
        }

        const newTimer = setTimeout(() => {
            submitSearch(query);
        }, DELAY);

        searchInput.dataset.debounceTimer = newTimer;
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
    const formFilter = btnFilter.querySelector('#form-select-filters');
    // 1. Configure form submission
    formFilter.addEventListener("submit", (e) => {
        e.preventDefault();
        updateDashboardSection(formFilter, 'table-products');
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
 * Handles table sorting functionality by:
 * 1. Locating all sort buttons in a dashboard section
 * 2. Initializing base table functionality
 * 3. Attaching click handlers to each sort button
 *    - Toggles sort direction (asc/desc)
 *    - Updates hidden form values
 *    - Triggers form submission
 * 
 * @param {HTMLElement} dashSection - Parent element containing sort buttons
 */
function formArrowsSortedProducts(dashSection) {
    // 1. Get all sort buttons in the container
    const btnSorts = dashSection.querySelectorAll('.btn-sorted');

    // 2. Configure click handlers for each sort button
    btnSorts.forEach((btn) => {
        btn.addEventListener('click', () => {
            // 3.1 Extract current sort parameters
            const sortBy = btn.getAttribute('data-sort-by');
            const dataSorted = btn.getAttribute('data-sorted');
    
            // 3.2 Reverse sort direction
            const sorted = (dataSorted === 'asc') ? 'desc' : 'asc';
            btn.setAttribute('data-sorted', sorted);
    
            // 3.3 Refresh form references (post-DOM update)
            let formAllFilters = dashSection.querySelector('#form-hidden-filters');

            // 3.4 Update form values
            formAllFilters.sort_by.value = sortBy;
            formAllFilters.sorted.value = sorted;

            // 3.5 Trigger form submission
            let submitBtn = formAllFilters.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click(); // Esto sí dispara el evento 'submit'
        });
    });
};



/* ======================================================================================
    Table section parameter indica que son funciones reasignadas post get, post, put 
====================================================================================== */
/**
 * Reassigns dynamic event listeners to form elements and filters inside the given table section.
 * This is necessary after re-rendering or dynamically updating a section in the dashboard,
 * ensuring all relevant forms continue functioning correctly.
 *
 * @param {HTMLElement} tableSection - The section of the dashboard containing the products table and related forms.
 */
function eventsTableProducts(tableSection) {

    // Reassign submit event to the hidden filters form after the section is re-rendered.
    const formAllFilters = tableSection.querySelector('#form-hidden-filters');
    if (formAllFilters) {
        formAllFilters.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            updateDashboardSection(formAllFilters, 'table-products'); // Handle the filter logic via AJAX or similar
        });
    }

    // If the dashboard has filters applied, generate a human-readable summary
    const filtersDiv = tableSection.querySelector('#filters-str');
    if (filtersDiv) {
        // Create an array of filter descriptions only if they are present
        const resumen = [
            filtersDiv.dataset.category && `Categoría: ${filtersDiv.dataset.category}`,
            filtersDiv.dataset.subcategory && `Subcategoría: ${filtersDiv.dataset.subcategory}`,
            filtersDiv.dataset.query && `Buscador: ${filtersDiv.dataset.query}`,
        ]
        .filter(Boolean) // Remove any falsy values
        .join(" | ");    // Join the valid filters with a pipe separator
        
        // Update the DOM with the filters summary, or a default message
        document.getElementById("resume-filters").textContent = resumen || "Sin filtros aplicados.";
    }
}


