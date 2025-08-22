

function renderTableBrands(table, brands) {
    const tableHtml = brands.map(b => {
        const brand = deepEscape(b);
        if (b.is_default) return ''

        return /*html*/`
            <div class="border-hover p-2">
                <!-- category button -->
                <div class="btn-36 w-100 pxl-2 cont-space-between border-secondary bg-secondary bolder" 
                aria-expanded="false">
                    ${brand.name}
                    <button class="btn btn-alt btn-36 w-min px-2 btn-open-form-modal" 
                    data-action="update" data-index="${brand.id}" data-object="brand">
                        <i class="ri-edit-2-line font-lg"></i>
                    </button>
                </div>
            </div>
        `
    }).join('')

    table.innerHTML = tableHtml.replace(/<!--.*?-->/gs, '');
}


function renderTableCategories(table, categories) {
    const tableHtml = categories.map(item => {
        const category = deepEscape(item.category);
        if (category.is_default) return ''

        const subcatgories = 
            ( item.subcategories && item.subcategories.length > 0) 
            ? item.subcategories : [];
        
        return /*html*/`
            <div class="border-hover d-flex-col gap-2 p-2">

                <!-- category button  row-cats-option  -->
                <div class="btn btn-36 w-100 bolder p-0 pxl-2 cont-space-between row-categories border-secondary 
                bg-secondary" aria-expanded="false">
                    ${category.name}
                    <button class="btn btn-alt btn-36 w-min px-2 btn-open-form-modal" data-action="update" 
                    data-index="${category.id}" data-object="category">
                        <i class="ri-edit-2-line font-lg"></i>
                    </button>
                </div>
                
                <div class="cont-subcats gap-1" data-state="closed">
                    ${subcatgories.map(sub => {
                            const subcat = deepEscape(sub);
                            if (subcat.is_default) return ''

                            return /*html*/`
                                <!-- subcategory button -->
                                <div class="btn btn-36 p-0 pxl-2 bolder w-100 cont-space-between 
                                border-secondary bg-secondary">
                                    ${subcat.name}

                                    <button class="btn btn-alt btn-36 w-min px-2 btn-open-form-modal" 
                                    data-open-select="true" data-action="update" data-index="${subcat.id}" 
                                    data-object="subcategory">
                                        <i class="ri-edit-2-line font-lg"></i>
                                    </button>
                                </div>
                            `
                        }).join('')
                    }
                    
                    <button class="btn justify-start gap-1 btn-main text-truncate bolder 
                    btn-36 w-min px-2 btn-open-form-modal" 
                    data-open-select="true" data-action="create" data-index="0" data-object="subcategory">
                        Agregar Subcategoría
                        <i class="ri-add-fill font-lg"></i>
                    </button>
                </div>
            </div>
        `
    }).join('')
    table.innerHTML = tableHtml.replace(/<!--.*?-->/gs, '');
};


