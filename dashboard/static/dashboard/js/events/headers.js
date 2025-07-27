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
    const contUpdates = form.querySelectorAll('.cont-block-update');
    const contCreates = form.querySelectorAll('.cont-block-create');

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

            // c) Fill in the form inputs based on the data from the clicked button
            updateModalFormInputs(btn, form);

            // d) Update internal dataset values used for submission
            const btnSubmit = form.querySelector('.btn-form-submit');
            btnSubmit.dataset.action = btn.dataset.action;  // e.g., "create" or "update"
            form.dataset.model = btn.dataset.object;
            form.dataset.index = btn.dataset.index;

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
