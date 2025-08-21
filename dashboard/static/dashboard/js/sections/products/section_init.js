/// <reference path="./table.js" />


function renderProductsModalForm() {

    const modalHtml = /*html*/`
    <!-- Form to ADD OR EDIT product -->
    <form class="modal form-modal" id="form-modal-product">

        <template id="template-add-product">
            <p><b>Especificaciones técnicas:</b></p>
            <p>● Listado 1</p>
            <p>● Listado 2 <b>(*)</b></p>
            <p>• Listado 3</p>
            <p>&nbsp;</p>
            <p><b>(*)</b> Auxiliar Listado 2</p>
            <p>Comentario</p>
        </template>

        <div class="d-flex-col gap-2">
            <!-- TITULO FORMULARIO -->
            <div class="cont-space-between">
                <strong class="font-lg bold-main text-truncate modal-title"> </strong>

                <button type="button" class="btn btn-32 btn-close form-modal-close"> 
                    <i class="ri-close-fill font-xl"></i>
                </button>   
            </div>

            <!--   FILA 1 FORMULARIO -->
            <div class="d-grid row-modal-product gap-2">
                <label class="d-flex-col gap-1 name bolder">
                    Nombre:
                    <input type="text" class="modal-name" name="name"/>
                </label>
                    
                <label class="d-flex-col gap-1 available">
                    <b class="text-truncate bolder">Disponible:</b>
                    <input type="checkbox" class="ms-2 mt-1 modal-available" name="available"/>
                </label>
            
                <label class="d-flex-col gap-1 price bolder">
                    Precio:
                    <input type="text" class="modal-price" name="price"/>
                </label>
            
                <label class="d-flex-col gap-1 discount">
                    <b class="text-truncate">Descuento (%):</b>
                    <input type="text" class="modal-discount" name="discount"/>
                </label>
            
                <label class="d-flex-col gap-1 subtotal bolder">
                    SubTotal:
                    <input type="text" class="modal-subtotal"/>
                </label>
            
                <label class="d-flex-col gap-1 stock bolder">
                    Stock:
                    <input type="text" class="modal-stock" name="stock"/>
                </label>
            </div>

            <!-- FILA 2 FORMULARIO SELECTS Category - subcategory - brand -->
            <div class="d-grid cont-grid-234 gap-2">

                <!-- Categorias select -->
                <label class="d-flex-col gap-1 bolder">
                    Categoría:
                    <select class="category-select modal-category" name="category">
                        <option value="0">Sin Categoría</option>
                        <!-- generamos los option con la lista que mandamos -->
                        ${window.CATEGORIES_LIST.map((item) => {
                            const cat = deepEscape(item.category)
                            return /*html*/`
                                <option value="${cat.id}">
                                    ${cat.name}
                                </option>
                            `;
                        }).join("")}
                    </select>
                </label>

                <!-- Campo oculto que enviará la subcategoría seleccionada -->
                <input type="hidden" name="subcategory" class="selected-subcategory" value="0">
                <!-- subcategorias select -->
                <div class="d-flex-col gap-1 cont-subcat-selects">
                    ${window.CATEGORIES_LIST.map((item, index) => {
                        return /*html*/`
                            ${index === 0 ? /*html*/`
                                <label class="gap-1 label-subcat-select label-subcat-0" data-state="closed">
                                    Subcategoría:
                                    <select class="subcat-select text-truncate">
                                        <option value="0">Sin Sub-Categoría</option>
                                    </select>
                                </label>
                            ` : ''}

                            ${item.subcategories && item.subcategories.length ? /*html*/`
                                <!-- esta lógica está en JS para mostrar el select correspondiente -->
                                <label class="gap-1 label-subcat-select label-subcat-${item.category.id}" data-state="closed">
                                    Subcategoría:
                                    <select class="subcat-select text-truncate">
                                        <option value="0">Sin Subcategoría</option>
                                        ${item.subcategories.map((sub) => {
                                            const subcat = deepEscape(sub);
                                            return /*html*/`
                                                <option value="${subcat.id}">
                                                    ${subcat.name}
                                                </option>
                                            `;
                                        }).join("")}
                                    </select>
                                </label>
                            ` : ''}
                        `;
                    }).join("")}
                </div>

                <!-- BRANDS SELECT -->
                <label class="d-flex-col gap-1 bolder">
                    Marca:
                    <select class="brand-select modal-brand" name="brand">
                        <option value="0">Sin Marca</option>
                        ${window.BRAND_LIST.map(item => {
                            const brand = deepEscape(item);
                            if (brand.is_default) return '';    // salter brand por defecto
                            return /*html*/`
                                <option value="${brand.id }">${brand.name}</option>
                            `.trim();
                        })}
                    </select>
                </label>
            </div>

            <!-- FILA 3 Cont-Images -->
            <div class="cont-block-update" data-state="open">
                <div class="d-flex gap-1 bolder"> 
                    Imagenes del Producto
                    <i class="ri-corner-right-down-line fw-normal font-lg"></i> 
                </div>

                <div class="d-grid cont-grid-234 gap-2 cont-modal-images"> </div>
            </div>
            
            <!-- FILA 4 y 5 FORMULARIO 		 -->
            <div class="d-grid cont-grid-122 align-stretch border-top-prim gap-2 py-2">

                <!--   FILA 4: Product Description		 -->
                <div class="d-flex-col gap-1 bolder">
                    Descripción del Producto: (*)
                    <textarea class="font-md h-170 p-1 fw-normal modal-description" name="description">   </textarea>
                </div>

                <div class="d-flex-col gap-1 bolder">
                    Vista Previa de la Descripción:
                    <div class="h-170 border-main p-1 font-md fw-normal scroll-y description-preview "></div>
                </div>

                <b class="grid-col-all">(*) Simbolos:</b>
                <div class="grid-col-all cont-space-between p-2 border-hover"> 
                    <span>** Negrita **</span>
                    <span>-- Linea en blanco</span>
                    <span>* listado</span>
                    <span>*- listado</span>
                    <span>(*) auxiliar</span>
                </div>

                <!-- FILA 5: Images previews -->
                <div class="d-flex-col gap-1">
                    <div class="d-flex gap-1 bolder">
                        Nueva Imagen Preview
                        <i class="ri-corner-right-down-line fw-normal font-lg"></i> 
                    </div>

                    <!-- Contenedor para las previsualizaciones -->
                    <div class="border-main d-grid cont-grid-234 gap-1 cont-img-100 cont-img-previews">  </div>
                </div>

                <!-- Apply changes and submit images -->
                <div class="d-flex-col">
                    <!-- Añade multiple y name como array <input type="file" class="image-input" name="images"> -->
                    <input type="file" class="image-input" name="images" multiple>
                    <!-- <input type="file" class="image-input" name="images" multiple accept="image/*" capture="camera"> -->
            
                    <div class="d-flex-col-row justify-center align-center gap-2 mt-2 mb-1">
                        <button class="btn gap-1 btn-main btn-36 w-100 bolder" type="submit" value="update"> 
                            <i class="ri-edit-2-line font-lg fw.normal"></i>Aplicar Cambios
                        </button>

                        <button class="btn btn-close btn-36 w-100 form-modal-cancel bolder" type="button">
                            Cancelar
                        </button>
                    </div>

                    <p class="font-md"><b>(*)</b> Recorda siempre mirar bien las imagenes subidas y/o eliminadas...</p>
                    <p class="font-md"><b>(**)</b> Si cancelas perderás los cambios realizados...</p>
                </div>
            </div>
        </div>
    </form>
    `.trim();

    // Elimina comentarios HTML antes de insertar
    const divTemp = document.createElement('div');
    divTemp.innerHTML = modalHtml.replace(/<!--.*?-->/gs, '');

    // este es el contenedor que vamos a completar con cartas de forma dinamica
    return divTemp.firstElementChild;
}