// Inicial function to render first time categories dashboard section base
function renderCategoriesDashboard(dashSection, data) {

    

    function renderModalCategories() {
        const formModalHtml = /*html*/`
            <!-- Form to add new Categories or Brands  -->
            <form class="modal form-modal gap-2" id="form-modal-categories">

                <!-- FILA 1 Title n Button -->
                <div class="w-100 d-flex cont-space-between">
                    <h3 class="font-lg bold-main modal-title">  </h3>
                    <button type="button" class="btn btn-32 btn-close btn-modal-close"> 
                        <i class="ri-close-fill font-xl"></i>
                    </button>
                </div>

                <div class="d-grid cont-grid-122 gap-2 h-min align-stretch">
                    <!-- FILA 2 Name n Name for Update -->
                    <div class="cont-grid-update cont-grid-2 btn-36 text-truncate w-min gap-2 bolder 
                    border-main p-1 pxr-2 text-secondary" data-state="closed">
                        Nombre Actual: <span class="modal-oldName text-primary"> </span>
                    </div>

                    <label class="d-flex btn-36 w-min gap-2 text-truncate bolder p-1 grid-col-all-cond">
                        Nuevo Nombre:
                        <input class="modal-name w-max" type="text" name="name"/>
                    </label>

                    <!--   FILA 3 IMAGENES ACTUAL Y DELETE CAT -->
                    <div class="cont-grid-update gap-1" data-state="closed">
                        <span class="bolder text-start">
                            Imagen actual de la <span class="modal-span"> </span>
                            <i class="ri-corner-right-down-line font-lg"></i>
                        </span>
                        <div class="d-grid cont-grid-122 cont-modal-images"> </div>
                    </div>

                    <div class="d-flex-col gap-2 grid-col-all-cond">
                        <!-- Categorias select -->
                        <label class="cont-grid-subcats gap-1" data-state="closed">
                            <span><b>Categoría: </b>(*) Cuidado de modificar la categoría.</span>
                            <select class="w-50 category-select modal-category" name="category">
                                <option value="0">Sin Categoría</option>
                                ${window.CategoriesStore.getCategories().map(cat => {
                                        const category = deepEscape(cat);
                                        // to prevent render default category
                                        if (category.is_default) return '';

                                        return /*html*/`
                                            <option value="${category.id}">
                                                ${category.name}
                                            </option>
                                        `;
                                    }).join('')
                                }
                            </select>
                        </label>

                        <!-- Test Delete for dumbs		 -->
                        <div class="cont-grid-update gap-1" data-state="closed">
                            <div class="d-flex gap-1">
                                <p class="bolder">¿Desea eliminar esta <span class="modal-span"> </span>?</p>
                                <input type="checkbox" class="check-delete">
                            </div>

                            <section class="cont-delete-btn gap-2 p-2" data-state="closed">
                                <span class="d-flex gap-1 text-start justify-start text-break bolder">
                                    Indique esta casilla y toque "Borrar Permanentemente" (*)
                                    <input type="checkbox" name="delete">
                                </span>

                                <p><b>(*)</b> Esta acción no se puede deshacer...</p>

                                <button class="btn w-max gap-1 p-1 px-2 bolder text-truncate btn-close btn-delete" 
                                type="submit" data-action="delete">
                                    Borrar Permanentemente
                                    <i class="ri-delete-bin-5-line fw-normal font-lg"></i>
                                </button>
                            </section>
                        </div>
                    </div>

                    <!--   FILA 4 FORMULARIO IMAGENES CARGA		 -->
                    <div class="d-flex-col">
                        <p class="d-flex gap-1 mb-1 bolder">
                            Nueva Imagen de <span class="modal-span"> </span> Preview
                            <i class="ri-corner-right-down-line font-lg"></i>
                        </p>

                        <!-- Contenedor para las previsualizaciones image-previews-->
                        <div class="border-main d-grid cont-grid-122 gap-1 mb-1 cont-img-100-off cont-img-previews">  </div>  
                        
                        <p><b>(*)</b> Recorda siempre mirar bien las imagenes subidas y/o eliminadas...</p>
                        <p><b>(**)</b> Si subís una nueva imagen se reemplazará la anterior...</p>
                        <p><b>(***)</b> Si cancelas perderás los cambios realizados...</p>
                        <p><b>(****)</b> Las Categorías solo pueden tener una única imagen asociada.</p>
                    </div>

                    <div class="d-grid cont-grid-122 gap-2">
                        <!-- por algun motivo tiene que estar dentro de un d-flex-col para verse bien -->
                        <div class="grid-col-all d-flex-col">
                            <input type="file" class="image-input" name="images">
                        </div>
                        
                        <button class="btn gap-1 btn-main bolder btn-36 w-100 btn-form-submit" type="submit"> 
                            <i class="ri-edit-2-line fw-normal font-lg"></i>
                            Aplicar Cambios
                        </button>

                        <button class="btn btn-close btn-36 bolder w-100 form-modal-cancel" type="button">
                            Cancelar
                        </button>
                    </div>
                </div>
            </form>
        `.trim();

        // Elimina comentarios HTML antes de insertar
        const divTemp = document.createElement('div');
        divTemp.innerHTML = formModalHtml.replace(/<!--.*?-->/gs, '');

        return divTemp.firstElementChild;
    }
    
    function renderBaseSectionHtml() {
        const sectionHtml = /*html*/`
            <div class="d-grid cont-grid-122 gap-2">
                <h2 class="grid-col-all"> Categorías y Subcategorías </h2>

                <!-- button para abrir todos las categorias y visualizar -->
                <button class="btn btn-main btn-36 gap-1 w-min px-2 btn-open-tabs" data-to-open="true">
                    <span class="text-btn text-truncate bolder">Abrir Todos</span>
                    <i class="ri-list-view font-lg"></i>
                </button>

                <!-- se le asigna estos datasets para completar automaticamente el formulario
                en base a esos datos -->
                <button class="btn btn-main btn-36 gap-1 w-min px-2 text-truncate bolder justify-self-end btn-open-form-modal"
                data-action="create" data-index="0" data-object="category">
                    Agregar Categoría
                    <i class="ri-add-fill fw-normal font-lg"></i>
                </button>

                <!-- table para rellenar dinamicamente en otros pasos -->
                <div class="grid-col-all d-grid cont-grid-122 gap-2" id="table-categories"> </div>

                <!-- Brands stuff -->
                <h2 class="mt-2 grid-col-all"> Marcas </h2>

                
                <!-- se le asigna estos datasets para completar automaticamente el formulario
                en base a esos datos -->
                <button class="btn btn-main btn-36 gap-1 w-min px-2 text-truncate bolder btn-open-form-modal" 
                data-action="create" data-index="0" data-object="brand">
                    Agregar Marca
                    <i class="ri-add-fill font-lg"></i>
                </button>

                <!-- table para rellenar dinamicamente en otros pasos -->
                <div class="grid-col-all d-grid cont-grid-122 gap-2" id="table-brands"> </div>
            </div>
        `.trim();

        // Elimina comentarios HTML antes de insertar
        const divTemp = document.createElement('div');
        divTemp.innerHTML = sectionHtml.replace(/<!--.*?-->/gs, '');
        const base = divTemp.firstChild;

        // captura la table de products para uso posterior y agregar al fragment
        const tableCategories = divTemp.querySelector('#table-categories');
        const tableBrands = divTemp.querySelector('#table-brands');
        return { base, tableCategories, tableBrands };
    }

    // Create an in-memory lightweight container for DOM nodes
    // This reduces layout thrashing by batching DOM insertions
    const fragment = document.createDocumentFragment();

    const { base, tableCategories, tableBrands } = renderBaseSectionHtml();
    fragment.appendChild(base);
    fragment.appendChild(renderModalCategories());
    
    renderTableBrands(tableBrands, data.brands);
    renderTableCategories(tableCategories, data.categories);

    // Append all product cards to the DOM in a single operation
    dashSection.appendChild(fragment);
}