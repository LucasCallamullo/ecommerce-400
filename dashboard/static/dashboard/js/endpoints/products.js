/// <reference path="../../../../../static/js/base.js" />
/// <reference path="../events/products.js" />
/// <reference path="../generic/forms_utils.js" />
/// <reference path="../endpoints/images.js" />

/*
INDICE
    validFormProduct
    endpointProductUpdateOrCreate
    uploadImages      <reference path="../endpoints/images.js" />
    deleteProductImages
    updateOrCreateProduct
*/


/**
 * Sends an HTTP request (PUT or POST) to update or create product data using the Fetch API.
 *
 * @param {Object} dataSend - The validated product data to be sent as JSON.
 * @param {string} action - The action to perform: 'update' or 'create'.
 * @param {number|string} product_id - The ID of the product to be updated (required for 'update').
 * @throws Will throw an error if the response status is not OK (non-2xx).
 */
async function updateOrCreateProduct(dataSend, url, httpMethod) {
    // 1. make rquest
    const response = await fetch(url, {
        method: httpMethod,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(dataSend)
    });

    const data = await response.json();

    // If the response failed, notify the user and propagate the error to the caller
    if (!response.ok) {
        const errorMessage = Object.values(data)[0]?.[0] || "Error al procesar la solicitud, recargue la página.";
        openAlert(errorMessage, 'red', 2000);
        // throw new Error(errorMessage)
        // Esto propaga el error hacia el try/catch de la function anterior, lo cual es correcto (similar al raise Py).
        throw new Error(`API Error [${response.status}]: ${JSON.stringify(data)}`);
    }

    if (!data.product_id) {
        openAlert("Error al procesar la solicitud, recargue la página.", 'red', 1500);
        throw new Error('La respuesta del servidor no contiene product_id.');
    }

    // If the request was successful, show confirmation to the user
    const successMessage = httpMethod === 'POST'
        ? 'Producto creado correctamente.'
        : 'Producto actualizado correctamente.';
    openAlert(successMessage, 'green', 1500);

    return data.product_id;
}


/**
 * Sends a DELETE request to remove specific product images.
 * @param {number|string} product_id - The ID of the product to be delete images (required for 'delete').
 * @param {Array<number|string>} imagesToDelete - An array of image IDs to be deleted.
 * @throws Will throw an error if the server responds with an error.
 */
async function deleteProductImages(product_id, imagesToDelete) {
    // Fetch the URL for deleting images
    const urlDel = window.TEMPLATE_URLS.imageProducts.replace('{product_id}', product_id);

    const response = await fetch(urlDel, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({delete_images: imagesToDelete})
    });

    const data = await response.json();

    // If the server returns an error, propagate it to the caller
    if (!response.ok) throw new Error('Failed to delete images' || data.detail);

    // On success, show confirmation message
    openAlert('Imágenes eliminadas correctamente.', 'green', 1500);
}





/**
 * Validates and sanitizes the product form data before sending it to the server.
 * This function checks the validity of numerical fields, sanitizes the product description to prevent XSS, 
 * and returns an object with the validated data or null if validation fails.
 *
 * @param {FormData} formData - The FormData object containing the form fields and their values.
 * @returns {Object|null} - Returns the validated data as an object, or null if validation fails.
 */
