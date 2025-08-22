/// <reference path="../../../../../static/js/base.js" />
/// <reference path="../../../../../static/js/outside-click.js" />
/// <reference path="../generic/modal_form.js" />
/// <reference path="../endpoints/images.js" />


/**
 * Manages the complete interaction flow for category/subcategory/brand editing tabs,
 * including modal handling, form submission, and state management.
 * 
 * @function formEventsCategories
 * @param {HTMLElement} dashSection - The dashboard section container element
 * 
 */
function formEventsCategories(dashSection, overlay) {
    const form = dashSection.querySelector('#form-modal-categories');
    const modalClose = form.querySelector('.btn-modal-close');

    const getObjectMap = {
        'category': (objectId) => window.CategoriesStore.getCategoryById(objectId),
        'subcategory': (objectId) => window.CategoriesStore.getSubcategoryById(objectId),
        'brand': (objectId) => window.BrandStore.getBrandById(objectId)
    }

    // Configura el modal UNA VEZ y obtén el método `open`
    const { open } = setupToggleableElement({
        closeButton: modalClose,
        element: form,
        overlay: overlay,
        onOpenCallback: ({ params }) => {
            const { btn } = params;
            // a) Set initial form events (e.g., submission or validation)
            initInputImage(form);
            initModalCancelBtns(form, modalClose);

            // b) Set selects Choices for brands and categories
            const categorySelect = form.querySelector('.category-select');
            initSelectChoices(categorySelect);

            // c) Update the form inputs based on the selected row's data
            const action = btn.dataset.action;    // update, create
            const objectId = parseInt(btn.dataset.index) || 0;
            const objectName = btn.dataset.object;    // 'category', 'subcategory', 'brand'
            const object = (objectId && action == 'update') ? getObjectMap[objectName](objectId) : null;

            updateModalFormInputs({
                form: form,
                object: object,    // object || null
                objectName: objectName,    // 'category', 'subcategory', 'brand'
                action: action    // update, create
            });

            // update dataset info btn to submit, and form atributtes
            const btnSubmit = form.querySelector('.btn-form-submit');
            btnSubmit.dataset.action = action;    // update, create
            form.dataset.model = objectName;    // 'category', 'subcategory', 'brand'
            form.dataset.index = objectId;

            // Reinicia el checkbox y Cierra la sección si estaba abierta
            let modalCheckDel = form.querySelector('.check-delete');
            let contCheckDel = form.querySelector('.cont-delete-btn');
            modalCheckDel.checked = false; 
            toggleState(contCheckDel, false);

            // Reinicia el estado siempre (evita conflictos visuales/lógicos)
            let flag;
            let contUpdates = form.querySelectorAll('.cont-grid-update');
            contUpdates.forEach(cont => {
                flag = btn.dataset.action === 'update';
                toggleState(cont, flag);
            });

            let contCreates = form.querySelectorAll('.grid-col-all-cond');
            contCreates.forEach(cont => {
                flag = btn.dataset.action === 'create';
                toggleState(cont, flag);
            });

            let contSubcats = form.querySelectorAll('.cont-grid-subcats');
            contSubcats.forEach(cont => {
                flag = btn.dataset.openSelect === 'true';
                toggleState(cont, flag);
            });
        },
        onCloseCallback: () => {
            resetInputsModalForm(form, true);
        }
    });

    // Delegación de eventos en dashSection
    dashSection.addEventListener('click', (e) => {
        let btn = e.target.closest('.btn-open-form-modal');
        if (!btn) return;
        open({ btn });
    });

    // Submit modal form data using custom async handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. en este caso recupero desde el submitter porque tengo uno de delete y otro de create/update
        const submitter = e.submitter;
        const action = submitter.dataset.action; // Ej: "create", "update", "delete"
        
        // 2. send info to the backend
        await endpointsCategoriesAndBrands(form, action);
    });

    // agrega una vez el evento al form to explicit delete question
    const modalCheckDel = form.querySelector('.check-delete');
    const contCheckDel = form.querySelector('.cont-delete-btn');
    if (!modalCheckDel._hasEvent) {
        modalCheckDel._hasEvent = true;

        modalCheckDel.addEventListener('change', () => {
            // ambas funciones vienen de base .js
            let isOpen = toggleState(contCheckDel)
            if (isOpen) scrollToSection(contCheckDel)
        });
    };
}


/**
 * Maneja la lógica de apertura/cierre de tabs de categorías y subcategorías en el dashboard,
 * incluyendo eventos de click y gestión de estados visuales.
 * 
 * @function openTabsCategories
 * @param {HTMLElement} dashSection - Contenedor principal de las categorías en el dashboard
 * 
 * @example
 * // Ejemplo de uso:
 * const section = document.querySelector('.dashboard-section');
 * openTabsCategories(section);
 */
function openTabsCategories(dashSection) {
    // 1. get html elements asociados
    const rowCategories = dashSection.querySelectorAll('.row-categories');
    const contSubcats = dashSection.querySelectorAll('.cont-subcats');

    // 2. add events to close if you click outside
    rowCategories.forEach((row, index) => {
        const container = contSubcats[index];
        setupClickOutsideClose({
            triggerElement: row,
            targetElement: container,
            customToggleFn: () => {
                const isExpanded = toggleState(container);
                return isExpanded
            },
            shouldStopPropagation: (e) => {
                if (e.target.closest('.btn-open-form-modal')) return false;
                return true;
            }
        });
    });

    // 3. evento para abrir todos los tabs mejor presentacion
    const btnOpen = dashSection.querySelector('.btn-open-tabs');
    btnOpen.addEventListener('click', (e) => {
        // evita propagar el click al setupClickOutside
        e.stopPropagation();
        const shouldOpen = btnOpen.dataset.toOpen === 'true';

        rowCategories.forEach((row, index) => {
            // Actualizar ambos atributos para mantener consistencia
            const container = contSubcats[index];
            const isClosed = container.dataset.state === 'closed';

            if (shouldOpen && isClosed) {
                row.click();
            } else if (!shouldOpen && !isClosed) {
                row.click();
            }
        });

        // Actualizar el estado y texto del botón
        const newState = !shouldOpen;
        btnOpen.dataset.toOpen = newState.toString();
        
        const textBtn = btnOpen.querySelector('.text-btn');
        textBtn.textContent = newState ? 'Abrir Todos' : 'Cerrar Todos';
    });
}