

// ==============================================================
//      MODAL FORM TO UPDATE SOME MODEL
// ==============================================================
function enrichDatasetModal(object, objectName, action) {
    const objectNames = {
        brand: "Marca",
        category: "Categoría",
        subcategory: "Sub-Categoría",
        product: "Producto",
        header: "Header",
        banner: "Banner"
    };

    const name = objectNames[objectName];

    // Construir valores por defecto dinámicamente
    let fallback;
    if (["Marca", "Categoría", "Sub-Categoría"].includes(name)) {
        fallback = {
            title: `${action === 'create' ? 'Agregar Nueva' : 'Editar'} ${name}`,
            span: name,
            ...(action === 'update' ? { oldName: object.name } : {})
        };
    } else if (['Producto', 'Header', 'Banner'].includes(name)) {
        fallback = {
            title: `${action === 'create' ? 'Agregar Nuevo' : 'Editar'} ${name}`,
            span: name,
        };
    }

    return { ...fallback, ...object };     // object sobrescribe si define valores
}

/*

EXAMPLE 
updateModalFormInputs({
    form: myForm,
    object: { id: 1, name: "abc" },
    objectName: "product",
    action: "update",
    url: some_endpoint
});
*/
async function updateModalFormInputs({
    form = null,
    object = {},
    objectName = '',
    action = '',
    url = null
} = {}) {

    // 1. complete with dynamic info
    const obj = deepEscape(object);
    const extraPopulate = enrichDatasetModal(obj, objectName, action);

    // 2. Guardaremos los valores iniciales
    const initialValues = {};  

    // 3. Hacer fetch asyncrono de get
    let fetchPromise = null;
    if (action === 'update' && url) {
        fetchPromise = fetch(url).then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        });
    }

    // esto va a ser un param opcional que hara referencia a los modal-*
    const entries = Object.entries(extraPopulate);
    for (const [key, value] of entries) {
        console.log(key, value);

        // Buscar lista de elementos HTML que respeta el patron class="modal-[key]"   
        const element = form.querySelector(`.modal-${key}`) || null; 

        if (element && element.tagName == "INPUT" ) {
            
            // especial format to input decimal/money
            if (['price'].includes(key)) {
                const price = formatNumberWithPoints(value);
                element.value = price;
                initialValues[key] = price;
                continue;
            }

            if (element.type === "checkbox") {
                // its a bool for available
                element.checked = (value);
                initialValues[key] = (value);
            } else {
                element.value = value;
                initialValues[key] = value;
            }
            continue;
        } 

        // Destruye el anterior choice.js y lo recrea por cada vez que se abre el modal
        else if (["category_id", "brand_id"].includes(key)) {

            // checks initiales sets
            if (!window.BrandStore || !window.BrandStore.loaded) continue;
            if (!window.CategoriesStore || !window.CategoriesStore.loaded) continue;
            // if (!window.BrandStore || !window.CATEGORIES_LIST) continue;
            const selectName = key.replace('_id', '');
            const select = form.querySelector(`.modal-${selectName}`)
            if (!select || select.tagName != "SELECT") continue;

            // separamos la logica en este caso de select simples con el de subcategory
            if (selectName === 'category') {
                
                // get object with keys dicts category: {...} and subcategories: [{...} ,{...}]
                // const categoryGroup = window.CATEGORIES_LIST.find(c => c.category.id === value);
                const category = deepEscape(window.CategoriesStore.getCategoryById(value));
                if (!category) continue;

                // category select init
                // const category = categoryGroup.category;
                select.value = (category.is_default) ? 0 : category.id;
                initialValues[key] = select.value;
                initSelectChoices(select);

                // logic for subcategory in the common case this step is the most regular
                const subcategory = window.CategoriesStore.getSubcategoryWithFallback(obj.subcategory_id);
                if (!subcategory) continue;

                // get label to show
                let subcatLabel = form.querySelector(`.label-subcat-${category.id}`);
                if (!subcatLabel) subcatLabel = form.querySelector(`.label-subcat-0`);

                // complete info on select and initial values on form
                const subcatSelect = subcatLabel.querySelector('.subcat-select')
                subcatSelect.value = (subcategory.is_default) ? 0 : subcategory.id;

                const subcategorySelect = form.querySelector('.selected-subcategory');
                subcategorySelect.value = subcatSelect.value;

                initSelectChoices(subcatSelect);
                initialValues['subcategory'] = subcatSelect.value;
                
            } 
            else if (selectName === 'brand') {
                const brand = window.BrandStore.getBrandById(value);
                select.value = (brand.is_default) ? 0 : brand.id;
                initialValues[key] = select.value;
                initSelectChoices(select);
            }
            continue;
        }

        /* generic text on modal to changes */
        else if (["span", "title", "oldName"].includes(key)) {
            // realmente solo los span tienen como varios lugar donde compeltaran texto
            const spans = form.querySelectorAll(`.modal-${key}`) || [];
            spans.forEach(spn => spn.textContent = value)
            continue;
        } 

        else if (["available", "main_image"].includes(key)) {
            const radios = form.querySelectorAll(`input[name=${key}]`);
            // stupids checks
            if (!["header", "banner"].includes(objectName) || !radios.length) continue;

            // Esta logica se aplica para dar el valor inverso en available
            const preValue = (key == 'available') ? !value : value;
            const newValue = (preValue) ? "yes" : "no";
            radios.forEach(r => { r.checked = (r.value === newValue) });
            initialValues[key] = newValue;
        }
    }


    function populateContModalImages(contImages, images, extraData=null) {
        if (!extraData.hasUrl) {
            // si todavía no tiene imagen simplemente mostramos un mensaje referencial
            contImages.innerHTML = /*html*/`
                <span class="bolder text-secondary"> Todavía no tiene imagen actual.</span>
            `.trim();
            return;
        } 

        // para este caso 'headers', 'banners' pasamos un unico objeto y completamos en base al mismo
        else if (extraData.isHeader) {
            const header = images;    
            contImages.innerHTML = /*html*/`
                <div class="cont-img-100-off ${(header.main_image) ? 'border-main' : ''}">
                    <img src="${header.image_url}" alt="${objectName} ${header.id}" 
                        data-index="${header.id}" data-main="${(header.main_image)}"
                        class="img-scale-down ${(header.main_image) ? 'border-main' : ''}"
                    />
                </div>
            `.trim();
            return;
        }

        const imageAlt = `${objectName} ${extraData.id}`
        const imagesHtml = images.map((image, index) => {
            const img = deepEscape(image);
            const imgUrl = img.image_url;

            return /*html*/`
                <div class="d-flex-col w-100 gap-1">
                    <!-- Efectos visuales, Y data-main es un valor que recuperamos despues -->
                    <div class="cont-main-image h-220 ${(index == 0) ? 'border-main' : 'border-secondary'}">
                        <img src="${imgUrl}" alt="${imageAlt}" data-index="${img.id}" 
                            data-main="${(index == 0) ? "true" : "false"}" class="img-scale-down"/>
                    </div>
                    <!-- logica de radio (uno solo como select) para saber cual es la imagen principal -->
                    <label class="d-flex gap-1">
                        <input type="radio" name="main_image" value="${img.id}" ${(index == 0) ? 'checked' : ''}>
                        Principal
                    </label>
                    <!-- logica para borrar imagenes recupera todos los id en checkbox -->
                    <label class="d-flex gap-1">
                        <input type="checkbox" name="delete_images" value="${img.id}">
                        Eliminar
                    </label>
                </div>
            `
        }).join("").replace(/<!--[\s\S]*?-->/g, "");     // Elimina todos los comentarios

        contImages.innerHTML = imagesHtml;
    }

    // Esperar fetch solo si es necesario y completar imagenes
    const contImages = form.querySelector('.cont-modal-images');
    const flagUrl = (extraPopulate.image_url) ? true : false;

    // this is for update modal images from categories, subcategories, brands
    if (contImages && ['category', 'subcategory', 'brand'].includes(objectName)) {
        // creamos nuestro objeto con datos propios del objeto que pasamos antes
        const images = [{image_url: extraPopulate.image_url, id: extraPopulate.id}];
        populateContModalImages(contImages, images, {id: extraPopulate.id, hasUrl: flagUrl});
    }
    else if (contImages && ['header', 'banner'].includes(objectName)) {
        populateContModalImages(contImages, extraPopulate, { hasUrl: flagUrl, isHeader: true });
    }

    // this is for complete with extra_data from fetch on products sections
    let description = null;
    if (fetchPromise && contImages) {
        const data = await fetchPromise;

        // Obtener las imágenes del endpoint, ordenadas de True a False
        const images = data.images || [];
        description = data.product.description

        // set value image_id in initial values form to compare after
        if (images.length > 0) {
            initialValues["main_image"] = images[0].id;
        }
        populateContModalImages(contImages, images, {id: data.product.id});
    }

    // e) Load and set the product description dynamically into the modal
    if (objectName === 'product') {
        const descriptionText = descriptionModalEvents(form, description);
        initialValues["description"] = descriptionText;
    }
    
    // Asociamos el diccionario al form
    form._initialValues = initialValues;
    /* const entriess = Object.entries(initialValues);
    for (const [key, value] of entriess) {
        console.log(key, value);
    } */
}


