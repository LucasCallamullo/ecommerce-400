

/**
 * Opens the overlay and adds the event listener for click events.
 * @param {HTMLElement} overlay - The overlay element to open.
 * @param {Function} eventFunction - The function to execute when the overlay is clicked.
 * This function toggles the 'show' class to display the overlay and assigns a click event listener if not already assigned.
 */
function openOverlay(overlay, eventFunction) {
    overlay.classList.add('show');

    if (!overlayClickListener) {
        overlayClickListener = eventFunction;
        overlay.addEventListener('click', overlayClickListener); 

        // Desactiva el botón "Back to Top" si está visible   
        const backToTopBtn = document.getElementById("backToTop");
        if (backToTopBtn) toggleBackToTopButton(false, backToTopBtn);
    }

    // Add keydown listener for "Escape" key if not already added
    if (!overlayKeyListener) {
        overlayKeyListener = function (e) {
            if (e.key === "Escape") overlay.click();
        };
        document.addEventListener("keydown", overlayKeyListener);
    }

    // Add popstate listener for back button if not already added
    if (!overlayPopstateListener) {
        overlayPopstateListener = function() {
            // Push a new state to prevent immediate back navigation
            history.pushState(null, null, window.location.pathname);
            overlay.click();
        };
        
        // Push current state to history
        history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', overlayPopstateListener);
    }
}

/**
 * Closes the overlay and removes the event listener for click events.
 * @param {HTMLElement} overlay - The overlay element to close.
 * This function removes the 'show' class to hide the overlay and removes the click event listener.
 */
function closeOverlay(overlay) {
    overlay.classList.remove('show');
    
    if (overlayClickListener) {
        overlay.removeEventListener('click', overlayClickListener);  
        overlayClickListener = null; 
    }

    if (overlayKeyListener) {
        document.removeEventListener("keydown", overlayKeyListener);
        overlayKeyListener = null;
    }

    if (overlayPopstateListener) {
        window.removeEventListener('popstate', overlayPopstateListener);
        overlayPopstateListener = null;
        // Remove the extra state we added
        history.back();
    }
} 

/**
 * Generates a click event handler to close the overlay when clicked.
 * @param {HTMLElement} element - The element whose state is toggled when the overlay is clicked.
 * @param {HTMLElement} buttonClose - The button to close the modal.
 * @param {Function} closeHandler - The function to remove the event listener from the button.
 * @returns {Function} - The event handler function that will close the overlay on click.
 */
function closeOverlayOnClick(element, buttonClose=null, closeHandler=null) {
    return function (e) {
        if (e.target === this) {
            closeHandler();
            /* closeOverlay(this); 
            // toggleState(element);
            

            // Elimina el event listener del botón de cerrar
            if (buttonClose && closeHandler) {
                buttonClose.removeEventListener('click', closeHandler);
            } */
        }
    };
} 

/**
 * Sets up a toggleable UI element (such as a modal or mobile menu) with automatic event management.
 * 
 * Example usage:
 * setupToggleableElement({
 *     toggleButton: document.getElementById('btn-open'),
 *     closeButton: document.getElementById('btn-close'),
 *     element: document.getElementById('modal'),
 *     overlay: document.getElementById('overlay'),
 *     onOpenCallback: () => console.log('Menu opened!') // Optional callback function
 *     onCloseCallback: () => console.log('Menu closed!') // Optional callback function
 * });
 * 
 * Complete example in users / admin_profile.js
 * 
 * @param {Object} options - Configuration options for the toggleable element.
 * @param {HTMLElement} options.toggleButton - The button that opens the element.
 * @param {HTMLElement} options.closeButton - The button that closes the element.
 * @param {HTMLElement} options.element - The element to be shown/hidden (e.g., a modal or menu).
 * @param {HTMLElement} options.overlay - The overlay displayed behind the element.
 * @param {boolean} [options.flagStop=false] - Optional flag to stop event propagation when opening (default is false).
 * @param {Function} [options.onOpenCallback=null] - Optional function to execute when the element is opened.
 * @param {Function} [options.onCloseCallback=null] - Function to execute on close
 */
function setupToggleableElement(options) {
    const { 
        toggleButton, closeButton, element, overlay, 
        flagStop = false, onOpenCallback = null, onCloseCallback = null 
    } = options;

    // Basic validation to ensure all required elements are present
    if (!toggleButton || !closeButton || !element || !overlay) {
        console.log('Some of the elements are missing.');
        return;
    }

    /**
     * Closes the toggleable element and overlay.
     * Also removes the click event listener from the close button to prevent memory leaks.
     * 
     * @param {Function} closeHandler - The function to remove from the close button's click event.
     */
    function closeElement(closeHandler) {
        toggleState(element);       // Hide the element (toggle class or visibility)
        closeOverlay(overlay);     // Hide the overlay

        // Ejecutar callback de cierre si existe
        if (onCloseCallback) onCloseCallback();
        // if (typeof onCloseCallback === 'function') onCloseCallback();

        if (closeButton && closeHandler) {
            closeButton.removeEventListener('click', closeHandler); // Clean up event listener
        }
    }

    /**
     * Opens the toggleable element and sets up necessary event listeners for closing.
     * Also manages event propagation if flagStop is enabled.
     * 
     * @param {Event} event - The click event from the toggle button.
     */
    function openElement(event) {
        if (flagStop) {
            event.stopPropagation(); // Prevent event bubbling if specified
        }

        toggleState(element); // Show the element

        if (typeof onOpenCallback === 'function') {
            onOpenCallback(); // Ejecuta la función pasada como parámetro si existe
        }

        // Define the handler for closing, which is self-removing
        const closeHandler = () => closeElement(closeHandler);
        closeButton.addEventListener('click', closeHandler); // Listen for close button click

        // Show the overlay and allow closing by clicking outside the element
        openOverlay(overlay, closeOverlayOnClick(element, closeButton, closeHandler));
    }

    // Attach click event to toggle button to open the element
    toggleButton.addEventListener('click', openElement);
}