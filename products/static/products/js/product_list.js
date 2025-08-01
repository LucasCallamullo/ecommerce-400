/// <reference path="../../../../static/js/base.js" />

/// <reference path="../js/products_cards.js" />


window.ProductStore = {
    data: [],
    setData(newData) {
        this.data = newData;
    },
    getData() {
        return this.data;
    },
    /**
     * Obtiene marcas únicas a partir de los productos
     * @returns {Array<{id: number, name: string}>}
     */
    getUniqueBrands() {
        const brandMap = new Map();

        this.data.forEach(product => {
            const brand = product.brand;
            if (brand && !brandMap.has(brand.id)) {
                brandMap.set(brand.id, { id: brand.id, name: brand.name });
            }
        });

        return Array.from(brandMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    },
    /**
     * Filtra los productos por ID de marca
     * @param {number} brandId
     * @returns {Array<Object>}
     */
    filterByBrand(brandId) {
        return this.data.filter(product => product.brand?.id === brandId);
    },

    filterByName(query) {
        if (!query) return this.data;
        const words = query.toLowerCase().split(/\s+/);  // divide por espacios
        return this.data.filter(p => {
            const name = p.name.toLowerCase();
            return words.every(word => name.includes(word));  // todas las palabras deben estar
        });
    },

    filterByPrice(min, max) {
        return this.data.filter(p => p.price >= min && p.price <= max);
    },
    filterByCategory(categoryId) {
        return this.data.filter(p => p.category_id === categoryId);
    },
    orderByPrice(desc = false) {
        return [...this.data].sort((a, b) =>
        desc ? b.price - a.price : a.price - b.price
        );
    }
};


/**
 * Maneja la búsqueda en tiempo real con debounce
 * @param {Event} e - Evento de input
 */
function handleRealTimeSearch(e, container) {
    const form = e.currentTarget;
    clearTimeout(form.debounceTimer);
    
    const searchTerm = e.target.value.trim();
    
    if ((searchTerm.length >= 3 || searchTerm.length < 3) && searchTerm !== form.lastSearchTerm) {
        form.debounceTimer = setTimeout(() => {
            if (searchTerm) {
                const products = ProductStore.filterByName(searchTerm);
                updateProductListCards(container, products);
            }
            form.lastSearchTerm = searchTerm;
        }, 800);    // time to debounce
    }
}



/**
 * Obtiene productos con los filtros actuales
 * @param {URLSearchParams} params - Parámetros de búsqueda
 */
let counterNavigating = 0;
async function fetchProductList(dictAdd, activeCounter = true) {
    // 1. Obtener todos los filtros primero
    const filtersCont = document.getElementById('filters');
    const filterInputs = filtersCont.querySelectorAll('input[type="hidden"]');

    // 2. Crear un diccionario base con los filtros del HTML
    const dictBase = {};
    filterInputs.forEach(input => {
        if (input.value) dictBase[input.name] = input.value;
    });

    // 3. Sobrescribir con lo que viene por parámetro
    Object.assign(dictBase, dictAdd);

    // 4. Crear los parámetros finales
    const params = new URLSearchParams(dictBase);
    
    const urlBase = `${window.TEMPLATE_URLS.productList.replace('{product_id}', '')}`;
    const url = `${urlBase}/?${params.toString()}`;
    try {
        // const url = `/api/product/?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la búsqueda');
        const data = await response.json();

        // Make changes in the container and reassign events
        const container = document.getElementById('cont-product-cards');

        ProductStore.setData(data.products)
        updateProductListCards(container, data.products, data)
        
        // Solo actualizar la URL si no se está navegando desde el historial
        if (activeCounter) { 
            const queryString = `?${params.toString()}`;
            history.pushState(null, '', queryString);
            counterNavigating++;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}


window.addEventListener('popstate', () => {
    if (counterNavigating > 0) {
        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        fetchProductList(params, false);
        counterNavigating--;

        // Actualizar visualmente el botón activo
        const container = document.getElementById('cont-pagination');
        const btns = container.querySelectorAll('.btn-page');
        const currentPage = params.page || '1';
        btns.forEach(btn => {
            btn.classList.remove('border-main');
            if (btn.dataset.number === currentPage) btn.classList.add('border-main');
        });
    }
});



function updateContPagination() {
    const container = document.getElementById('cont-pagination');
    const totalPages = parseInt(container.dataset.totalPages);
    const pageNum = parseInt(container.dataset.pageNum);

    container.innerHTML = ''; // Limpiar contenido anterior

    for (let num = 1; num <= totalPages; num++) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-28 border-hover bolder btn-page';
        if (num === pageNum) btn.classList.add('border-main');

        btn.dataset.number = num;
        btn.innerHTML = `${num}`;
        container.appendChild(btn);
    }

    if (!container._hasEvent) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button.btn-page');
            if (!btn || btn.classList.contains('border-main')) return;

            // Actualizar visualmente el botón activo
            const exBtnMain = container.querySelector('.border-main');
            if (exBtnMain) exBtnMain.classList.remove('border-main');
            btn.classList.add('border-main');

            const num = btn.dataset.number;
            fetchProductList({ page: num });
        });
        container._hasEvent = true;
    }
}


function updateContainerBrands(brands) {
    const container = document.getElementById('cont-brands');
    container.innerHTML = '';

    const title = '<h3>Marcas</h3>';
    const brandsHTML = brands.map(b => {
        const brand = deepEscape(b);
        return /*html*/`
            <label class="d-flex gap-1 radio-brand">
                <input type="radio" name="brand" value="${brand.id}" data-id="${brand.id}">
                ${brand.name}
            </label>
        `;
    }).join('');

    container.insertAdjacentHTML('beforeend', title + brandsHTML);

    // Delegación de evento de cambio
    container.addEventListener('change', (e) => {
        const input = e.target;

        // Asegurarse que el evento provenga de un input tipo radio con name "brand"
        if (input.tagName === 'INPUT' && input.type === 'radio' && input.name === 'brand') {
            const brandId = parseInt(input.dataset.id);

            const filtered = ProductStore.filterByBrand(brandId);
            const contProducts = document.getElementById('cont-product-cards');
            updateProductListCards(contProducts, filtered);
        }
    }); 
}


document.addEventListener('DOMContentLoaded', () => {

    // update some filters stuff
    updateContainerBrands(ProductStore.getUniqueBrands());

    const container = document.getElementById('cont-product-cards');
    updateProductListCards(container, ProductStore.getData());

    // inicializar buscador lateral csr
    const form = document.getElementById('sidebar-search');
    form.debounceTimer = null;
    form.lastSearchTerm = '';
    form.addEventListener('input', (e) => handleRealTimeSearch(e, container));

    // para los eventos de paginacion
    updateContPagination();

    
    

    // esto es por si llega una url construida y queremos actualizar en base a esa url
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
        const dict = {};
        for (const [key, value] of params.entries()) {
            dict[key] = value;
        }
        fetchProductList(dict);
    }
});