/**
 * Manages description modal events with custom markdown processing:
 * 1. Converts HTML to custom markdown syntax
 * 2. Provides real-time preview with custom formatting
 * 3. Handles bidirectional conversion between HTML and custom markdown
 * 
 * @param {HTMLElement} form - Container element holding modal components
 * @param {string|null} productId - ID of the product being edited
 */
function getTemplateTextFromPreview(preview) {
    return Array.from(preview.childNodes).map(node => {
        if (node.tagName === 'P') {
            let text = node.textContent;

            // Reconstruir (*) si hay <b>(*)</b>
            if (node.innerHTML.includes('<b>(*)</b>')) {
                text = text.replace('(*)', '(*)');
            }

            // Reconstruir bold ** ** si hay <b class="font-lg">...</b>
            if (node.innerHTML.includes('font-lg')) {
                text = text.replace(/^(.*)$/, '**$1**');
            }

            // Reconstruir bullets ● (icono) al inicio
            if (node.querySelector('i.ri-git-commit-fill')) {
                text = '* ' + text; // ● → * 
            }

            // Reconstruir bullets • al inicio
            if (text.startsWith('● ')) text = '* ' + text.slice(2);
            if (text.startsWith('• ')) text = '*- ' + text.slice(2);

            return text;
        } else if (node.tagName === 'BR') {
            return '--';
        }
        return node.textContent || '';
    }).join('\n');
}


