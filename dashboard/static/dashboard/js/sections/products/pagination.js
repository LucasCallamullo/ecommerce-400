/// <reference path="../../../../../../static/js/base.js" />
/// <reference path="../../../../../../static/js/utils.js" />
/// <reference path="../../../../../../favorites/static/favorites/js/add_favorites.js" />


/**
 * Fetches a product list using the current filters and updates the product view.
 * 
 * @param {Object} dictAdd - Additional filters to apply (overrides base filters).
 * @param {boolean} activeCounter - Whether to update browser history and navigation counter.
 */
let counterNavigating = 0;
async function fetchProductList(pageNum, activeCounter = true) {

    /**
     * Triggers a server-side search by submitting hidden filters form
     */
    const section = document.getElementById('products')
    const formSelect = section.querySelector('.form-select-filters');
    const inputPage = formSelect.querySelector('input[name="page"]');
    const btn = formSelect.querySelector('button[type="submit"]');

    // Trigger the dashboard update with the current form
    inputPage.value = pageNum;
    btn.click();     // triggers full submit (respects form submit handlers)

    // 4. Create URLSearchParams from the combined filter dictionary
    const formData = new FormData(formSelect);     // Get all form inputs
    const params = new URLSearchParams(formData);  // Convert to query string

    // Only update URL and counter if not triggered from browser navigation
    if (activeCounter) { 
        const queryString = `?${params.toString()}`;
        history.pushState(null, '', queryString);
        counterNavigating++;
    }
}


/**
 * Updates the pagination control container with page number buttons
 * and sets up an event listener to handle pagination clicks.
 *
 * The container must have two data attributes:
 * - data-total-pages: total number of available pages.
 * - data-page-num: currently active page.
 */
function updateContPagination(container, pagination) {
    const totalPages = parseInt(pagination.total_pages); // Total number of pages
    const pageNum = parseInt(pagination.page);       // Current page

    container.innerHTML = '';

    // Generate a button for each page number
    for (let num = 1; num <= totalPages; num++) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-28 border-hover bolder btn-page';

        // Highlight the current page with a special class
        if (num === pageNum) btn.classList.add('border-main');
        btn.dataset.number = num;
        btn.innerHTML = `${num}`;
        container.appendChild(btn);
    }

    // Attach event listener only once using a flag
    if (!container._hasEvent) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button.btn-page');

            // Ignore clicks on the active page button or non-buttons
            if (!btn || btn.classList.contains('border-main')) return;

            // Remove highlight from previously active button
            const exBtnMain = container.querySelector('.border-main');
            if (exBtnMain) exBtnMain.classList.remove('border-main');

            // Highlight the newly selected page
            btn.classList.add('border-main');

            // Extract page number and trigger product fetch
            const num = btn.dataset.number;
            fetchProductList(num);
        });

        // Mark container as initialized to avoid duplicate listeners
        container._hasEvent = true;
    }
}


/**
 * Handles the browser's back/forward navigation (popstate event).
 * 
 * This function sets up an event listener for the `popstate` event, which is triggered
 * when the user navigates through the browser history (e.g., using the back or forward buttons).
 * 
 * When triggered, it performs the following actions:
 * 
 * 1. Checks if the `counterNavigating` is greater than 0 to avoid redundant fetches.
 * 2. Parses the current URL parameters from `window.location.search`.
 * 3. Calls `fetchProductList(params, false)` to update the product list without pushing a new state.
 * 4. Decrements the `counterNavigating` to track user-driven navigation.
 * 5. Updates the pagination buttons UI to visually reflect the current page.
 * 
 * Note: This function should be called once to initialize the listener.
 * It assumes that `counterNavigating` is defined in the global scope
 * and that `fetchProductList` is a function responsible for fetching and rendering products.
 */
function historyPopState() {
    window.addEventListener('popstate', () => {
        if (counterNavigating > 0) {
            const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
            fetchProductList(params, false);
            counterNavigating--;

            // Update pagination button styles to reflect the active page
            const container = document.getElementById('cont-pagination');
            const btns = container.querySelectorAll('.btn-page');
            const currentPage = params.page || '1';
            btns.forEach(btn => {
                btn.classList.remove('border-main');
                if (btn.dataset.number === currentPage) btn.classList.add('border-main');
            });
        }
    });
}
