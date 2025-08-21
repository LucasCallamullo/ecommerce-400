

function renderProductsTable(table, products, extraParams = null) {

    // When there are no products in the list...
    if (products.length === 0) {
        // Build filters info dynamically from extraParams
        let resumenHtml = "";

        if (extraParams?.category) {
            resumenHtml += /*html*/`
                <p class="bolder text-secondary">Categoría: 
                    <span class="text-primary">${extraParams.category.name}</span>
                </p>
            `;
        }
        if (extraParams?.subcategory) {
            resumenHtml += /*html*/
            `<p class="bolder text-secondary"> Subcategoría: 
                <span class="text-primary">${extraParams.subcategory.name}</span>
            </p>`;
        }
        if (extraParams?.available !== undefined) {
            resumenHtml += /*html*/`
            <p class="bolder text-secondary">Disponibilidad: 
                <span class="text-primary">${
                    extraParams.available === "1" ? "Disponible" :
                    extraParams.available === "0" ? "No Disponible" : "Todos"
                }</span>
            </p>`;
        }
        if (extraParams?.query) {
            resumenHtml += /*html*/`
            <p class="bolder text-secondary">Buscador palabras: 
                <span class="text-primary">${extraParams.query}</span>
            </p>`;
        }

        const tableHtml = /*html*/`
            <div class="grid-col-all d-flex-col gap-2 p-2">
                <h4>No hay productos con los filtros ingresados.</h4>
                ${resumenHtml || /*html*/`<p class="bolder">Sin filtros aplicados</p>`}
                <button class="btn btn-main w-min px-2 py-1 text-truncate bolder font-md" id="open-filters">
                    Ver Filtros
                </button>
            </div>
        `.trim();

        table.innerHTML = tableHtml.replace(/<!--.*?-->/gs, '');
        
        // Asignar evento al nuevo botón que ahora sí existe en el DOM
        const btn = table.querySelector('#open-filters');
        if (btn) {
            const section = document.getElementById('products');
            const btnFilter = section.querySelector('#btn-filter');
            btn.addEventListener('click', (ev) => {
                ev.stopPropagation();    // prevent some stupids checks
                btnFilter.click();    // open select filters
            });
        }
        return;
    }

    // para el caso donde si hay productos en la lista..

    // Indexar por id, for best performance
    const categoryMap = Object.fromEntries(window.CATEGORIES_LIST.map(c => [c.category.id, c.category]));
    /*  for now we not use this
    const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
    const subcategoryMap = Object.fromEntries(
        categories.flatMap(c => c.subcategories.map(sc => [sc.id, sc]))
    ); */

    const tableHtml = products.map(product => {
        const prod = deepEscape(product);

        const imageUrl = (prod.main_image) ? prod.main_image : '';

        // prod.updated_at|date:"d/m/Y" 
        const formatDate = shortDate(prod.updated_at);

        const price = formatNumberWithPoints(prod.price);

        return /*html*/`
            <!-- Name n Image -->
            <div class="d-flex row-table border-bot-rows" data-id="${prod.id}">
                <div class="cont-img-35 h-130" >
                    <img class="img-scale-down" alt="No Img" src="${imageUrl}">
                </div>
                <span class="cont-65 p-1 text-start font-sm bolder">${prod.name}</span>
            </div>

            <!-- 	Category	 -->
            <div class="d-desktop-block py-1 px-1 border-bot-rows font-sm bolder">
                ${categoryMap[prod.category_id].name}
            </div>

            <!-- 	Available	 -->
            <div class="d-desktop-block py-1 border-bot-rows">
                <span class="status bolder ${(prod.available) ? 'active' : 'disabled'}">
                    ${(prod.available) ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            <!-- 	Ventas	 -->
            <div class="d-desktop-flex py-1 justify-center border-bot-rows">${prod.id}</div>

            <!-- 	Update Date	 -->
            <div class="d-desktop-flex py-1 justify-end pxr-2 border-bot-rows">${formatDate}</div>

            <!-- 	Stock	 -->
            <div class="d-desktop-flex py-1 justify-center border-bot-rows">${prod.stock}</div>

            <!-- 	Price   -->
            <div class="d-desktop-flex py-1 justify-end px-1 border-bot-rows">$ ${price}.000.000</div>
        `;
    }).join("");

    table.innerHTML = tableHtml.replace(/<!--.*?-->/gs, '');
}