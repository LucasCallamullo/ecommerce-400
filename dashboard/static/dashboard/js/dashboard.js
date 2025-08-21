/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/utils.js" />

/// <reference path="./events/products.js" />
/// <reference path="./events/categories.js" />

/// <reference path="./endpoints/images.js" />
/// <reference path="./endpoints/products.js" />
/// <reference path="./endpoints/categories.js" />


/**
 * Customizes the main navigation bar for the dashboard layout.
 *
 * Purpose:
 * - Hides unnecessary top navigation elements.
 * - Forces the main navigation bar to be fixed and compact.
 * - Adjusts the header height to match the fixed navigation height.
 *
 * Parameters:
 * @param {HTMLElement} header       - The main <header> element containing the nav.
 * @param {HTMLElement} nav          - The main navigation container (#cont-main-nav).
 * @param {HTMLElement} navList      - The navigation list element (#main-nav-list).
 * @param {HTMLElement} logo         - The fixed logo container (.cont-logo-fixed).
 * @param {HTMLElement} widgetLogin  - The user dropdown widget (.user-dropdown).
 *
 * Behavior:
 * 1. Hides the top navigation bar and logo for a cleaner dashboard look.
 * 2. After a short delay (150ms), forces the nav into a fixed state:
 *    - Adds "fixed-nav" and "active" classes to the nav.
 *    - Adds "fixed-layout" class to the nav list.
 *    - Positions the nav absolutely.
 *    - Ensures the fixed logo is visible.
 *    - Adds the "fixed-dropdown" class for desktop dropdown alignment.
 * 3. Measures the fixed nav height and sets the header's height to match,
 *    preventing layout shifts.
 *
 * Notes:
 * - The 150ms delay ensures CSS layout has been applied before measuring height.
 * - `IS_MOBILE` is assumed to be a global flag for responsive behavior.
 * - Relies on `toggleState()` to control the logo's open/closed state.
 */
function navBarDashboardCustom(header, nav, navList, logo, widgetLogin) {
    const navBarTop = header.querySelector('.top-nav');
    const navBarLogo = header.querySelector('.logo-navbar-top');

    // Hide top navigation and logo for dashboard view
    navBarTop.style.display = 'none';
    navBarLogo.style.display = 'none';

    setTimeout(() => {
        // Force nav into fixed state
        nav.classList.add("fixed-nav", "active");
        navList.classList.add("fixed-layout");
        nav.style.position = 'absolute';

        // Show fixed logo if it was previously closed
        if (logo.dataset.state === 'closed') {
            toggleState(logo, true);
        }

        isMainNavFixed = true;

        // Adjust dropdown alignment for desktop only
        if (!IS_MOBILE) widgetLogin.classList.add("fixed-dropdown");

        // Match header height to fixed nav height to prevent layout jumps
        const navHeight = nav.offsetHeight;
        header.style.height = `${navHeight}px`;
    }, 150);
}


/**
 * Dynamically updates a dashboard section by performing a GET request with form parameters,
 * then replacing the inner HTML of a target section with the fetched HTML content.
 * Also rebinds event listeners for interactive elements within the updated section.
 *
 * Requirements for the form:
 * - Must have an `action` attribute (URL endpoint).
 * - Must include a `data-table` attribute that corresponds to the section's ID to update.
 * - Must have standard input fields and a submit button (`<button type="submit">`).
 *
 * @param {HTMLFormElement} form - The form element used to build the query and determine which section to update.
 */