/**
 * Dynamically renders the product filters form.
 *
 * IMPORTANCE:
 * -------------
 * This function centralizes the generation of all parameters that will be sent 
 * to the server via `FormData`. It ensures consistency and provides a single 
 * point of maintenance for the system filters.
 *
 * Keys generated in the form (at least 5):
 *  1. page        → current page number (reset to 1 on every new search)
 *  2. query       → search string or input text
 *  3. available   → product availability (1=Available, 0=Not Available, 2=All)
 *  4. category    → selected category (category id or special values)
 *  5. subcategory → selected subcategory (subcategory id or special values)
 *
 * BENEFITS:
 * - Centralizes all filters in a single HTML block.
 * - Simplifies maintenance by avoiding scattered filter code.
 * - Ensures that `FormData` always contains the same consistent keys 
 *   for backend processing.
 *
 * @returns {string} HTML string containing the selects, inputs, and 
 *          the "Apply" filters button.
 */
function renderProductsFormFilters() {
    return /*html*/`
        <input type="hidden" name="page" value='1'>
        <input type="hidden" name="query" value=''>

        <!-- Disponibilidad select -->
        <label class="d-flex-col gap-1 text-start bolder">
            Disponibilidad:
            <select class="text-truncate" name="available">
                <option value="1">Disponible</option>
                <option value="0">No Disponible</option>
                <option value="2">Todos</option>
            </select>
        </label>

        <!-- Categorías y subcategorías select -->
        <label class="d-flex-col mt-2 gap-1 text-start bolder">
            Categoría:
            <select class="category-select text-truncate" name="category">
                <option value="-1">Seleccione una categoría</option>
                <option value="0">Sin Categoría</option>
                ${window.CATEGORIES_LIST.map((item) => {
                    const cat = deepEscape(item.category)
                    return /*html*/`
                        <option value="${cat.id}">
                            ${item.subcategories && item.subcategories.length ? '+ ' : ''}
                            ${cat.name}
                        </option>
                    `;
                }).join("")}
            </select>
        </label>

        <!-- Campo oculto que enviará la subcategoría seleccionada -->
        <input type="hidden" name="subcategory" class="selected-subcategory" value="-1">

        <div class="d-flex-col gap-1 mt-2 cont-subcat-selects">
            ${window.CATEGORIES_LIST.map((item, index) => {
                return /*html*/`
                    ${index === 0 ? /*html*/`
                        <label class="gap-1 label-subcat-select label-subcat-0 label-subcat--1" data-state="closed">
                            Subcategoría:
                            <select class="subcat-select text-truncate">
                                <option value="-1">Seleccione una subcategoría</option>
                                <option value="0">Sin Sub-Categoría</option>
                            </select>
                        </label>
                    ` : ''}

                    ${item.subcategories && item.subcategories.length ? /*html*/`
                        <!-- esta lógica está en JS para mostrar el select correspondiente -->
                        <label class="gap-1 label-subcat-select label-subcat-${item.category.id}" data-state="closed">
                            Subcategoría:
                            <select class="subcat-select text-truncate">
                                <option value="-1">Seleccione una subcategoría</option>
                                ${item.subcategories.map((sub) => {
                                    const subcat = deepEscape(sub);
                                    return /*html*/`
                                        <option value="${subcat.id}">
                                            ${subcat.name}
                                        </option>
                                    `;
                                }).join("")}
                            </select>
                        </label>
                        ` : ''}
                    `
                }).join("") 
            }
        </div>

        <!-- button to apply form select filters -->
        <button class="btn justify-self-center btn-main w-50 p-1 mt-2 font-sm bolder" 
        type="submit">Aplicar</button>
    `.trim().replace(/<!--.*?-->/gs, '')
}