function descriptionModalEvents(form, description) {
    
    // 1. DOM element initialization
    const textarea = form.querySelector('.modal-description');
    const preview = form.querySelector('.description-preview');
    if (!textarea || !preview) return;

    // 2. Initial content conversion
    const descriptionText = (description) ? `${description}` : `
        **Especificaciones técnicas:**
        * Listado 1
        * Listado 2 (*)
        --
        (*) Auxiliar Listado 2
        Comentario
    `

    /**
     * Converts textarea content to formatted HTML preview
     * @param {HTMLTextAreaElement} textarea - Input element with raw text
     * @param {HTMLElement} preview - Container for rendered preview
     */
    function updatePreview(descriptionText, preview) {
        const lines = descriptionText.split('\n').map(line => line.trim()).filter(line => line);
        const htmlLines = lines.map(line => {
            // 1. Highlight any occurrences of (**)
            line = line.replace(/\(\*\)/g, /*html*/`<b>(*)</b>`); // (*) notation
            line = line.replace(/\*\*(.+?)\*\*/g, /*html*/`<b class="font-lg">$1</b>`); // bold text

            // 2. Detect bullets at the start of the line
            if (/^\*\s+/.test(line)) {
                line = line.replace(/^\*\s+/, /*html*/`<i class="ri-git-commit-fill font-md"></i>`);    // '● '
            } else if (/^\*-\s+/.test(line)) {
                line = line.replace(/^\*-\s+/, '• ');
            }

            // 3. Special case for empty line placeholder
            if (line === '--') {
                return /*html*/`<br>`;
            }

            // 4. Return the line wrapped in a <p> tag
            return /*html*/`<p>${line}</p>`;
        });

        const finalHtml = htmlLines.join('');
        preview.innerHTML = finalHtml;
    }

    // insert final texts
    updatePreview(descriptionText, preview);
    textarea.value = descriptionText
        .trim() // quita espacios al inicio y final del bloque
        .split('\n') // separa en líneas
        .map(line => line.trimStart()) // elimina la indentación de cada línea
        .join('\n'); // vuelve a unir en un solo string;

    // 3. Real-time preview with debounce
    let changeCount = 0;
    const changeThreshold = 5;  // Cuántos inputs son suficientes para decir "hubo edición"
    textarea.dataset.wasEdited = "false";

    let timeout;
    if (!textarea._hasEvent) {
        textarea.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                updatePreview(textarea.value, preview);
                changeCount++;

                // Marcamos que hubo una edición si se superó el umbral
                if (changeCount >= changeThreshold) {
                    textarea.dataset.wasEdited = "true";
                }
            }, 200);
        });

        textarea._hasEvent = true;
    }

    const contBtns = form.querySelector('.description-btns');
    if (contBtns && !contBtns._hasEvent) {
        contBtns.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-markdown');
            if (!btn) return;
            
            const text = btn.dataset.value;
            const textValue = textarea.value + `\n${text}`;
            textarea.value = textValue
            updatePreview(textValue, preview);
        })
        contBtns._hasEvent = true;
    }


    return textarea.value;    // return to set initial values form
}


