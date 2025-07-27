/// <reference path="../js/base.js" />
/// <reference path="../js/alerts.js" />


/**
 * Dark Mode Event Listener.
 * 
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    const themeIcons = document.querySelectorAll('.theme-icon');
    const htmlElement = document.documentElement;

    function setTheme(theme) {
        // Limpia todas las clases primero
        htmlElement.classList.remove('light-mode', 'dark-mode');
        
        if (theme === 'light') {
            htmlElement.classList.add('light-mode');
            localStorage.setItem('themePreference', 'light');
        } else if (theme === 'dark') {
            htmlElement.classList.add('dark-mode');
            localStorage.setItem('themePreference', 'dark');
        }
        
        updateThemeIcons(theme);
    }

    function updateThemeIcons(theme) {
        const isDark = theme === 'dark';
        
        themeIcons.forEach(icon => {
            icon.classList.toggle('ri-moon-line', !isDark);
            icon.classList.toggle('ri-contrast-2-line', isDark);
        });
    }

    function cycleTheme() {
        const currentTheme = htmlElement.classList.contains('dark-mode') ? 'dark' : 'light';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    }
    
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', cycleTheme);
    });

    // Only update if we're in auto mode
    if (!localStorage.getItem('themePreference')) {
        // Inicializa con el tema claro por defecto (ignorando localStorage)
        setTheme('light');
    } else {
        const currentPreference = localStorage.getItem('themePreference') || 'light';
        setTheme(currentPreference);
    }
});


/**
 * Retrieves the value of a specified cookie by its name, commonly used for CSRF tokens.
 * 
 * @param {string} name - The name of the cookie whose value is to be retrieved.
 * @returns {string|null} The value of the cookie if found, otherwise null.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Checks if the cookie has the desired name
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                // Extracts and decodes the cookie value
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


/**
 * Formats a number by adding dots as thousand separators.
 * 
 * @param {number|string} number - The number to be formatted (can be an integer, float, or string).
 * @returns {string} The formatted number as a string with dots as thousand separators.
 */
function formatNumberWithPoints(number) {
    // If the value is null, undefined, or an empty string, return a blank space
    if (number === null || number === undefined || number === "") return " ";

    // Convert the string value to a number
    const price = parseFloat(number);
    
    // Check if the price is 0
    if (price === 0) return 'Gratis';

    // If the number is an integer, format it with thousand separators using dots
    if (Number.isInteger(price)) return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // If the number has decimals, format it by separating thousands with dots and decimals with a comma
    let [integerPart, decimalPart] = price.toString().split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
}
