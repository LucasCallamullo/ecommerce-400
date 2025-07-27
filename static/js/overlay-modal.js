

/// <reference path="../js/base.js" />
/// <reference path="../js/backToTopBtn.js" />


/** Example usage for simple btn with modal    (Complete example in users / admin_profile.js):
    setupToggleableElement({
        toggleButton: document.getElementById('btn-open'),
        closeButton: document.getElementById('btn-close'),
        element: document.getElementById('modal'),
        overlay: document.getElementById('overlay'),
        onOpenCallback: () => console.log('Menu opened!') // Optional callback function
        onCloseCallback: () => console.log('Menu closed!') // Optional callback function
    });

/** Example usage for a modal with delegation
    const modalForm = document.querySelector('#form-new-product');
    const modalClose = document.querySelector('#form-new-product-close');
    const overlay = document.querySelector('#overlay-new-product');

    // Configura el modal UNA VEZ y obtén el método `open`
    const { open } = setupToggleableElement({
        closeButton: modalClose,
        element: modalForm,
        overlay: overlay,
        onOpenCallback: ({ params }) => {
            const { row } = params;
            // Custom Logic if u want ... example
            initInputImage(modalForm);
            initModalCancelBtns(modalForm, modalClose);
            calculateDiscountSubtotal(modalForm);
        },
        onCloseCallback: () => {
            // Custom Logic if u want
        }
    });

    // Delegación de eventos en tableSection
    tableSection.addEventListener('click', (e) => {
        const row = e.target.closest('.row-table');
        if (!row) return;

        // Abre el modal con datos de la fila clickeada
        open({ row });
    });
 * 
 * 
 */
const overlayManager = {
    // Stores references to event listeners so they can be removed later
    listeners: {
        click: null,
        keydown: null,
        popstate: null
    },

    /**
     * Opens the given overlay and sets up event listeners to handle closing.
     * 
     * @param {HTMLElement} overlay - The overlay element to display.
     * @param {Function} onClickHandler - Callback to execute when the overlay should close.
     */
    open(overlay, onClickHandler) {
        // Show the overlay by adding a CSS class
        overlay.classList.add('show');

        // Set up click listener to close when clicking outside the modal content
        if (!this.listeners.click) {
            this.listeners.click = (e) => {
                if (e.target === overlay) onClickHandler();
            };
            overlay.addEventListener('click', this.listeners.click);
        }

        // Set up Escape key listener to close the overlay
        if (!this.listeners.keydown) {
            this.listeners.keydown = (e) => {
                if (e.key === "Escape") onClickHandler();
            };
            document.addEventListener("keydown", this.listeners.keydown);
        }

        // Set up browser back button (popstate) to also close the overlay
        if (!this.listeners.popstate) {
            this.listeners.popstate = () => {
                history.pushState(null, null, window.location.pathname);
                onClickHandler();
            };
            // Push a fake state so the back button will trigger popstate
            history.pushState(null, null, window.location.pathname);
            window.addEventListener('popstate', this.listeners.popstate);
        }

        // Hide the back-to-top button if it's visible
        const backToTopBtn = document.getElementById("backToTop");
        if (backToTopBtn) toggleBackToTopButton(false, backToTopBtn);
    },

    /**
     * Closes the overlay and removes all associated event listeners.
     * 
     * @param {HTMLElement} overlay - The overlay element to hide.
     */
    close(overlay) {
        // Hide the overlay by removing the CSS class
        overlay.classList.remove('show');

        // Remove all active listeners and reset their references
        Object.entries(this.listeners).forEach(([type, handler]) => {
            if (!handler) return;

            const target = type === 'popstate' ? window : 
                          type === 'keydown' ? document : 
                          overlay;

            target.removeEventListener(type, handler);
            this.listeners[type] = null;
        });

        // Navigate back in browser history if popstate was used
        if (this.listeners.popstate) history.back();
    }
};


/**
 * Sets up a toggleable UI element (such as a modal or mobile menu) with automatic event management.
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

let overlayClickListener = false;  // Holds the current click listener for the overlay
function setupToggleableElement(options) {
    const { 
        toggleButton = null,
        closeButton, 
        element, 
        overlay, 
        flagStop = false, 
        onOpenCallback = null, 
        onCloseCallback = null,
        shouldOpen = null,
        customParams = {}
    } = options;

    if (!closeButton || !element || !overlay) {
        console.error('Missing required elements');
        return;
    }

    /**
     * Closes the toggleable element and overlay.
     * Also removes the click event listener from the close button to prevent memory leaks.
     * 
     * @param {Function} closeHandler - The function to remove from the close button's click event.
     */
    const closeHandler = () => {
        // if (onCloseCallback) onCloseCallback();
        if (onCloseCallback) onCloseCallback(customParams);
        toggleState(element);
        overlayManager.close(overlay);
        overlayClickListener = false;
    };

    /**
     * Opens the toggleable element and sets up necessary event listeners for closing.
     * Also manages event propagation if flagStop is enabled.
     * 
     * @param {Event} event - The click event from the toggle button.
     */
    // const openHandler = (e) => {
    const openHandler = (e, customData = {}) => {
        if (flagStop) e.stopPropagation();
        
        if (onOpenCallback) {
            onOpenCallback({ 
                event: e, 
                params: { ...customParams, ...customData }
            });
        }

        toggleState(element);
        
        overlayManager.open(overlay, closeHandler);
        overlayClickListener = true;

        // Listener para cerrar (siempre)
        if (!closeButton.__hasCloseListener) {
            closeButton.addEventListener('click', closeHandler);
            closeButton.__hasCloseListener = true;
        }
    };

    // Si hay toggleButton, agregamos listener (para compatibilidad)
    if (toggleButton && !toggleButton.__hasOpenListener) {
        // toggleButton.addEventListener('click', (e) => openHandler(e));
        toggleButton.addEventListener('click', (e) => {
            if (shouldOpen && !shouldOpen(e)) return; 
            openHandler(e);
        });
        toggleButton.__hasOpenListener = true;
    }

    // Permite abrir el modal manualmente
    return {
        open: (customData = {}) => openHandler(null, customData)  // Sin evento, con datos dinámicos
    };
}