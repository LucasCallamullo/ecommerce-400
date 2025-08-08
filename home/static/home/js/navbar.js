

/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/outside-click.js" />


// ========================================================================
//                   Main Nav Fixed DESKTOP
// ========================================================================
let isMainNavFixed = false; // Flag to track the state of the navbar

function mainNavFixedSetup() {

    const header = document.querySelector("header");
    const nav = header.querySelector("#cont-main-nav");
    const navList = nav.querySelector("#main-nav-list");

    const logo = header.querySelector('.cont-logo-fixed');
    
    const headerHeight = header.offsetHeight;
    
    function handleScroll() {
        if (!isMainNavFixed && window.scrollY > headerHeight) {
            
            
            nav.classList.add("fixed-nav", "active");
            navList.classList.add("fixed-layout");

            // Add fixed navigation and logo
            if (logo.dataset.state === 'closed') {
                toggleState(logo, true);
            }

            isMainNavFixed = true;

        } else if (isMainNavFixed && window.scrollY <= headerHeight) {

            
            navList.classList.remove("fixed-layout");
            
            nav.classList.remove("fixed-nav", "active");
            // Remove fixed navigation and logo
            if (logo.dataset.state === 'open') {
                toggleState(logo, false);
            }
            isMainNavFixed = false;
        }
    }

    // Only add the scroll event listener when needed
    window.addEventListener("scroll", handleScroll, { passive: true });
}


// ========================================================================
// Evento de anmimaciones en drop menu categories GENERAL DESKTOP AND MOBILE
// ========================================================================
function dropdownArrowRotate() {
    // Configuración para los dropdowns
    const dropdownBtns = document.querySelectorAll(".dropdown-btn");
    const dropdownMenus = document.querySelectorAll(".dropdown-menu");
    const arrowDrops = document.querySelectorAll(".arrow-drop"); // Seleccionar las flechas

    dropdownBtns.forEach((btn, index) => {
        const menu = dropdownMenus[index];     // Relacionar el botón con su menú
        const arrowDrop = arrowDrops[index];     // Relacionar el botón con su flecha

        // Configurar el comportamiento de "clic fuera"
        setupClickOutsideClose({
            triggerElement: btn,
            targetElement: menu,
            customToggleFn: () => {
                const isExpanded = toggleState(menu);
                arrowDrop.classList.toggle("rotate", isExpanded);
                return isExpanded
            }
        });
    });
}