async function updateDashboardSection(form, tableId, dashSection, extraParams = null) {

    // 1. Get info from form to update table section
    const formData = new FormData(form);
    const submitBtns = form.querySelectorAll('button[type="submit"]');

    // 2. Build the final URL using the form's action and serialized query parameters
    const urlMap = {
        "table-products": window.TEMPLATE_URLS.filterProducts
        // "table-orders": window.TEMPLATE_URLS.filterOrders,
        //"table-users": window.TEMPLATE_URLS.filterUsers,
    };
    const url = urlMap[tableId];

    // 3. Build query params
    let params;
    if (extraParams) {
        // Convert FormData to plain object
        const paramsBase = Object.fromEntries(formData.entries());
        // Merge extra params, overriding existing keys
        Object.assign(paramsBase, extraParams);
        // Convert merged object into URL params
        params = new URLSearchParams(paramsBase).toString();
    } else {
        // Directly convert FormData into URL params
        params = new URLSearchParams(formData).toString();
    }

    // 4. Final URL
    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`;
    console.log(finalUrl)

    try {
        // 3. Disable the submit button to prevent multiple submissions
        submitBtns.forEach(btn => btn.disabled = true);

        // 4. Perform the GET request to fetch the updated HTML section
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 5. If the response fails, throw an error to be caught later
        if (!response.ok) throw new Error('Network response was not ok');

        // 5.a. Extract the JSON response (expected to include HTML string for the section)
        const data = await response.json();

        // 6. Replace the inner HTML of the section specified by the form's data-table attribute
        // const tableSection = document.getElementById(tableId);
        // tableSection.innerHTML = data.html;

        // 6. Rebind all dynamic events for the updated section
        if (tableId === 'table-products') {
            // rowsProductsEvents(tableSection);     // For row click/modal functionality
            // eventsTableProducts(tableSection);    // For forms and filters

            // set new data
            window.ProductStore.setData(data.products);

            // this is from sections/products/table.js
            const table = dashSection.querySelector('#table-products');
            renderProductsTable(table, data.products, data);

            // update some info dynamic
            updateSpansFiltersTable(dashSection, data);

            // this is from sections/products/pagination.js
            const contBtnsPage = dashSection.querySelector('#cont-pagination');
            updateContPagination(contBtnsPage, data.pagination);
        }

    } catch (error) {
        // Log any errors to the console for debugging
        console.error('Error:', error);
    } finally {
        // 7. Re-enable the submit button regardless of success or failure
        submitBtns.forEach(btn => btn.disabled = false);
    }
}





/**
 * Initializes and assigns all event listeners for a specific dashboard section.
 * 
 * @function eventsOnDashboard
 * @param {string} sectionId - The ID of the dashboard section (e.g., 'products')
 * @param {HTMLElement} dashSection - The container element of the dashboard section
 * @returns {void}
 */
function eventsOnDashboard(sectionId, dashSection, data=null) {
    const overlay = document.querySelector('#overlay-dashboard');

    // 1. create handler events
    const sectionHandlers = {
        products: (dashSection) => {

            // render container csr stuff
            if (!dashSection._init) {
                renderProductsDashboard(dashSection, data);
                dashSection._init = true;

                /* Special evento from sections/products/pagination.js */
                historyPopState();
            
                // Configure filter button interactions
                formSelectFiltersProducts(dashSection);

                // Initialize modal for adding products
                formModalNewProduct(dashSection, overlay);

                // Assign delegation event to product rows 
                rowsModalUpdateProduct(dashSection, overlay);

                // Handle filter reset actions
                formResetFilters(dashSection);

                // Set up sorting controls
                formArrowsSortedProducts(dashSection);

                // Implement real-time search functionality
                formInputSearchRealTime(dashSection);
            }
            
            /* Dynamic table events */
            updateSpansFiltersTable(dashSection, data);
        },
        users: (dashSection) => {
            // ...
            console.log("hacer futuro")
        },
        categories: (dashSection) => {
            // Initialize tabs to interaction in section
            openTabsCategories(dashSection);
            formEventsCategories(dashSection, overlay);
        },
        store: (dashSection) => {
            // Initialize tabs to interaction in section
            formHeadersImages(dashSection, overlay);
        },
    };

    // 2. Asignar eventos
    const handler = sectionHandlers[sectionId];
    if (handler) handler(dashSection);

    analizarHTML();
    
};


/**
 * Fetches and displays a dashboard section dynamically.
 * 
 * @async
 * @function getDashboardSection
 * @param {string} sectionId - The ID of the dashboard section to load (e.g., 'products')
 * @throws {Error} When the server response is not OK or fails to fetch the section
 */
async function getDashboardSection(sectionId) {

    // Construct the URL with the section ID
    const url = window.TEMPLATE_URLS.getDashSection.replace('{section_name}', sectionId);
    const response = await fetch(url);      // GET is implicit in fetch API
    const data = await response.json();

    // 1. Error handling - propagate server errors
    if (!response.ok) throw new Error('Failed to get HTML section');

    // 2. Hide all sections before showing the new one
    const sections = document.querySelectorAll('.dashboard-section');
    let dashSection = null;

    sections.forEach(section => {
        if (section.id === sectionId) {
            dashSection = section;   // Already have the element
        } else {
            section.classList.remove('active');
        }
    });
    if (!dashSection) throw new Error(`Section "${sectionId}" not found in DOM`);

    // 3. Update DOM with new content
    const excludeSections = ['products']; // lista de secciones a excluir
    if (!excludeSections.includes(sectionId)) {
        dashSection.innerHTML = data.html;
    }
    dashSection.classList.add('active');

    // 4. Reassign event handlers for interactive elements
    eventsOnDashboard(sectionId, dashSection, data);
}


/* =======================================================================
    DASHBOARD SIDEBAR STUFF
======================================================================= */
document.addEventListener("DOMContentLoaded", function () {

    // 1. asignar eventos a la sidebar/dashboard
    const sideDashboard = document.getElementById("dashboard")

    setupClickOutsideClose({
        triggerElement: sideDashboard,
        targetElement: sideDashboard,
        customToggleFn: () => {
            const isExpanded = toggleState(sideDashboard);
            return isExpanded
        }
    });

    // Get all dashboard buttons
    const buttons = sideDashboard.querySelectorAll('.btn-dashboard');

    sideDashboard.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-dashboard');
        if (!btn || btn.classList.contains('active')) return; // Click was not on a dashboard button
        // prevent the same fetch on the table

        const sectionId = btn.getAttribute('data-section') || null;

        // Skip first button or buttons without sectionId
        if (!sectionId) return;

        e.stopPropagation();    // evita re abrir el sideDashboard menu

        // Remove active from all, add to clicked
        buttons.forEach(bton => bton.classList.remove('active'));
        btn.classList.add('active');

        // Show the corresponding section
        getDashboardSection(sectionId);

        // Close the side dashboard if open
        if (sideDashboard.getAttribute('data-state') === 'open') {
            sideDashboard.click();
        }
    });


    // this is for update some dashboard tab
    buttons[3].click()
});
