

document.addEventListener('DOMContentLoaded', () => {
    const statusIcons = {
        '1': ["ri-close-large-fill", "bold-red"],       // Cancelado
        '2': ["ri-history-fill", "bold-orange"],           // Pago a Confirmar
        '3': ["ri-checkbox-circle-line", "bold-green"],           // Pago Confirmado
        '4': ["ri-history-fill", "bold-orange"],        // Pendiente de Retiro
        '5': ["ri-truck-line", "bolder"],            // Preparando Envío
        '6': ["ri-map-pin-time-line", "bolder"],            // En Camino
        '7': ["ri-check-line", "bold-green"],      // Completado (Devolución)
        '8': ["ri-arrow-left-circle-line", "bold-red"],  // Devolución
        '9': ["ri-close-large-fill", "bold-red"]        // Rechazado
    };
    const iconsStatus = document.querySelectorAll('.icon-status');
    iconsStatus.forEach((icon) => {
        const statusId = icon.dataset.index;
        const [iconClass, colorClass] = statusIcons[statusId];
        icon.classList.add(iconClass, colorClass);
    });


    const form = document.getElementById('update-images-wsp');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            openAlert('xddd');
        });

        initInputImage(form)
    }

    // para usar con handle form await uploadImages()
});