function getChangedFields(form) {
    const changes = {};
    const initial = form._initialValues || {};

    for (const [key, oldValue] of Object.entries(initial)) {
        let currentValue;
        let input = form.querySelector(`.modal-${key}`);
        // Si no lo encuentra por clase, intentamos por name (para radios)
        if (!input) input = form.querySelector(`[name="${key}"]`);
        if (!input) continue;
        
        // special logic for input description
        if (key == 'description') {
            const textarea = form.querySelector('.modal-description');
            const preview = form.querySelector('.description-preview');
            if (!textarea || !preview) continue;

            // custom atrr in descriptionModalEvents()    -    modal_form.js 
            const wasEdited = textarea.dataset.wasEdited === "true";
            // if (!wasEdited || textarea.value.trim() === '') continue;
            currentValue = getTemplateTextFromPreview(preview);
        }
    
        if (input.type === "checkbox") {
            currentValue = input.checked;
        } else if (input.type === "radio") {
            // Obtenemos el radio seleccionado del grupo
            const selected = form.querySelector(`input[name="${key}"]:checked`);
            if (!selected) continue;
            currentValue = selected.value;
        } else {
            currentValue = input.value;
        }

        // Si hay diferencia, lo guardamos directamente como valor nuevo
        if (currentValue != oldValue) {
            changes[key] = currentValue;
            console.log(`Value Now ${key}: `, currentValue, 'and Value Old: ', oldValue)
        }
    }

    // Buscar todos los checkboxes con name="delete_images"
    const inputsCheck = form.querySelectorAll(`[name="delete_images"]`);
    if (inputsCheck) {
        const selectedToDelete = [];
        inputsCheck.forEach(input => {
            if (input.checked) selectedToDelete.push(input.value);
        });
        // Asignar al objeto si hay al menos uno seleccionado
        if (selectedToDelete.length > 0) changes["delete_images"] = selectedToDelete;
    }
    
    return changes;
}


/**
 * Initializes a Choices.js instance on a select element, ensuring that
 * any previous instance is properly destroyed to prevent duplicates or memory leaks.
 *
 * @param {HTMLElement} element - The <select> element to enhance with Choices.js
 */