function renderProductsSection() {

    const sectionHtml = /*html*/`
    <div class="d-grid cont-grid-122 cont-grid-products">
        <!-- Primera Fila -->
        <h2 class="bold-main">Tus Productos</h2>

        <button class="btn btn-main gap-1 py-1 px-2 w-max justify-self-end font-md bolder" id="add-new-product">
            <i class="ri-function-add-line fw-normal font-lg"></i>Agregar Producto
        </button>

        <!-- Segunda Fila -->
        <form class="btn-40 search-dashboard" id="search-dashboard">
            <input type="text" name="query" placeholder="Buscar producto...">
            <i class="ri-search-line font-lg"></i>
        </form>

        <div class="d-flex justify-self-end gap-1">
            <!-- form select filters se usa div para usar un menu interno -->
            <div class="btn btn-border btn-40 px-2 w-min relative" id="btn-filter" aria-expanded="false">
                <!-- title on select button -->
                Filtros&nbsp;<i class="ri-filter-2-line font-lg"></i>

                <!-- Menu desplegable de filtros -->
                <form class="dropdown-generic border-main form-select-filters" data-state="null">
                    ${renderProductsFormFilters()}
                </form>
            </div>

            <!-- Reset Filters Mobile -->
            <form class="d-mobile-block form-reset-filters">
                <input type="hidden" name="available" value="2">
                <button type="submit" class="btn btn-border btn-40 w-min px-1 font-md">
                    <i class="ri-close-fill font-lg"></i>Filtros
                </button>
            </form>

            <!-- Buttons to grid change on table -->
            <button class="d-desktop-flex btn btn-border btn-40 px-1 active-main">
                <i class="ri-list-check-2 font-lg"></i>
            </button>
            <button class="d-desktop-flex btn btn-border btn-40 px-1">
                <i class="ri-layout-grid-fill font-lg"></i>
            </button>
        </div>

        <!-- Tercera Fila DESKTOP -->
        <p class="d-desktop-flex align-center text-break gap-1 bolder font-sm">
            Filtros: <span class="bolder text-secondary" id="resume-filters">Ninguno</span>
        </p>

        <!-- Reset Filters -->
        <form class="d-desktop-flex align-center justify-self-end form-reset-filters">
            <input type="hidden" name="available" value="2">
            <button type="submit" class="btn btn-border btn-40 w-min px-1 font-md">
                <i class="ri-close-fill font-lg"></i>Filtros
            </button>
        </form>
    </div>
    `.trim();
    // Elimina comentarios HTML antes de insertar
    const divTemp = document.createElement('div');
    divTemp.innerHTML = sectionHtml.replace(/<!--.*?-->/gs, '');

    // este es el contenedor que vamos a completar con cartas de forma dinamica
    return divTemp.firstElementChild;
}


