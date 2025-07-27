

// Stores event handlers for proper cleanup
const eventHandlersMap = new Map();


const ICONS = {
    // from alerts
    close: 'ri-close-circle-line',
    success: 'ri-checkbox-circle-line',
    error: 'ri-close-circle-line',
    wsp: 'ri-whatsapp-line',
    cross: 'ri-close-fill',
    heart: 'ri-heart-fill',
    heartEmpty: 'ri-heart-line'
};


/**
 * Defined in static/home/js/base.js
 * Toggles the state of an element/component between 'open' and 'closed'
 * based on its current state or a forced value, and triggers associated animations.
 * @param {HTMLElement} element - The element whose state is being toggled.
 * @param {boolean} [force] - Optional. If provided, forces the state to open (true) or closed (false).
 * @returns {boolean} - Returns a boolean indicating the new state (true if opened, false if closed).
 */
function toggleState(element, force) {
    let newState;
    
    // Si el elemento no tiene el atributo data-state, lo inicializamos como 'closed'
    if (!element.hasAttribute('data-state')) {
        element.setAttribute('data-state', 'null');
    }
    
    if (typeof force !== 'undefined') {
        // Si force está definido, forzar el estado al valor proporcionado
        newState = force;
    } else {
        // Si force no está definido, alternar el estado actual
        const isOpen = element.getAttribute('data-state') === 'open';
        newState = !isOpen;
    }
    
    // Establecer el nuevo estado en el atributo data-state
    element.setAttribute('data-state', newState ? 'open' : 'closed');
    
    return newState;
}


/**
 * Smoothly scrolls to a section with temporary visual highlight
 * @param {HTMLElement} section - DOM element to scroll to
 * @param {string} [color='red'] - Border highlight color (default: red)
 * @returns {void}
 */
function scrollToSection(section, color = 'red') {
    if (!section) return; // Basic null check
    
    // Scroll with offset managed via CSS (scroll-margin-top)
    section.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // Temporary highlight effect (2 seconds)
    section.style.boxShadow = `0 0 0 2px ${color}`;
    setTimeout(() => section.style.boxShadow = '', 2000);
}


// Esto lo podés poner al final de tu archivo JS, o en un <script> después de cargar la página
function forceReload() {
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now()); // Crea un parámetro único cada vez
    window.location.href = url.toString();
};


/*
// Get the device state from the meta tag
put this <meta id="device-meta" data-state="desktop"> in html in a "head"

const deviceMeta = document.getElementById("device-meta");
const updateDeviceState = () => {
    const isMobile = window.innerWidth <= 768;
    deviceMeta.setAttribute("data-state", isMobile ? "mobile" : "desktop");
};

updateDeviceState(); // Set initial state

window.addEventListener("resize", updateDeviceState);

and included this verification in the functions in the future
document.addEventListener("DOMContentLoaded", function () {
    // Prevent unnecessary content loading on mobile, as this listener is only needed for desktop
    const deviceState = deviceMeta.getAttribute("data-state");
    if (deviceState === "mobile") return;

    // resto del codigo
}
*/