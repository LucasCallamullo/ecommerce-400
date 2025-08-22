/**
 * Handles modal logic for managing header images, including form input updates,
 * event binding, dynamic form behavior, and submit handling for create/update/delete.
 * 
 * @param {HTMLElement} dashSection - The section of the dashboard where headers table and modal are located.
 * @param {HTMLElement} overlay - The overlay element used for modal visibility control.
 */
function formHeadersImages(dashSection, overlay) {
    const form = dashSection.querySelector('#form-modal-headers');
    const modalClose = form.querySelector('.form-modal-close');

    // c) Checkbox used to mark an item for deletion
    const modalCheckDel = form.querySelector('.check-delete');
    const contCheckDel = form.querySelector('.cont-delete-btn');

    // e) Blocks to toggle between update and create UI
    const contUpdates = form.querySelectorAll('.cont-grid-update, .cont-flex-update');
    const contCreates = form.querySelectorAll('.cont-grid-create, .cont-flex-create');

    // este window.HEADERS_IMAGES viene dashboard.js para ver mas info
    const getObjectMap = {
        'header': (objectId) => window.HEADERS_IMAGES.headers.find(h => h.id === objectId) || null,
        'banner': (objectId) => window.HEADERS_IMAGES.banners.find(b => b.id === objectId) || null
    }

    // Set up the modal only once and get its `open` method
    const { open } = setupToggleableElement({
        closeButton: modalClose,
        element: form,
        overlay: overlay,

        // Called each time the modal is opened
        onOpenCallback: ({ params }) => {
            const { btn } = params;

            // a) Initialize image input and cancel buttons within the modal
            initInputImage(form);
            initModalCancelBtns(form, modalClose);

            // b) Reset the delete checkbox and hide its section
            modalCheckDel.checked = false; 
            toggleState(contCheckDel, false);

            // c) Update the form inputs based on the selected row's data
            const action = btn.dataset.action;    // update, create
            const objectId = parseInt(btn.dataset.index) || 0;
            const objectName = btn.dataset.object;    // 'header', 'banner'
            const object = (objectId && action == 'update') ? getObjectMap[objectName](objectId) : null;

            updateModalFormInputs({
                form: form,
                object: object,    // object || null
                objectName: objectName,    // 'category', 'subcategory', 'brand'
                action: action    // update, create
            });

            // d) Update internal dataset values used for submission
            const btnSubmit = form.querySelector('.btn-form-submit');
            btnSubmit.dataset.action = action;  // e.g., "create" or "update"
            form.dataset.model = objectName;
            form.dataset.index = objectId;

            // e) Toggle visibility of update/create blocks
            const isUpdate = btn.dataset.action === 'update';
            contUpdates.forEach(cont => toggleState(cont, isUpdate));
            contCreates.forEach(cont => toggleState(cont, !isUpdate));
        },

        // Called when the modal is closed
        onCloseCallback: () => {
            resetInputsModalForm(form, true); // Reset form fields completely
        }
    });

    // Listen for clicks in the header table and open modal when a relevant button is clicked
    const tableCategories = dashSection.querySelector('#table-headers');
    tableCategories.addEventListener('click', (e) => {
        const btn = e.target.closest('.cont-header-img') || e.target.closest('.btn-add-header');
        if (!btn) return;
        open({ btn });
    });

    // Handle form submission via custom async logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Use the element that triggered the submit to determine the action type
        const submitter = e.submitter;
        const action = submitter.dataset.action; // "create", "update", or "delete"
        
        // 2. Perform the corresponding backend operation
        await endpointsHeadersImages(form, action);
    });

    // Add change event listener to toggle delete confirmation block
    modalCheckDel.addEventListener('change', () => {
        const isOpen = toggleState(contCheckDel);
        if (isOpen) scrollToSection(contCheckDel);
    });
}
