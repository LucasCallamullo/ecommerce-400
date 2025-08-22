

function renderHeadersList(images, objectName) {
    const imagesHtml = /*html*/images.map(im => {
        const img = deepEscape(im);
        const altName = `${objectName} Id: ${img.id}`

        if (!img.image_url) return ''
        /* data-model='{
                    "available": "{{ header.available|yesno:"no,yes" }}",
                    "main_image": "{{ header.main_image|yesno:"yes,no" }}",
                    "header-{{header.main_image}}-{{header.id}}": "{{ header.image_url|escape_data}}"
                }' */

        return /*html*/`
            <!-- todos los dataset serán utilizado para modificar dinamimcamente el form unico -->
            <div class="h-170 w-100 relative cont-header-img" data-object="${objectName}" 
            data-index="${img.id}" data-action="update">
                <img src="${img.image_url}" alt="${altName}" 
                class="effect-image-overlay img-cover ${(img.main_image) ? 'border-main-lg' : ''}">

                <!-- efectos de hover en desktop -->
                <div class="d-flex justify-center gap-2 h-100 w-100 image-overlay">
                    <button class="btn btn-circle-overlay">
                        <i class="ri-edit-2-line font-xl" ></i>
                    </button>
                    <button class="btn btn-circle-overlay">
                        <i class="ri-delete-bin-6-line font-xl"></i>
                    </button>
                </div>
            </div>
        `
    }).join('');

    return imagesHtml;
}


function renderTablesHeadersBanners(table, data) {
    const tableHtml = /*html*/`
        <!-- datos para agregar nuevos headers si o si -->
        <div class="grid-col-all cont-space-between-mobile gap-2">
            <h2 class="bold-main mt-2">Headers Activos en Home:</h2>
            <button class="btn btn-main w-max gap-1 p-1 px-2 text-truncate bolder btn-add-header" 
            data-object="header" data-index="0" data-action="create">
                <i class="ri-function-add-line fw-normal font-lg"></i>
                Agregar Header
            </button>
        </div>
        <!-- retornamos dinamicamente cada una de las partes -->
        ${(data.active_headers.length > 0) ? 
            renderHeadersList(data.active_headers, 'header') :
            ''
        }

        ${(data.inactive_headers.length > 0) 
            ? /*html*/`
                <h2 class="grid-col-all mt-4">Headers Inactivos/Ocultos:</h2>
                ${renderHeadersList(data.inactive_headers, 'header')}
            `
            : ''
        }
        <!-- datos para agregar nuevos banners si o si -->
        <div class="grid-col-all cont-space-between-mobile gap-2">
            <h2 class="bold-main mt-2">Banners Activos en Home:</h2>
            <button class="btn btn-main w-max gap-1 p-1 px-2 text-truncate bolder btn-add-header" 
            data-object="banner" data-index="0" data-action="create">
                <i class="ri-function-add-line font-lg"></i>
                Agregar Banner
            </button>
        </div>
        <!-- retornamos dinamicamente cada una de las partes -->
        ${(data.active_banners.length > 0) ? 
            renderHeadersList(data.active_banners, 'banner') :
            ''
        }
        ${(data.inactive_banners.length > 0) 
            ? /*html*/`
                <h2 class="grid-col-all mt-4">Banners Inactivos/Ocultos:</h2>
                ${renderHeadersList(data.inactive_banners, 'banner')}
            `
            : ''
        }
    `.trim().replace(/<!--.*?-->/gs, '');

    table.innerHTML = tableHtml;
}

