

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/forms.js" />


/**
 * Sends JSON data to the backend using Fetch with CSRF protection.
 *
 * This helper:
 *   - Sends the given `jsonData` to `url` using the specified HTTP `method`.
 *   - Automatically adds the CSRF token in the headers.
 *   - Parses the JSON response.
 *   - Shows any validation errors returned by the server.
 *   - Throws an error if the response is not OK to stop further logic.
 *   - Shows a success alert if the request succeeds.
 *
 * @param {Object} jsonData - The data to send in the request body.
 * @param {string} url - The endpoint URL to send the request to.
 * @param {string} method - The HTTP method to use (e.g., "PATCH", "POST").
 * @throws {Error} Throws if the server response is not OK.
 */
async function formToSubmit(jsonData, url, method) {
    const response = await fetch(url, {
        method: method,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.errors) showErrorAlerts(data.errors);
        else openAlert(data.detail || "Error while editing");
        throw new Error(data.detail || "Error while editing");
    }

    openAlert('Se realizaron los cambios correctamente.' || data.detail);
}


/**
 * Binds submit events for all forms related to the Store tab.
 * 
 * This handles:
 *   - The main store form (general store data)
 *   - Multiple shipment method forms
 *   - Multiple payment method forms
 *
 * Each form uses `handleGenericFormBase` to ensure:
 *   - Double submit prevention
 *   - Spinner animation (optional)
 *   - CSRF protection via `formToSubmit`
 *   - JSON body submission with PATCH method
 * 
 * @param {HTMLElement} container - The container that holds all store tab forms.
 */
function storeTabEvents(container) {

    // Bind submit for the main store data form
    const form = container.querySelector('.form-store-grid');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleGenericFormBase({
            form: form,
            submitCallback: async () => {
                try {
                    const jsonData = sanitizeFormData(form);
                    const url = window.TEMPLATE_URLS.storeUpdate.replace('{store_id}', form.dataset.index);
                    await formToSubmit(jsonData, url, 'PATCH');
                } catch (err) {
                    throw new Error("Error Valid Form");
                }
            },
            // Spinner animation config (optional)
            flag_anim: true,
            time_anim: 1000
        });
    });

    // Bind submit for each shipment method form
    const formShipments = container.querySelectorAll('.shipments-form');
    formShipments.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            await handleGenericFormBase({
                form: form,
                submitCallback: async () => {
                    try {
                        const jsonData = sanitizeFormData(form);
                        const url = window.TEMPLATE_URLS.shipmentUpdate.replace('{shipment_id}', form.dataset.index);
                        await formToSubmit(jsonData, url, 'PATCH');
                    } catch (err) {
                        throw new Error("Error Valid Form");
                    }
                },
                flag_anim: true,
                time_anim: 1000
            });
        });
    });

    // Bind submit for each payment method form
    const formPayments = container.querySelectorAll('.payments-form');
    formPayments.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            await handleGenericFormBase({
                form: form,
                submitCallback: async () => {
                    try {
                        const jsonData = sanitizeFormData(form);
                        const url = window.TEMPLATE_URLS.paymentUpdate.replace('{payment_id}', form.dataset.index);
                        await formToSubmit(jsonData, url, 'PATCH');
                    } catch (err) {
                        throw new Error("Error Valid Form");
                    }
                },
                flag_anim: true,
                time_anim: 1000
            });
        });
    });
}


/**
 * Handles events related to the users tab:
 * - Submits role-edit forms with PATCH requests.
 * - Submits the user filter form (with search and role select) via GET.
 * - Automatically submits the filter form when the role select changes.
 * 
 * @param {HTMLElement} container - The container element holding the users tab content.
 * @param {string} tabId - The current tab identifier (used to build URLs).
 */
function usersTabEvents(container, tabId) {
    // Forms to edit user roles
    const formUserEdits = container.querySelectorAll('.form-user-role');
    formUserEdits.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            await handleGenericFormBase({
                form: form,
                submitCallback: async () => {
                    try {
                        const jsonData = sanitizeFormData(form);
                        const url = window.TEMPLATE_URLS.userRoleUpdate.replace('{user_id}', form.dataset.index);
                        await formToSubmit(jsonData, url, 'PATCH');
                    } catch (err) {
                        throw new Error("Error Valid Form");
                    }
                },
                // Optional: enable spinner animation on submit button
                flag_anim: true,
                time_anim: 1000    // or 0 is optional if flag is true
            });
        });
    });

    // Filter form for users table (search + role select)
    const formTable = container.querySelector('#form-user-table-tab');
    const select = formTable.querySelector("select[name='role']");
    formTable.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formTable);
        const params = new URLSearchParams(formData).toString();
        const url = window.TEMPLATE_URLS.profileTabs.replace('{tab_name}', tabId);

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        // Clear the container and inject the new HTML content
        container.innerHTML = data.html;
        usersTabEvents(container, tabId);
    });

    // When the role select changes, submit the filter form automatically
    select.addEventListener('change', () => {
        formTable.requestSubmit();
    });
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
    
    const menuItems = document.querySelectorAll('.btn-tabs');
    const divTabs = document.querySelectorAll('.tab-content');

    menuItems.forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();

            // Remove 'active' class from all tab buttons
            menuItems.forEach(i => i.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.getAttribute('data-tab');
            const container = document.getElementById(tabId);

            // Hide all tab content divs and show only the selected one
            divTabs.forEach(div => div.style.display = 'none');
            container.style.display = 'block';

            try {
                const url = window.TEMPLATE_URLS.profileTabs.replace('{tab_name}', tabId);
                const response = await fetch(url);
                const data = await response.json();
            
                // Clear the container and insert the returned HTML content
                container.innerHTML = data.html;
            
                // Call event setup functions based on active tab
                if (tabId === 'store-data-tab') {
                    storeTabEvents(container);
                } else if (tabId === 'users-tab') {
                    usersTabEvents(container, tabId);
                }

            } catch (error) {
                console.error('Error loading content:', error);
                container.innerHTML = '<p>Error loading content.</p>';
            }
        });
    });

    // Automatically trigger click on the second tab to show it on page load
    const firstTab = menuItems[0];
    if (firstTab) {
        firstTab.click();
    }

    const formsClose = document.querySelectorAll('.form-close-profile');
    formsClose.forEach((form) => {
        if (form) widgetUserForms(form, "Close");
    });
});

