/// <reference path="../../../../static/js/base.js" />

/// <reference path="../js/products_cards.js" />


/**
 * Maneja la búsqueda en tiempo real con debounce
 * @param {Event} e - Evento de input
 */
let debounceTimer = null;

function handleRealTimeSearch(e) {
    // Configuración del debounce (300ms)
    const DEBOUNCE_TIME = 300;

    clearTimeout(debounceTimer);
    
    const searchTerm = e.target.value.trim();
    const filtersCont = document.getElementById('filters');
    let make_filter = true
    
    // Solo buscar si hay al menos 3 caracteres o se está limpiando el campo
    if (searchTerm.length >= 3 || (make_filter && searchTerm.length < 3)) {
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            
            // Agregar término de búsqueda
            if (searchTerm) params.append('query', searchTerm);
            
            // Agregar todos los filtros disponibles
            const filterInputs = filtersCont.querySelectorAll('input[type="hidden"]');
            filterInputs.forEach(input => {
                if (input.value) params.append(input.name, input.value);
            });
            
            // Actualizar lista de productos
            fetchProducts(params);
            make_filter = searchTerm.length > 0;
            
        }, DEBOUNCE_TIME);
    }
}


/**
 * Obtiene productos con los filtros actuales
 * @param {URLSearchParams} params - Parámetros de búsqueda
 */
async function fetchProducts(params) {
    try {
        const url = `/product/search/?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Error en la búsqueda');
        
        const data = await response.json();
        // Make changes in the container and reassign events
        const container = document.getElementById('cont-product-list');
        container.innerHTML = data.html_cards;
        assignProductCardsForms(container)

    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // const container = document.querySelector('.cont-product-cards');
    const container = document.getElementById('cont-product-list');
    assignProductCardsForms(container);
    assignProductCardsModals(container);

    // Configurar event listener
    document.getElementById('sidebar-search').addEventListener('input', handleRealTimeSearch);
});