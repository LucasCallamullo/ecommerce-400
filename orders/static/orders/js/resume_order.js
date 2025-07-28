/// <reference path="../../../../static/js/base.js" />
/// <reference path="../../../../static/js/forms.js" />
/// <reference path="../../../../static/js/utils.js" />
/// <reference path="../../../../static/js/overlay-modal.js" />


/**
 * Attaches change event listeners to all radio inputs with name "payment".
 * When a radio button is selected, it updates the display of all elements
 * with the class "payment-method" and shows a success alert.
 *
 * @param {HTMLFormElement} form - The form element containing the payment options.
 */
function paymentRadio(form) {
    // Select all radio buttons with the name "payment"
    const radios = document.querySelectorAll('input[name="payment"]');

    // Select all elements meant to display the selected payment method
    const paymentSpans = document.querySelectorAll('.payment-method');

    // Loop through each radio button and attach a change event listener
    radios.forEach(payment => {
        payment.addEventListener('change', (event) => {
            if (event.target.checked) {
                // When a radio is selected, update all display spans
                paymentSpans.forEach(display => {
                    display.textContent = event.target.value;
                });

                // Show success alert with the selected payment method
                openAlert(`Método de pago actualizado a ${event.target.value}.`, 'green', 2000);
            }
        });
    });
}


/**
 * Attaches change event listeners to all radio inputs with name "ship".
 * Updates shipping information, displays the correct form section,
 * updates price display, and shows a confirmation alert.
 *
 * @param {HTMLFormElement} form - The form element containing shipping options and sections.
 */
function shippingRadio(form) {
    // Select all radio buttons with the name "ship"
    const radios = document.querySelectorAll('input[name="ship"]');

    // Select all elements meant to display the selected shipping method
    const shipSpans = document.querySelectorAll('.shipment-method');

    // Element where the shipping price is displayed
    const shipPriceSpan = document.getElementById('shipment-price');

    // Sections to show or hide depending on the selected shipping method
    const retireSection = form.querySelector('#retire-form');
    const shippinSection = form.querySelector('#shippin-form'); 

    // Loop through each shipping radio button
    radios.forEach(option => {
        option.addEventListener('change', (event) => {
            // Get the dataset index (used to determine selected shipping method)
            shipId = event.target.dataset.index;

            // Toggle visibility of form sections based on selected shipping method
            if (shipId === '1') {
                retireSection.style.display = 'block';
                shippinSection.style.display = 'none';
                scrollToSection(retireSection);

                // Activar required solo en la sección de retiro
                toggleRequiredInputs(retireSection, true);
                toggleRequiredInputs(shippinSection, false);
            } else {
                retireSection.style.display = 'none';
                shippinSection.style.display = 'block';
                scrollToSection(shippinSection);

                // Activar required solo en la sección de envío
                toggleRequiredInputs(retireSection, false);
                toggleRequiredInputs(shippinSection, true);
            }

            // Get and format the shipping price from data-price attribute
            let price = formatNumberWithPoints(event.target.dataset.price);
            shipPriceSpan.textContent = price === 'Gratis' ? price : `$ ${price}`;

            // Update all spans showing the selected shipping method
            shipSpans.forEach(display => { display.textContent = event.target.value; });

            openAlert(`Método de envío actualizado a ${event.target.value}.`, 'green', 2000);
        });
    });

    function toggleRequiredInputs(section, isRequired) {
        const inputs = section.querySelectorAll('.input-required');
        inputs.forEach(input => {
            if (isRequired) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
            }
        });
    }
}


/**
 * Validates and submits the order form.
 * Gathers form data, ensures that a payment and shipping method are selected,
 * then sends the data via POST in JSON format.
 *
 * @param {HTMLFormElement} form - The form element containing order details.
 * @returns {Promise<string|undefined>} - Returns the order ID on success, or undefined if failed.
 */