function renderHeadersDashboard(dashSection, data) {
    
    function renderModalForm() {
        const formHtml = /*html*/`
            <form class="modal form-modal gap-2" id="form-modal-headers">

                <!-- FILA 1 Title n Button -->
                <div class="d-flex w-100 cont-space-between">
                    <h3 class="font-lg bold-main modal-title"> </h3>
                    <button type="button" class="btn btn-32 btn-close form-modal-close"> 
                        <i class="ri-close-fill font-xl"></i>
                    </button>
                </div>

                <div class="d-grid cont-grid-122 h-min gap-2">

                    <!--   FILA 2 IMAGENES ACTUAL Y DELETE Headers -->
                    <div class="d-flex-col gap-1" data-state="closed">
                        
                        <div class="cont-flex-update bolder">
                            <span class="modal-span"> </span>&nbsp;actual&nbsp;&nbsp;
                            <i class="ri-corner-right-down-line fw-normal font-lg"></i>
                        </div>

                        <div class="h-190 w-100 cont-modal-images cont-grid-update">  </div>

                        <!--  Main checkbox 		 -->
                        <div class="d-flex w-100 gap-1 bolder">
                            <i class="ri-image-edit-line fw-normal font-lg"> </i>
                            <span class="modal-span"> </span> Principal (*):
                            <input class="ms-3" type="radio" name="main_image" value="yes"> Sí
                            <input class="ms-3" type="radio" name="main_image" value="no" checked> No
                        </div>

                        <!-- Soft Delete radio buttons -->
                        <div class="d-flex w-100 gap-1 bolder">
                            <i class="ri-image-edit-line fw-normal font-lg"></i>
                            <span class="modal-span"> </span> Oculto (**):
                            <input class="ms-3" type="radio" name="available" value="yes"> Sí
                            <input class="ms-3" type="radio" name="available" value="no" checked> No
                        </div>

                        <p class="font-sm">
                            <b>(*)</b> Esto significa que será la primera imagen que se muestra 
                            de los <span class="modal-span"> </span>s en el Home.
                        </p>

                        <p class="font-sm">
                            <b>(**)</b> Esto significa que no se mostrará la imagen, en el Home.
                        </p> 
                    </div>

                    <!-- Test Delete for dumbs		 -->
                    <div class="cont-grid-update h-min gap-2" data-state="closed">
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
                
                    <!--   FILA 4 FORMULARIO IMAGENES CARGA		 -->
                    <div class="d-flex-col gap-1">
                        <div class="d-flex gap-1">
                            <h4 class="cont-flex-update">Reemplazar con Nuevo&nbsp;<span class="modal-span"> </span>:</h4>
                            <h4 class="cont-flex-create">Agregar Nuevo&nbsp;<span class="modal-span"> </span>:</h4>
                            <i class="ri-corner-right-down-line font-lg"></i>
                        </div>

                        <!-- Contenedor para las previsualizaciones image-previews-->
                        <div class="border-main h-190 w-100 cont-img-100-off cont-img-previews">  </div>  

                        <div class="cont-grid-update gap-1" data-state="closed">
                            <p><b>(*)</b> Recorda siempre mirar bien las imagenes subidas y/o eliminadas...</p>
                            <p><b>(**)</b> Si subís una nueva imagen se reemplazará la anterior...</p>
                            <p><b>(***)</b> Si cancelas perderás los cambios realizados...</p>
                            <p><b>(****)</b> Las Categorías solo pueden tener una única imagen asociada.</p>
                        </div>
                    </div>

                    <!-- seccion de submits para subir imagenes y realizar cambios -->
                    <div class="d-grid cont-grid-122 h-min gap-2">
                        <div class="d-flex-col grid-col-all gap-2">
                            <input type="file" class="image-input" name="images">
                        </div>
                        <button class="btn gap-1 btn-main btn-36 bolder text-truncate w-100 btn-form-submit" 
                        type="submit"> 
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
        divTemp.innerHTML = formHtml.replace(/<!--.*?-->/gs, '');
        return divTemp.firstElementChild;
    }

    
    function renderBaseSectionHtml() {
        const sectionHtml = /*html*/`
            <div class="d-grid cont-grid-123 gap-3" id="table-headers"> </div>
        `.trim().replace(/<!--.*?-->/gs, '');

        // Elimina comentarios HTML antes de insertar
        const divTemp = document.createElement('div');
        divTemp.innerHTML = sectionHtml;
        const table = divTemp.querySelector('#table-headers');
        renderTablesHeadersBanners(table, data);
        return divTemp.firstElementChild;
    }
    

    // Create an in-memory lightweight container for DOM nodes
    // This reduces layout thrashing by batching DOM insertions
    const fragment = document.createDocumentFragment();

    fragment.appendChild(renderBaseSectionHtml());
    fragment.appendChild(renderModalForm());
    
    // Append all product cards to the DOM in a single operation
    dashSection.appendChild(fragment);
}