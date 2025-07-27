

// ==============================================================
//      MODAL FORM TO UPDATE SOME MODEL
// ==============================================================
function enrichDatasetModal(dataset, btn) {
    const object = btn.dataset.object;
    const action = btn.dataset.action;
    if (!object || !action) return dataset;

    const objectLabels = {
        brand: "Marca",
        category: "Categoría",
        subcategory: "Sub-Categoría",
        product: "Producto",
        header: "Header",
        banner: "Banner"
    };

    const label = objectLabels[object];
    if (!label) return dataset;

    // Construir valores por defecto dinámicamente
    let fallback;
    if (["Marca", "Categoría", "Sub-Categoría"].includes(label)) {
        fallback = {
            title: `${action === 'create' ? 'Nueva' : 'Editar'} ${label}`,
            span: label,
            ...(action === 'update' ? { oldName: dataset.name } : {})
        };
    } else if (label === 'Producto') {
        fallback = {
            title: `${action === 'create' ? 'Agregar Nuevo' : 'Editar'} ${label}`,
        };
    } else if (["Header", "Banner"].includes(label)) {
        fallback = {
            title: `${action === 'create' ? 'Crear Nuevo' : 'Editar'} ${label}`,
            span: label,
        };
    }

    return { ...fallback, ...dataset }; // dataset sobrescribe si define valores
}