function initSelectChoices(element) {
    // If a previous Choices instance exists on the element, destroy it to prevent conflicts
    if (element.choicesInstance) element.choicesInstance.destroy();

    // Create and assign a new Choices.js instance to the element
    element.choicesInstance = new Choices(element, {
        searchEnabled: true,      // Enable search functionality inside the select dropdown
        itemSelectText: '',       // Removes the default "Press to select" text
        shouldSort: false,         // Keep the original order of the options (no automatic sorting)
    });
}


/**
 * Manages subcategory selection logic by:
 * 1. Handling category change events
 * 2. Syncing subcategory selections to hidden input
 * 3. Dynamically showing relevant subcategory selects
 * 
 * @param {HTMLElement} form - The parent form element
 */
function subcategorySelectEvents(form, choicesInit=false) {
    // 1. Configure category selection handler
    const categorySelect = form.querySelector('.category-select');
    categorySelect.addEventListener('change', (e) => {
        openSelectByCategory(e.target.value); // Update UI based on selection
    });

    // 2. Sync subcategory selections to hidden input
    const subcatInput = form.querySelector('[name="subcategory"]');
    const containerSelects = form.querySelector('.cont-subcat-selects');
    if (containerSelects) {
        containerSelects.addEventListener('change', (e) => {
            const select = e.target;
            if (select.matches('.subcat-select')) {
                subcatInput.value = select.value;
                console.log("Cambió un select:", select.value);
            }
        });
    }

    // 3. Manage subcategory visibility
    const subcatLabels = form.querySelectorAll('.label-subcat-select');
    function openSelectByCategory(categorySelected) {
        // 3.1 Hide all subcategory containers initially
        subcatLabels.forEach(cont => cont.dataset.state = 'closed');
        
        // 3.2 Show relevant subcategory container
        const subcatLabel = form.querySelector(`.label-subcat-${categorySelected}`);

        if (!subcatLabel) {
            console.log(`.subcat-cont-${categorySelected} y el valor :`, categorySelected)
            return
        }
        // 3.3 Show container
        toggleState(subcatLabel, true); 

        // 3.4 Initialize enhanced select if needed
        const subcatSelect = subcatLabel.querySelector('.subcat-select');
        if (subcatSelect) subcatInput.value = subcatSelect.value; // Sync initial value

        // 3.5 for logic on selected labels we need to initialize every choice
        if (choicesInit && subcatSelect) initSelectChoices(subcatSelect);
    };

    // Initialize with default category
    openSelectByCategory(categorySelect.value || 0);
};


/**
 * Manages main image selection in a product gallery by:
 * 1. Setting up event delegation for image selection
 * 2. Applying visual indicators to the selected main image
 * 3. Maintaining state through data attributes
 * 
 * @param {HTMLElement} modalForm - The container element for product images
 */
function changeMainImageEvent(modalForm) {
    // 1. Get image container and setup event delegation
    const imageContainer = modalForm.querySelector('.cont-modal-images');

    // 2. Handle change events from radio inputs
    imageContainer.addEventListener('change', function(e) {
        // 2.1 Only process events from our target checkboxes
        if (!e.target.matches('input[type="radio"][name="main_image"]')) return;

        // 3. Get selected image ID
        const selectedId = e.target.value;

        // 4. Process all images in container
        const allImages = this.querySelectorAll('img');
        allImages.forEach(img => {
            const imgId = img.dataset.index;
            const container = img.closest('.cont-main-image');

            // 4.1 Apply visual and data state to selected image
            if (imgId === selectedId) {
                img.dataset.main = "true";
                container.classList.add('border-main');
                container.classList.remove('border-secondary');
            // 4.2 Remove indicators from other images
            } else {
                img.dataset.main = "false";
                container.classList.remove('border-main');
                container.classList.add('border-secondary');
            }
        });
    });
}


/**
 * Calculates and updates the subtotal of a product based on its price and discount percentage.
 * - Automatically recalculates subtotal on input changes.
 * - Formats the final value with thousand separators.
 * - Makes the subtotal field read-only.
 *
 * @param {HTMLFormElement} form - The form containing price, discount, and subtotal inputs.
 */
