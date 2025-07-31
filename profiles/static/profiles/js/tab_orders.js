





function tabTableOrder(container) {

    const title = document.createElement("h1");
    title.classList.add('bold-main', 'mt-1', 'mb-2', 'font-xxl');
    title.innerHTML = `Lista de Pedidos`;
    container.appendChild(title);

    const table = document.createElement("div");
    table.classList.add('d-grid', 'cont-table-orders', 'bolder', 'font-md', 'text-secondary');
    table.id = 'table-order-header';

    table.innerHTML = /*html*/`
        <div class="text-center">Orden</div>
        <div class="text-start d-desktop-block">Fecha</div>
        <div class="text-center">Estado</div>
        <div class="text-center">Resumen</div>
        <div class="text-start d-desktop-block">Factura</div>
    `;
    container.appendChild(table);

    const tableOrders = document.createElement("div");
    tableOrders.classList.add('d-grid', 'cont-table-orders', 'mt-2', 'font-md', 'text-secondary');
    tableOrders.id = 'table-order';
    container.appendChild(tableOrders);

    const tableEmpty = document.createElement("div");
    tableEmpty.classList.add('d-grid', 'cont-table-orders', 'bolder', 'font-md', 'text-secondary');
    tableEmpty.id = 'table-order-empty';
    tableEmpty.innerHTML = /*html*/`
        <h3 class="grid-col-all mt-1 text-break font-lg">Todavía no realizaste ninguna orden.</h3>
        <h4 class="grid-col-all text-break font-md">Mira nuestros productos:</h4>
        <div class="grid-col-all justify-self-center">
            <a href="{% url 'product_list' %}" class="w-min text-truncate btn btn-main gap-2 px-2 py-1">
                <i class="ri-shopping-cart-2-line font-lg"></i>
                <span class="bolder font-md">Todos los Productos</span>
            </a>
        </div>
    `;
    container.appendChild(tableEmpty);
}

function createTableOrders(container, orders, isAdmin) {

    if (!container._InitBase) {
        tabTableOrder(container);
        container._InitBase = true;
    }
    
    const tableHeader = container.querySelector('#table-order-header');
    const tableEmpty = container.querySelector('#table-order-empty');

    const hasOrders = orders.length > 0;
    tableHeader.style.display = hasOrders ? 'grid' : 'none';
    tableEmpty.style.display = hasOrders ? 'none' : 'grid';
    
    const tableMain = container.querySelector('#table-order');
    if (!tableMain) {
        console.error('tableMain no encontrado');
        return;
    }
    tableMain.innerHTML = ''

    orders.forEach(ord => {
        const order = deepEscape(ord);
        const url = window.TEMPLATE_URLS.orderDetail.replace('{order_id}', `${order.id}`)
        const dateFormat = shortDate(`${order.created_at}`)

        // {{ order.created_at|short_date }}
        const cardHTML = /*html*/`
            <a class="text-center row-order bold-main underline-anim" 
                href="${url}"># ${order.id}
            </a>
            <div class="text-start row-order bolder d-desktop-block">${dateFormat}</div>
            <div class="text-center row-order bold-orange text-truncate">${order.status__name}</div>
            <div class="text-center row-order bolder">$ ${order.total}</div>
            <a class="text-start row-order bold-main underline-anim d-desktop-block" href="${url}">
                Ver Orden
            </a>
        `;

        tableMain.insertAdjacentHTML('beforeend', cardHTML);
    });
}