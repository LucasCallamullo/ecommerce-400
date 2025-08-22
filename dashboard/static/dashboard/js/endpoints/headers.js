

/**
 * Validates the header form before sending data to the server.
 *
 * @param {HTMLFormElement} form - The HTML form element containing the input fields.
 * @param {string} action - The action type to perform: 'delete', 'update', or 'create'.
 * @returns {Object|null} An object with the data to send if valid, or null if validation fails.
 */
function validFormHeader(form, action) {
    const dataSend = {};

    switch (action) {
        case 'delete': {
            const formData = new FormData(form);
            
            // For delete: require the checkbox to be checked
            const isChecked = formData.get('delete') === 'on';
            if (!isChecked) {
                openAlert('Debes tocar el checkbox para eliminar definitivamente.', 'red', 2000);
                return null;
            }

            dataSend['delete_image'] = isChecked;
            break;
        }

        case 'update': {
            // Detect changed fields before sending update
            const changes = getChangedFields(form);
            if (Object.keys(changes).length === 0) {
                openAlert('No realizaste ningún cambio.', 'orange', 1500);
                return null;
            }

            // Process changes and normalize values
            for (const [key, value] of Object.entries(changes)) {
                if (key === "available") {
                    dataSend[key] = value === "no"; // 'no' means true
                } else if (key === "main_image") {
                    dataSend[key] = value === "yes"; // 'yes' means true
                }
            }
            break;
        }

        case 'create': {
            const formData = new FormData(form);

            // Extract new values for creation
            dataSend["main_image"] = formData.get('main_image') === 'yes'; // 'yes' means true
            dataSend["available"] = formData.get('available') === 'no'; // 'no' means true
            break;
        }

        default: {
            openAlert('Algo salió mal, recargue la página...', 'orange', 1500);
            return null;
        }
    }

    // console.log("Data to send:", JSON.stringify(dataSend, null, 2)); // Debug: formatted output
    return dataSend;
}


/**
 * Handles create, update, or delete actions for store header/banner images.
 * Centralizes logic and validation for working with `header` and `banner` image types.
 *
 * @param {HTMLFormElement} form - The HTML form element containing image and metadata.
 * @param {'create' | 'update' | 'delete'} action - The action to perform.
 *
 * Requirements:
 * - `form.dataset.model`: Must be 'header' or 'banner'.
 * - `form.dataset.index`: Required for update/delete (ID of the image).
 * - `form.dataset.storeId`: Optional, defaults to 1.
 * - Uses global `globalPond` for image file uploads (via FilePond).
 * - Assumes `window.TEMPLATE_URLS.genericUpdateImages` is defined for uploading.
 */
async function endpointsHeadersImages(form, action) {

    // 1. Convert FormData to a JS object and validate specific values
    const dataSend = validFormHeader(form, action);
    if (dataSend === null) return;

    // 2. Extract image model and validate it
    const modelStr = form.dataset.model; // Expected values: 'header', 'banner'
    const allowedModels = ['header', 'banner'];
    if (!allowedModels.includes(modelStr)) {
        openAlert('Modelo no permitido', 'red', 2000);
        return;
    }

    // 3. Extract the image ID and store ID (defaulting to 1)
    const modelId = form.dataset.index;
    const storeId = form.dataset.storeId || 1;

    // 4. Define endpoint and HTTP method based on action
    let url, httpMethod;
    switch (action) {
        case 'update':
            url = `/api/store-images/${storeId}/${modelStr}/${modelId}/`;
            httpMethod = 'PATCH';
            break;

        case 'create':
            if (!globalPond) {
                openAlert(`Debe subir al menos una imagen como nuevo ${modelStr}`, 'orange', 2000);
                return;
            }
            url = `/api/store-images/${storeId}/${modelStr}/`;
            httpMethod = 'POST';
            break;

        case 'delete':
            url = `/api/store-images/${storeId}/${modelStr}/${modelId}/`;
            httpMethod = 'DELETE';
            break;

        default:
            openAlert('Tipo de objeto/acción no válido', 'red', 2000);
            return;
    }

    // 5. Generic handler that encapsulates submit flow, animation and cleanup
    await handleGenericFormBase({
        form: form,
        submitCallback: async () => {

            // 5a. Upload images if not a delete action
            if (action !== 'delete') {
                const imageUrl = await uploadImages({quantity: 1});
                if (imageUrl) {
                    dataSend["image_url"] = imageUrl;
                }
            }

            // console.log("Datos a enviar:", JSON.stringify(dataSend, null, 2)); // Debug info

            // 5b. Send request to the backend
            const response = await fetch(url, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(dataSend),
            });

            const dataModel = await response.json();

            // 5c. Handle errors
            if (!response.ok) {
                const errorMessage = Object.values(dataModel)[0]?.[0] || "Error al procesar la solicitud";
                openAlert(errorMessage, 'red', 2000);
                throw new Error(errorMessage);
            }

            // 5d. Show success message
            const successMessage = {
                'create': `${modelStr} creado exitosamente.`,
                'update': `${modelStr} actualizado exitosamente.`,
                'delete': `${modelStr} eliminado exitosamente.`
            }[action];

            openAlert(successMessage, 'green', 2000);
        },

        // 6. Optional cleanup logic after form closes
        closeCallback: () => {
            const btnCloseForm = form.querySelector('.btn-close');
            if (btnCloseForm) btnCloseForm.click(); // Close modal if exists

            // Refresh data on dashboard (AJAX)
            getDashboardSection('headers');
        },

        // 7. Optional: Submit animation
        flag_anim: true,
        time_anim: 1000
    });
}