// ========================================================================
//             EVENTS FOR DROPDOWN SUB CONTENT
// ========================================================================
function dropdownMenuSubcategories() {
    const dropdownItems = document.querySelectorAll(".dropdown-item");

    let hideTimeout, showTimeout;
    let isSubMenuVisible = false;
    let flagOneTime = false;
    let sameDropdownItem = -1;

    const positionSubMenu = (item, subMenu, index) => {
        if ( !item || !subMenu ) return;

        const rect = item.getBoundingClientRect();
        const subMenuHeight = subMenu.offsetHeight;
        
        subMenu.style.visibility = "hidden";
        subMenu.style.position = "fixed";
        subMenu.style.left = `${rect.right}px`;
        subMenu.style.zIndex = "9999";

        if ( index >= 7 ) {
            subMenu.style.top = `${rect.bottom - subMenuHeight}px`;
            if ( !flagOneTime ) {
                flagOneTime = true
                positionSubMenu(item, subMenu, index);
            }
        } else {
            subMenu.style.top = `${rect.top}px`;
        }
        subMenu.style.visibility = "visible";
    }

    let mainNavCloseOneTime = false;
    // Function to handle scroll event only when submenu is visible
    const onScroll = (item, subMenu, index) => {
        if ( !isSubMenuVisible ) return;
        
        //conditions to hide submenu when switching from main navbar to fixed navbar
        if ( isMainNavFixed && !mainNavCloseOneTime ) {
            closeSubMenu(subMenu, index, 10);
            mainNavCloseOneTime = true;
        } else if ( !isMainNavFixed && mainNavCloseOneTime) {
            mainNavCloseOneTime = false;
        }

        window.requestAnimationFrame(() => positionSubMenu(item, subMenu, index));
    }
    
    const scrollListeners = new Map(); // Guardará las funciones de cada índice

    function showSubMenu(item, subMenu, index) {
        if ( isSubMenuVisible && sameDropdownItem != index ) closeSubMenu(subMenu, index, 10);
            
        clearTimeout(hideTimeout);
        sameDropdownItem = index;

        showTimeout = setTimeout(() => {
            subMenu.style.display = "block";
            positionSubMenu(item, subMenu, index);

            if (!isSubMenuVisible) {
                flagOneTime = false;
                isSubMenuVisible = true;
                activeSubMenuIndex = -1;

                // Crear función con los parámetros correctos
                const scrollHandler = (event) => onScroll(item, subMenu, index);
                scrollListeners.set(index, scrollHandler);

                window.addEventListener("scroll", scrollHandler);
            }
        }, 100);
    }

    function closeSubMenu(subMenu, index, timer) {
        clearTimeout(showTimeout);

        hideTimeout = setTimeout(() => {
            subMenu.style.display = "none";
            isSubMenuVisible = false;
            sameDropdownItem = -1;

            // Eliminar correctamente el evento scroll usando el Map
            if (scrollListeners.has(index)) {
                window.removeEventListener("scroll", scrollListeners.get(index));
                scrollListeners.delete(index);
            }
        }, timer);
    }

    dropdownItems.forEach((item, index) => {
        const subMenu = item.querySelector(".sub-dropdown-content");
        if (!item || !subMenu) return;

        subMenu.dataset.index = index;
        item.dataset.index = index;

        // Show submenu on hover
        item.addEventListener("mouseenter", () => {
            showSubMenu(item, subMenu, index);
        });
            
        item.addEventListener("mouseleave", () => {
            closeSubMenu(subMenu, index, 100);
        });

        // Hide submenu when leaving it
        subMenu.addEventListener("mouseleave", () => {
            if (sameDropdownItem == index) return;
            closeSubMenu(subMenu, index, 10);
        });
    });
}


// ========================================================================
//             MAIN NAV BAR MOBILE - MENU SHOW UTILS
// ========================================================================
function setupNavToggle() {
    // This dict configure the events add and remove automatically
    setupToggleableElement({
        toggleButton: document.getElementById('nav-toggle'),
        closeButton: document.getElementById('menu-mobile-close'),
        element: document.getElementById('menu-mobile'),
        overlay: document.getElementById('overlay-menu-mobile'),
    });
}


// ========================================================================
//             MAIN NAV BAR MOBILE - SEARCH BAR MOBILE UTILS
// ========================================================================
function setupSearchBarMobile() {
    const searchButton = document.getElementById('top-btn-search');
    const searchForm = document.getElementById('search-bar-mobile');
    const backButton = document.getElementById('back-search-form');

    /**
     * Closes the search form by toggling its visibility and updating the aria-expanded attribute.
     */
    function closeSearch() {
        toggleState(searchForm);
        const isExpanded = searchButton.getAttribute("aria-expanded") === "true";
        searchButton.setAttribute("aria-expanded", !isExpanded);
    }

    // When the form is shown, enable the back button to close it
    backButton.addEventListener('click', closeSearch);

    /**
     * Sets up the click-outside behavior for the search form.
     * When the search button is clicked, the form toggles visibility.
     * If the user clicks outside the form, it closes automatically.
     * Additionally, when the form is expanded, the back button can close it.
     */
    setupClickOutsideClose({
        triggerElement: searchButton,
        targetElement: searchForm,
        customToggleFn: () => {
            return toggleState(searchForm);
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    
    mainNavFixedSetup();
    dropdownMenuSubcategories();
    dropdownArrowRotate();
    setupNavToggle();
    setupSearchBarMobile();
});