function renderProductsTableInit() {
    const tableHtml = /*html*/`
        <!-- TABLE PRODUCTSSSSS HEADER -->
        <div class="d-grid grid-products border-primary not-border-bottom font-sm mt-2 table-header">
            <div class="d-flex py-1 ms-1 bolder">
                Productos
                <button class="btn btn-sorted text-primary" data-sort-by="name">
                    <i class="ri-arrow-up-down-line bolder font-md"></i>
                </button>
            </div>

            <div class="d-desktop-flex align-center py-1 bolder">
                Categorías 
                <button class="btn btn-sorted text-primary" data-sort-by="category">
                    <i class="ri-arrow-up-down-line bolder font-md"></i>
                </button>
            </div>

            <div class="d-desktop-flex justify-center align-center bolder py-1">
                Disponible
                <button class="btn btn-sorted text-primary" data-sort-by="available">
                    <i class="ri-arrow-up-down-line bolder font-md"></i>
                </button>
            </div>

            <div class="d-desktop-flex justify-end align-center bolder py-1">
                Ventas
                <button class="btn btn-sorted text-primary" data-sort-by="sales">
                    <i class="ri-arrow-up-down-line font-md bolder"></i>
                </button>
            </div>

            <div class="d-desktop-flex justify-end align-center bolder py-1 text-truncate">
                Fecha Act.
                <button class="btn btn-sorted text-primary" data-sort-by="updated_at">
                    <i class="ri-arrow-up-down-line bolder font-md"></i>
                </button>
            </div>

            <div class="d-desktop-flex justify-end align-center bolder py-1">
                Stock
                <button class="btn btn-sorted text-primary" data-sort-by="stock">
                    <i class="ri-arrow-up-down-line font-md bolder"></i>
                </button>
            </div>

            <div class="d-desktop-flex justify-end align-center bolder py-1 me-1">
                Precio
                <button class="btn btn-sorted text-primary" data-sort-by="price">
                    <i class="ri-arrow-up-down-line font-md bolder"></i>
                </button>
            </div>
        </div>

        <!-- Table content here, render .js -->
        <section class="border-primary d-grid grid-products" id="table-products">
            
        </section>

        <!-- botones para pagination.js dinamicos -->
        <div class="mt-2 justify-self-center d-flex gap-2" id="cont-pagination"> </div>
    `.trim();

    // Elimina comentarios HTML antes de insertar
    const divTemp = document.createElement('div');
    divTemp.innerHTML = tableHtml.replace(/<!--.*?-->/gs, '');

    // captura el primer div que sería el header
    const header = divTemp.children[0];
    // captura la table de products para uso posterior y agregar al fragment
    const table = divTemp.children[1];
    const contBtnsPage = divTemp.children[2];
    return { header, table, contBtnsPage };
}


function renderProductsDashboard(dashSection, data) {
    // set initial sets
    window.BRAND_LIST = data.brands;
    window.CATEGORIES_LIST = data.categories;

    dashSection.innerHTML = '';

    // Create an in-memory lightweight container for DOM nodes
    // This reduces layout thrashing by batching DOM insertions
    const fragment = document.createDocumentFragment();

    fragment.appendChild(renderProductsSection());

    const { header, table, contBtnsPage } = renderProductsTableInit();
    fragment.appendChild(header);
    fragment.appendChild(table);
    fragment.appendChild(contBtnsPage);

    // this is from sections/products/pagination.js
    window.ProductStore.setData(data.products || []);
    
    // this is from sections/products/table.js
    renderProductsTable(table, data.products);

    // this is from sections/products/pagination.js
    updateContPagination(contBtnsPage, data.pagination);

    fragment.appendChild(renderProductsModalForm());

    // Append all product cards to the DOM in a single operation
    dashSection.appendChild(fragment);
}