async function validFormOrder(form) {
    // Add additional values to the form data
    const paymentId = document.querySelector('input[name="payment"]:checked');
    const shipmentId = document.querySelector('input[name="ship"]:checked');

    // If either option is not selected, show an alert and stop
    if (!shipmentId || !paymentId) {
        openAlert('Elija correctamente un método de pago o envío', 'orange', 1500);
        return;
    }

    // Build FormData and convert to JSON
    const formData = new FormData(form);
    formData.append('payment_method_id', paymentId.dataset.index);
    formData.append('shipping_method_id', shipmentId.dataset.index);  
    const jsonData = Object.fromEntries(formData.entries());

    const url = window.TEMPLATE_URLS.validOrder

    try {
        // Send the POST request to the server with JSON data
        const response = await fetch(url, { 
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json(); 

        // If response is not ok, handle different types of errors
        if (!response.ok) {    
            openAlert(data.detail || 'No hay suficiente Stock.', 'red', 1500);
            return;
        }

        // On success, notify and return order ID
        openAlert('Pedido guardado, complete su pago para finalizar!', 'green', 1500);
        return data.order_id;

    } catch (error) {
        console.error('Error:', error);
        openAlert('Error al procesar la solicitud. Intenta nuevamente.', 'red', 2000);
    }
}


/**
 * Handles the setup and validation logic for the order form modal.
 * @param {HTMLFormElement} form - The order form element.
 */
function eventFormOrder(form) {
    const modal = document.querySelector('.modal-order');
    const btnClose = modal.querySelector('.btn-close');

    const overlay = document.getElementById('overlay-order');
    const btnOpenModal = document.getElementById('btn-open-order');

    let flag = false;

    // Set up modal toggle behavior with validation before opening
    setupToggleableElement({
        toggleButton: btnOpenModal,
        closeButton: btnClose,
        element: modal,
        overlay: overlay,
        shouldOpen: (e) => {
            if (!flag) flag = flagsOrdersConfirm();
            return flag;
        },
    });

    const confirmButton = form.querySelector('#btn-confirm-form');
    
    // First confirm button: validates and opens modal if valid
    confirmButton.addEventListener('click', () => {
        if (!flag) {
            flag = flagsOrdersConfirm();
            if (!flag) return;
        }
        btnOpenModal.click();
    });

    const confirmButtonModal = document.getElementById('btn-confirm-order-modal');
    const btnFormSubmit = form.querySelector('#btn-order-submit');
    
    // Second confirm button inside modal: closes modal and submits form if valid
    confirmButtonModal.addEventListener('click', () => {
        if (!flag) {
            flag = flagsOrdersConfirm();
            if (!flag) return;
        }
        btnClose.click();
        btnFormSubmit.click();
    });

    const paymentSection = document.querySelector('#payment-methods-section');
    const shippingSection = document.querySelector('#shipping-methods-section');

    /**
     * Validates if a radio input in a section is selected properly.
     * @param {string} name - The name of the radio input group.
     * @param {HTMLElement} section - The section to scroll to if invalid.
     * @param {string} errorMessage - The error message to show if invalid.
     * @returns {boolean}
     */
    function validateRadioSelection(name, section, errorMessage) {
        const input = document.querySelector(`input[name="${name}"]:checked`);
        if (!input || input.dataset.index === '0') {
            openAlert(errorMessage, 'red', 2000);
            scrollToSection(section);
            return false;
        }
        return true;
    }

    /**
     * Confirms both payment and shipping method are selected properly.
     * Sets `flag` to true if both are valid.
     * @returns {boolean}
     */
    function flagsOrdersConfirm() {
        if (
            !flag &&
            validateRadioSelection("payment", paymentSection, "No seleccionaste un Método de Pago.") &&
            validateRadioSelection("ship", shippingSection, "No seleccionaste un Método de Envío.")
        ) {
            flag = true;
        }
        return flag;
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-order');
    let order_id;

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Call the generic handler for form submission (includes animation, validation, and redirect)
        await handleGenericFormBase({
            form: form, 
            submitCallback: async () => {
                try {
                    order_id = await validFormOrder(form);
                } catch (err) {
                    console.log('Validation error:', err);
                }
            },
            closeCallback: () => {
                // Redirect user to the payment page with the correct order ID in the URL
                const url = window.TEMPLATE_URLS.paymentPage.replace('{order_id}', `${order_id}`);
                window.location.href = url;
            },
            flag_anim: true,
            time_anim: 1500
        });
    });

    // Initialize logic related to selecting a payment method
    paymentRadio(form);

    // Initialize logic related to selecting a shipping method
    shippingRadio(form);

    // Initialize additional event handlers for the order form
    eventFormOrder(form);
});