function validFormProduct(form, action) {
    // Predefined messages for different validation failures
    const failedMessages = {
        'name': 'El nombre es muy corto.',
        'stock': 'El stock debe ser un número entero.',
        'price': 'El precio debe contener solo números.',
        'discount': 'El descuento debe ser un número entero.',
        'category': 'Categoría no valida, recargue la página.',
        'subcategory': 'Sub-Categoría no valida, recargue la página.',
        'brand': 'Marca no valida, recargue la página.',
        'no_changes': 'No realizaste ningún cambio.',
        'on_default': 'Algo salió mal, recargue la página...'
    };

    // Field-specific validators
    const fieldsValidators = {
        name: (v) => validInputBasic(v, failedMessages.name, 3),
        price: (v) => validPrice(v, failedMessages.price),
        stock: (v) => validNonNegativeInteger(v, failedMessages.stock),
        discount: (v) => validNonNegativeInteger(v, failedMessages.discount),
        available: (v) => validBoolCheckBox(v),
        // description: () => validDescription(), // validator is en modal_form/get_changes(form)
        category: (v) => validNonNegativeInteger(v, failedMessages.category),
        subcategory: (v) => validNonNegativeInteger(v, failedMessages.subcategory),
        brand: (v) => validNonNegativeInteger(v, failedMessages.brand),
        main_image: (v) => validNonNegativeInteger(v, failedMessages.on_default)
    };

    // complete de datasend
    const dataSend = {};
    const formData = new FormData(form);

    for (let [key, value] of formData.entries()) { console.log(`${key}: ${value}`); }    // debugging

    switch (action) {
        case 'update': {
 
            // Detect which fields have changed before sending an update
            const changes = getChangedFields(form);
            if (Object.keys(changes).length === 0) {
                openAlert(failedMessages.no_changes, 'orange', 1500);
                return null;
            }

            // Validate only changed fields
            for (const [key, value] of Object.entries(changes)) {
                if (key === 'description') {
                    dataSend[key] = value;
                    continue;
                }

                if (!fieldsValidators[key]) continue;
                dataSend[key] = fieldsValidators[key](value);

                // If validation fails, stop and return null
                if (dataSend[key] == null) return null;

                if (key === 'subcategory' && !('category' in dataSend)) {
                    dataSend['category'] = fieldsValidators['category'](formData.get('category'));
                }
            }

            break;
        }

        case 'create': {
            // Description se maneja por separado
            const desc = fieldsValidators['description']();
            if (desc !== '') dataSend['description'] = desc;

            // For creation, validate all required fields
            for (const [key, validator] of Object.entries(fieldsValidators)) {
                if (key === 'description') continue;

                const rawValue = formData.get(key);
                const validated = validator(rawValue);

                if (validated == null) return null;
                dataSend[key] = validated;
            }
            break;
        }

        default: {
            // Handle unexpected actions
            openAlert(failedMessages.on_default, 'orange', 1500);
            return null;
        }
    }

    console.log("Data to send:", JSON.stringify(dataSend, null, 2)); // Debug: log final data
    return dataSend;
}

async function endpointsProduct(form, action, dashSection) {

    // 2. Get the model ID (used for update/delete). Default to 0 for creation.
    const productId = form.dataset.index || 0;

    // 3. Validate and prepare the form data (custom function)
    const dataSend = validFormProduct(form, action);
    if (!dataSend) return;

    // 4. Build the URL and HTTP method depending on the action
    let url, httpMethod;
    switch (action) {
        case 'update':
            if (!productId) {
                openAlert("Error al procesar la solicitud, recargue la página.", 'red', 1500);
                return;
            }
            url = window.TEMPLATE_URLS.updateProduct.replace('{product_id}', productId);
            httpMethod = 'PUT'
            break;

        case 'create':
            url = window.TEMPLATE_URLS.createProduct;
            httpMethod = 'POST'
            break;

        default:
            openAlert(`Missing 'url' parameter for ${action} action. Url: ${url}`, 'red', 1500);
            return;
    }

    await handleGenericFormBase({
        form: form,
        submitCallback: async () => {
            // 1. Update product data
            const product_id = await updateOrCreateProduct(dataSend, url, httpMethod);
            console.log('se mando al server xd')

            // 2. Gather checked checkboxes to delete images only in update
            if (action === "update") {
                // view input dynamic create in modal_form.js
                const checkboxes = form.querySelectorAll('input[name="delete_images"]:checked');
                const imagesToDelete = Array.from(checkboxes).map(checkbox => checkbox.value);
        
                // 5. Validate if there are images to delete
                if (imagesToDelete.length > 0) await deleteProductImages(product_id, imagesToDelete);
            }

            // 3. Upload new images if any are selected , this step is present in Create or Update
            const urlImages = window.TEMPLATE_URLS.imageProducts.replace('{product_id}', product_id)
            await uploadImages({url: urlImages});

        },
        // optional parameters
        closeCallback: () => {
            // 7.a. Close the modal after the changes are saved or failed
            const closeForm = form.querySelector('.btn-close');
            if (closeForm) closeForm.click();  // Trigger the close event

            // 1.0 Refresh form references (post-DOM update)
            const formFilter = dashSection.querySelector('.form-select-filters');

            if (!formFilter) {
                getDashboardSection('products');
                return;
            }
            
            // 1.1 Trigger form submission
            const submitBtn = formFilter.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
            else getDashboardSection('products');
        },
        // Optional: enable spinner animation on submit button
        flag_anim: true,
        time_anim: 1000    // or 0 is optional if flag is true
    });
}