/* los parametros son una fila de la tabla y el form Modal que se abre */
function updateModalFormInputs(btn, form) {

    // 1. Verificamos si existe el atributo data-model
    const modelAttr = btn.getAttribute('data-model');
    const datasetInit = modelAttr ? JSON.parse(modelAttr) : {}; ;    
    const dataset = enrichDatasetModal(datasetInit, btn);
    // console.log("Dataset enriquecido:\n", JSON.stringify(dataset, null, 2));

    // 2. Guardaremos los valores iniciales
    const initialValues = {};  

    // 3. Completamos dinamicamente a partir del data-model formateado, para eso deben existir las clases que
    // respeten el patron modal-key
    let flagContImages = false;

    Object.entries(dataset).forEach(([key, value]) => {

        // Buscar input con id="modal-[key]"
        const input = form.querySelector(`.modal-${key}`) || null;

        if (input && input.tagName == "INPUT" ) {
            if (input.type === "checkbox") {
                input.checked = value === "True";
                initialValues[key] = input.checked;
            } else {
                input.value = value;
                initialValues[key] = value;
            }
            return;    // its like continue
            
        // Destruye el anterior choice.js y lo recrea por cada vez que se abre el modal
        } else if (input && input.tagName == "SELECT") {
            
            input.value = value;    // asigna su value al elemento
            initSelectChoices(input);

            if (key.startsWith("subcategory-")) {
                // const subcatInput = form.querySelector('[name="subcategory"]');
                // subcatInput.value = value
                initialValues['subcategory'] = value;
                
            } else {
                initialValues[key] = value;
            }
        }

        // this is for radios type input
        else if (["main_image", "available"].includes(key)) {
            let radios = form.querySelectorAll(`input[name="${key}"]`);
            for (const radio of radios) {
                if (radio.value === value) {
                    radio.checked = true;
                    initialValues[key] = value;
                    break;
                }
            }
        }

        /* generic text on modal to changes */
        else if (["span", "title", "oldName"].includes(key)) {
            let contsText = form.querySelectorAll(`.modal-${key}`)
            contsText.forEach(i => i.textContent = value)
        }

        /* generic case for img on product modal */
        else if (key.startsWith("image-")) {
            const contImages = form.querySelector('.cont-modal-images');
            if (!contImages) return;

            // Solo limpiar al inicio (ej. si aún no lo hiciste)
            if (!flagContImages) {
                contImages.innerHTML = '';
                flagContImages = true;  // Flag para no limpiar de nuevo
            }

            // obtenemos atributos desde la key
            const [, isMain, imageId] = key.split("-");

            // set value in initial values form to compare after
            if (isMain === "True") initialValues["main_image"] = imageId;
        
            const imageHTML = `
                <div class="d-flex-col w-100 gap-1">
                    <div class="cont-100 cont-check-main h-220 ${isMain === "True" ? 'border-main' : 'border-secondary'}">
                        <img 
                            src="${value}" 
                            alt="Product image" 
                            data-index="${imageId}" 
                            data-main="${isMain}"
                            class="img-scale-down"
                        />
                    </div>
                    <div class="d-flex-col gap-1">
                        <label class="d-flex gap-1">
                            <input 
                                type="radio"
                                class="check-main"
                                name="main_image"
                                value="${imageId}" 
                                ${isMain === "True" ? "checked" : ""}
                            >
                            <span>Principal</span>
                        </label>

                        <label class="d-flex gap-1">
                            <input type="checkbox" name="delete_images" value="${imageId}">
                            <span>Eliminar</span>
                        </label>
                    </div>
                </div>
            `;
        
            contImages.insertAdjacentHTML('beforeend', imageHTML);
        }

        // optional for headers and banners
        else if (key.startsWith("header-")) { 
            const contHeader = form.querySelector('.header-modal-images');
            if (!contHeader) return;

            const [, isMain, imageId] = key.split("-");

            // set value in initial values form to compare after
            if (isMain === "True") initialValues["main_image"] = imageId;

            contHeader.innerHTML = ''
            const imageHTML = `
                <div class="cont-img-100 ${isMain === "True" ? 'border-main' : ''}">
                    <img 
                        src="${value}" 
                        alt="Header/Banner image" 
                        data-index="${imageId}" 
                        data-main="${isMain}"
                        class="img-scale-down ${isMain === "True" ? 'border-main' : ''}"
                    />
                </div>
            `;
            contHeader.insertAdjacentHTML('beforeend', imageHTML);
        }
    });

    // Asociamos el diccionario al form
    form._initialValues = initialValues;
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
        // console.log('Value Now: ', currentValue, 'and Value Old: ', oldValue)

        // Si hay diferencia, lo guardamos directamente como valor nuevo
        if (currentValue != oldValue) {
            changes[key] = currentValue;
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
 * @param {boolean} [choicesInit=false] - Whether to initialize Choices.js
 */
function subcategorySelectEvents(form, choicesInit = false) {
    // 1. Configure category selection handler
    const categorySelect = form.querySelector('.category-select');
    categorySelect.addEventListener('change', (e) => {
        openSelectByCategory(e.target.value); // Update UI based on selection
    });

    // 2. Sync subcategory selections to hidden input
    const subcatInput = form.querySelector('[name="subcategory"]');
    const subcatSelects = form.querySelectorAll('.subcat-select');
    subcatSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            subcatInput.value = e.target.value; // Store selected value
        });
    });

    // 3. Manage subcategory visibility
    const subcatContainers = form.querySelectorAll('.subcat-container');
    function openSelectByCategory(categorySelected) {
        // 3.1 Hide all subcategory containers initially
        subcatContainers.forEach(container => {
            container.setAttribute('data-state', 'closed');
        });
        
        // 3.2 Reset and validate selection
        // subcatInput.value = '0'; // Default value
        // if (categorySelected === '0' || !categorySelected) return;

        // 3.3 Show relevant subcategory container
        let subcatContainer;
        subcatContainer = form.querySelector(`.subcat-cont-${categorySelected}`);
        if (!subcatContainer) {
            subcatContainer = form.querySelector('.subcat-cont-0');
        };
        if (!subcatContainer) {
            console.log('bug')
            console.log(`.subcat-cont-${categorySelected} y el valor :`, categorySelected)
            toggleState(subcatContainer); // Show container
            return
        }

        toggleState(subcatContainer); // Show container

        // 3.4 Initialize enhanced select if needed
        const subcatSelect = subcatContainer.querySelector('.subcat-select');
        if (subcatSelect) {
            subcatInput.value = subcatSelect.value; // Sync initial value

            // 3.5 Only creates choices instance if the flag is active
            if (choicesInit) initSelectChoices(subcatSelect);
        }
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
        if (!e.target.classList.contains('check-main')) return;

        // 3. Get selected image ID
        const selectedId = e.target.value;

        // 4. Process all images in container
        const allImages = this.querySelectorAll('img');
        allImages.forEach(img => {
            const imgId = img.dataset.index;
            const container = img.closest('.cont-check-main');

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
 * Manages description modal events with custom markdown processing:
 * 1. Converts HTML to custom markdown syntax
 * 2. Provides real-time preview with custom formatting
 * 3. Handles bidirectional conversion between HTML and custom markdown
 * 
 * @param {HTMLElement} form - Container element holding modal components
 * @param {string|null} productId - ID of the product being edited
 */
function descriptionModalEvents(form, productId = null, tableSection = null) {
    /**
     * Converts textarea content to formatted HTML preview
     * @param {HTMLTextAreaElement} textarea - Input element with raw text
     * @param {HTMLElement} preview - Container for rendered preview
     */
    function updatePreview(textarea, preview) {
        const text = textarea.value;
        const lines = text.split('\n');
        let htmlOutput = '';

        lines.forEach(line => {
            let processedLine = line
                .replace(/\(\*\)/g, '<strong>(*)</strong>')  // Highlight (*) notation
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
                .replace(/^\*-\s?(.*)/, '• $1')  // Small bullet point
                .replace(/^\*\s?(.*)/, '● $1')   // Normal bullet point
                .replace(/^--$/, '&nbsp;');  // Empty line placeholder

            htmlOutput += `<p>${processedLine}</p>`;
        });

        preview.innerHTML = htmlOutput;
    }

    /**
     * Converts HTML back to custom markdown syntax
     * @param {string} html - HTML string to convert
     * @returns {string} Custom markdown formatted text
     */
    function htmlToCustomMarkdown(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const paragraphs = doc.querySelectorAll('p');
        let markdownOutput = '';

        paragraphs.forEach(p => {
            let line = p.innerHTML;

            // Processing order matters for nested formats
            line = line.replace(/<strong>\(\*\)<\/strong>/g, '(*)')
                       .replace(/<strong>(.*?)<\/strong>/g, '**$1**');

            // Handle bullet points
            if (line.startsWith('● ')) {
                line = '* ' + line.slice(2).trim();
            } else if (line.startsWith('• ')) {
                line = '*- ' + line.slice(2).trim();
            }

            // Handle empty lines
            if (line.includes('&nbsp;')) {
                line = '--';
            }

            markdownOutput += line + '\n';
        });

        return markdownOutput.trim();
    }

    // 1. DOM element initialization
    const textarea = form.querySelector('.modal-description');
    const preview = form.querySelector('.description-preview');

    // 2. Initial content conversion
    let htmlString;
    const template = (productId && tableSection) 
        ? tableSection.querySelector(`#template-${productId}`) 
        : null;

    htmlString = template 
        ? template.innerHTML 
        : form.querySelector('#template-add-product').innerHTML;
    
    textarea.value = htmlToCustomMarkdown(htmlString);
    updatePreview(textarea, preview);

    // 3. Real-time preview with debounce
    let changeCount = 0;
    const changeThreshold = 5;  // Cuántos inputs son suficientes para decir "hubo edición"
    textarea.dataset.wasEdited = "false";

    let timeout;
    textarea.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            updatePreview(textarea, preview);
            changeCount++;

            // Marcamos que hubo una edición si se superó el umbral
            if (changeCount >= changeThreshold) {
                textarea.dataset.wasEdited = "true";
            }
        }, 200);
    });
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
