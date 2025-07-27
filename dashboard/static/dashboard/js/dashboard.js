/// <reference path="../../../../static/js/base.js" />

/// <reference path="./events/products.js" />
/// <reference path="./events/categories.js" />

/// <reference path="./endpoints/images.js" />
/// <reference path="./endpoints/products.js" />
/// <reference path="./endpoints/categories.js" />


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
async function updateDashboardSection(form, tableId) {

    // 1. Get info from form to update table section
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    // 2. Build the final URL using the form's action and serialized query parameters
    let url, params, finalUrl;

    if (tableId === 'table-products') {
        url = window.TEMPLATE_URLS.filterProducts
    }

    params = new URLSearchParams(formData).toString();
    finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`;

    try {
        // 3. Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;

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
        const tableSection = document.getElementById(tableId);
        tableSection.innerHTML = data.html;

        // 6. Rebind all dynamic events for the updated section
        if (tableId === 'table-products') {
            // rowsProductsEvents(tableSection);     // For row click/modal functionality
            eventsTableProducts(tableSection);    // For forms and filters
        }

    } catch (error) {
        // Log any errors to the console for debugging
        console.error('Error:', error);
    } finally {
        // 7. Re-enable the submit button regardless of success or failure
        submitButton.disabled = false;
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
function eventsOnDashboard(sectionId, dashSection) {
    const overlay = document.querySelector('#overlay-dashboard');

    // 1. create handler events
    const sectionHandlers = {
        products: (dashSection) => {
            // Initialize modal for adding products
            formModalNewProduct(dashSection, overlay);

            // Assign delegation event to product rows 
            rowsModalUpdateProduct(dashSection, overlay);

            // Configure filter button interactions
            formSelectFiltersProducts(dashSection);

            // Handle filter reset actions
            formResetFilters(dashSection, 'table-products');

            // Set up sorting controls
            formArrowsSortedProducts(dashSection);

            // Implement real-time search functionality
            formInputSearchRealTime(dashSection);
            
            /* Dynamic table events */
            // Initialize table-specific interactions
            const tableSection = dashSection.querySelector(`#table-products`);
            eventsTableProducts(tableSection);
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
    dashSection.innerHTML = data.html; 
    dashSection.classList.add('active');

    // 4. Reassign event handlers for interactive elements
    eventsOnDashboard(sectionId, dashSection);
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

    // asignar eventos de mostrar a las secciones
    const buttons = sideDashboard.querySelectorAll('.btn-dashboard');

    buttons.forEach((btn, index) => {
        const sectionId = btn.getAttribute('data-section');

        // This replaces 'continue' // This skips the rest of the callback for this button
        if (index == 0 || !sectionId) return;  
        
        btn.addEventListener('click', (event) => {
            event.stopPropagation();    // Cancels click propagation

            buttons.forEach(bton => bton.classList.remove('active'));
            btn.classList.add('active');

            // Show the corresponding section
            getDashboardSection(sectionId);

            // Close the side dashboard if open
            if (sideDashboard.getAttribute('data-state') === 'open') sideDashboard.click();
        });
    });

    // this is for update some dashboard tab
    buttons[3].click()


    

});
