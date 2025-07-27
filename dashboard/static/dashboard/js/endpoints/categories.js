/// <reference path="../../../../../static/js/base.js" />
/// <reference path="../../../../../static/js/forms.js" />
/// <reference path="../generic/modal_form.js" />
/// <reference path="../generic/forms_utils.js" />
/// <reference path="../endpoints/images.js" />



/**
 * Validates form data for category or brand operations such as create, update, or delete.
 *
 * @param {HTMLFormElement} form - The HTML form element containing the user input.
 * @param {string} action - The action to perform: "create", "update", or "delete".
 * @param {string} modelId - The identifier of the object (used when validating image deletions).
 * @param {string} modelStr - The name of the object.
 * @returns {Object|null} An object with validated and normalized data to be sent to the backend,
 *                        or `null` if validation fails or no relevant changes were made.
 */
function validFormCategoriesAndBrands(form, action, modelId, modelStr) {

    const formData = new FormData(form); // Extract raw form data
    const dataSend = {};                 // Object to store validated data

    // Predefined messages for different validation failures
    const failedMessages = {
        'name': 'El nombre es muy corto.',
        'category': 'Categoría no valida, recargue la página.',
        'on_delete': 'Debes tocar el checkbox para eliminar definitivamente.',
        'no_changes': 'No realizaste ningún cambio.',
        'on_default': 'Algo salió mal, recargue la página...'
    };

    // Field-specific validators
    const fieldsValidators = {
        name: (v) => validInputBasic(v, failedMessages.name),
        category: (v) => validNonNegativeInteger(v, failedMessages.category),
        delete_images: (v) => Array.isArray(v) && v.some(id => String(id) === String(modelId))
    };

    switch (action) {
        case 'delete': {
            // Validation for delete action: checkbox must be checked
            const isChecked = formData.get('delete') === 'on';
            if (!isChecked) {
                openAlert(failedMessages.on_delete, 'red', 2000);
                return null;
            }
            dataSend['delete'] = isChecked;
            break;
        }

        case 'update': {
            // Detect which fields have changed before sending an update
            const changes = getChangedFields(form);
            if (Object.keys(changes).length === 0) {
                openAlert(failedMessages.no_changes, 'orange', 1500);
                return null;
            }

            // Validate only changed fields
            for (const [key, value] of Object.entries(changes)) {
                if (!fieldsValidators[key]) continue;
                if (key === 'category' && modelStr !== 'subcategory') continue;

                dataSend[key] = fieldsValidators[key](value);

                // If validation fails, stop and return null
                if (dataSend[key] == null) return null;
            }

            break;
        }

        case 'create': {
            // For creation, validate all required fields
            for (const [key, validator] of Object.entries(fieldsValidators)) {
                if (key === 'category' && modelStr !== 'subcategory') continue;

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

    // console.log("Data to send:", JSON.stringify(dataSend, null, 2)); // Debug: log final data
    return dataSend;
}


/**
 * Handles create, update, and delete operations for categories, subcategories, and brands.
 * 
 * This function:
 *  - Validates the model type and form inputs
 *  - Builds the appropriate API endpoint and HTTP method
 *  - Optionally uploads a new image
 *  - Submits data to the backend
 *  - Shows feedback to the user
 * 
 * @param {HTMLFormElement} form - The form containing the data.
 * @param {string} action - The action to perform: "create", "update", or "delete".
 */
async function endpointsCategoriesAndBrands(form, action) {
    
    // 1. Extract the model type from the form and validate it
    const modelStr = form.dataset.model;
    const allowedModels = ['category', 'subcategory', 'brand'];
    if (!allowedModels.includes(modelStr)) {
        openAlert('Modelo no permitido', 'red', 2000);
        return;
    }

    // 2. Get the model ID (used for update/delete). Default to 0 for creation.
    const modelId = form.dataset.index || 0;

    // 3. Validate and prepare the form data (custom function)
    const dataSend = validFormCategoriesAndBrands(form, action, modelId, modelStr);
    if (!dataSend) return;

    // 4. Build the URL and HTTP method depending on the action
    let url, httpMethod;
    switch (action) {
        case 'update':
            url = `/api/${modelStr}/${modelId}/`;
            httpMethod = 'PUT';
            break;
        case 'create':
            url = `/api/${modelStr}/`;
            httpMethod = 'POST';
            break;
        case 'delete':
            url = `/api/${modelStr}/${modelId}/`;
            httpMethod = 'DELETE';
            break;
        default:
            openAlert('Tipo de acción no válido', 'red', 2000);
            return;
    }

    // 5. Handle the form submission logic
    await handleGenericFormBase({
        form: form,
        submitCallback: async () => {
            let dataUpdate = {};

            // Skip this part for delete actions
            if (action !== 'delete') {
                // 5a. Try to upload new images (returns URL or null if skipped)
                let imageUrl = await uploadImages({ quantity: 1 });

                // 5b. Fallback: if image not uploaded, use delete flag
                if (imageUrl == null) {
                    imageUrl = dataSend.delete_images ? 'true' : 'false';
                }

                // 5c. Construct the payload for submission
                dataUpdate = {
                    ...dataSend,
                    image_url: imageUrl,
                    // Only include the parent category if it's a subcategory
                    ...(modelStr === 'subcategory' && { category: dataSend.category }),
                };
            }

            // Debug: log the data being sent
            console.log("Datos a enviar:", JSON.stringify(dataUpdate, null, 2));

            // 5d. Make the request
            const response = await fetch(url, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(dataUpdate),
            });

            // 5e. Handle errors returned by the backend
            const dataModel = await response.json();
            if (!response.ok) {
                const errorMessage = Object.values(dataModel)[0]?.[0] || "Error al procesar la solicitud";
                openAlert(errorMessage, 'red', 2000);
                throw new Error(errorMessage);
            }

            // 5f. Show a success message depending on the action
            const successMessage = {
                'create': 'Creado exitosamente.',
                'update': 'Actualizado exitosamente.',
                'delete': 'Eliminado exitosamente.'
            }[action];
            openAlert(successMessage, 'green', 2000);
        },

        // 6. After successful submission
        closeCallback: () => {
            // 6a. Close the modal if there’s a close button
            const btnCloseForm = form.querySelector('.btn-close');
            if (btnCloseForm) btnCloseForm.click();

            // 6b. Refresh the content section (e.g., a table with updated data)
            getDashboardSection('categories');
        },
        
        // 7. Optional animation during submission
        flag_anim: true,
        time_anim: 1300
    });
}