function calculateDiscountSubtotal(form) {
    // 1. Select the input elements for price, discount, and subtotal
    const priceInput = form.querySelector(".modal-price");
    const discountInput = form.querySelector(".modal-discount");
    const subtotalInput = form.querySelector(".modal-subtotal");

    // 2. Make the subtotal input read-only to prevent user editing
    subtotalInput.readOnly = true;

    /**
     * Calculates the subtotal based on price and discount percentage.
     * Updates the subtotal input value with formatted number.
     */
    const calculateSubtotal = () => {
        // a. Clean price and discount input values
        //    - Remove thousands separators (dots), replace comma with dot for decimal
        const priceText = priceInput.value.replace(/\./g, "").replace(",", ".");
        const discountText = discountInput.value.replace(/\./g, "").replace(",", ".");

        // b. Parse the values into numbers, fallback to 0 if invalid
        const price = parseFloat(priceText) || 0;
        const discount = parseFloat(discountText) || 0;

        // c. Calculate the discounted subtotal
        const discountAmount = price * (discount / 100);
        const subtotal = price - discountAmount;

        // d. Format and display subtotal with thousand separators and no decimals
        subtotalInput.value = subtotal.toLocaleString("es-ES", {
            maximumFractionDigits: 0,
            useGrouping: true,
        });
    };

    // 3. Recalculate subtotal when price or discount input changes
    priceInput.addEventListener("input", calculateSubtotal);
    discountInput.addEventListener("input", calculateSubtotal);

    // 4. If discount is empty, initialize it to 0
    if (!discountInput.value || discountInput.value === '0') {
        discountInput.value = "";
    }

    // 5. Add input sanitizers to allow only digits, dots, and commas
    [priceInput, discountInput].forEach(input => {
        input.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9,.]/g, "");
        });
    });

    calculateSubtotal();
}


/**
 * Initializes all cancel buttons within the given form.
 * - Ensures no duplicate event listeners are attached.
 * - Simulates a click on the modal's close button when cancel is pressed.
 * eventHandlersMap is from static/js/ base.js
 *
 * @param {HTMLFormElement} form - The form containing cancel buttons.
 */
function initModalCancelBtns(form, modalClose) {

    // Select all buttons that act as cancel triggers inside the form
    const btnCancels = form.querySelectorAll('.form-modal-cancel');

    // Iterate over each cancel button
    btnCancels.forEach(btnCancel => {
        // Check if this button already has a registered event handler
        if (eventHandlersMap.has(btnCancel)) {
            // Remove the previously attached event handler to avoid duplicates
            const prevHandler = eventHandlersMap.get(btnCancel);
            btnCancel.removeEventListener('click', prevHandler);
        }

        // Create a new click handler that triggers the modal close button
        const closeHandler = () => { modalClose.click(); };

        // Attach the new click handler to the cancel button
        btnCancel.addEventListener('click', closeHandler);

        // Store the handler reference for future removal if needed
        eventHandlersMap.set(btnCancel, closeHandler);
    });
}


/**
 * Resets the inputs of a modal form.
 * Optionally resets all text, hidden, and select fields.
 * Also handles FilePond destruction for image input cleanup.
 * 
 * @param {HTMLElement} form - The form element to reset.
 * @param {boolean} all - Whether to reset all form fields (true) or only the image input (false).
 */
function resetInputsModalForm(form, all = false) {
    // Select the image input field (used with FilePond)
    const imageInput = form.querySelector('.image-input');

    // If a FilePond instance is active (globalPond), destroy it to clean up any previous images
    if (globalPond) {
        FilePond.destroy(imageInput);
        globalPond = null;
    }

    // Clear the file input value
    imageInput.value = '';

    // If 'all' is true, reset additional inputs
    if (all) {
        // Reset all text and hidden inputs inside the form
        const inputs = form.querySelectorAll('input[type="text"], input[type="hidden"]');
        inputs.forEach(input => input.value = '');

        // Reset all select elements to default value '0'
        const selects = form.querySelectorAll('select');
        selects.forEach(input => input.value = '0');
    }
}
