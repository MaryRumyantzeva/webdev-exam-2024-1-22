const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';
const apiKey = '74ca26d4-79b4-484e-a3a8-201b7d84a758';

const ordersContainer = document.getElementById("orders-container");
const deleteModal = document.getElementById("delete-modal");
const viewModal = document.getElementById("modal-view");
const editModal = document.getElementById("edit-modal");
let orders = [];
let orderIdToDelete = null;

// function showModal(message, type) {
//     const notification = document.createElement('div');
//     notification.className = `notification ${type}`;
//     notification.innerText = message;
//     document.body.appendChild(notification);
// }
function showModal(message) {
    const modal = document.getElementById("modal");
    const modalText = document.getElementById("modal-text");
    modalText.textContent = message;
    modal.classList.remove("hidden");
}
document.getElementById("modal-ok").addEventListener("click", () => {
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");
});

function loadOrders() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach((order, index) => {
        order.id = index;
    })

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>У вас нет заказов.</p>';
        return;
    }

    ordersContainer.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('order-card');
    table.innerHTML = `
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата оформления</th>
                    <th>Состав заказа</th>
                    <th>Стоимость</th>
                    <th>Доставка</th>
                    <th>  </th>
                </tr>
            </thead>
            <tbody id="orders-table-body"></tbody>
            `;
    ordersContainer.appendChild(table);

    const tableBody = document.getElementById('orders-table-body');

    orders.forEach((order, index) => {
        const items = order.goods;
        const row = document.createElement('tr');
        const createdAt = new Date(order.createdAt)
        row.innerHTML = `
        <tbody>
            <tr>
                <td>${index + 1}</td>
                <td>${createdAt.toLocaleString()}</td>
                <td>${items.map(good => good.name).join('<br><br>')}</td>
                <td>${order.total} ₽</td>
                <td>${order.deliveryDate}, ${order.deliveryTime}</td>
                <td>
                    <button id="vieworder${index}">Просмотр</button>
                    <button id="editorder${index}">Редактировать</button>
                    <button id="deleteorder${index}">Удалить</button>
                </td>
            </tr>
        </tbody>
        `;
        tableBody.appendChild(row);
        const viewButton = document.querySelector(`#vieworder${index}`);
        const editbutton = document.querySelector(`#editorder${index}`);
        const deletebutton = document.querySelector(`#deleteorder${index}`);
        viewButton.addEventListener('click', () => viewOrder(index));
        editbutton.addEventListener('click', () => editOrder(index));
        deletebutton.addEventListener('click', () => openDeleteModal(index));
    });
    const closeViewModalButton = document.querySelector('#modal-view').querySelector('.close-button');
    closeViewModalButton.addEventListener('click', () => closeModal('modal-view'));

    const closeEditModalButton = document.querySelector('#edit-modal').querySelector('.close-button');
    closeEditModalButton.addEventListener('click', () => closeModal('modal-view'));
}

function openDeleteModal(index) {
    orderIdToDelete = index;
    deleteModal.classList.remove('modal-hidden');
    deleteModal.classList.add('modal-show');
}

function viewOrder(index) {
    const order = orders[index];
    const createdAt = new Date(order.createdAt)
    document.getElementById('date-order').innerText = createdAt.toLocaleString();
    document.getElementById('full-name-view').innerText = order.fullName;
    document.getElementById('phone-view').innerText = order.phone;
    document.getElementById('email-view').innerText = order.email;
    document.getElementById('address-view').innerText = order.deliveryAddress;
    document.getElementById('delivery-date-view').innerText = order.deliveryDate;
    document.getElementById('delivery-time-view').innerText = order.deliveryTime;
    document.getElementById('goods-view').innerHTML = order.goods.map(good => good.name).join('<br><br>');
    document.getElementById('goods-price').innerText = `${order.total} ₽`;
    document.getElementById('comment-view').innerText = order.comment;

    openModal(viewModal);
}



function confirmDeleteOrder() {
    if (orderIdToDelete !== null) {
        // orders = orders.filter(order => order.id !== orderIdToDelete);
        orders = orders.filter((order, index) => index !== orderIdToDelete);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        // closeModal(deleteModal);
        closeModal('delete-modal');
        showModal('Заказ успешно удален');
        orderIdToDelete = null;
    }

    const form = document.forms[0];
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");

        showModal("Заказ успешно оформлен");
        updateCartPage();
        return;
    })
}

function openModal(modal) {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('modal-show');
        modal.classList.add('modal-hidden');
    } else {
        console.error(`Modal with id ${modalId} not found`);
    }
}

function editOrder(orderId) {
    console.log(JSON.parse(localStorage.getItem('orders')));
    const ordersID = orders.find(o => {
        return o.id === orderId
    });
    if (!ordersID) {
        console.error(`Order with ID ${orderId} not found`);
        return;
    }
    const order = orders[orderId];
    const createdAt = new Date(order.createdAt)
    document.getElementById('date-order').disabled = true;
    document.getElementById('date-order').innerHTML = createdAt.toLocaleString();
    document.getElementById('full-name-edit').value = order.fullName;
    document.getElementById('phone-edit').value = order.phone;
    document.getElementById('email-edit').value = order.email;
    document.getElementById('address-edit').value = order.deliveryAddress;
    document.getElementById('delivery-date-edit').value = order.deliveryDate;
    document.getElementById('delivery-time-edit').value = order.deliveryTime;
    document.getElementById('goods-view').value = order.goods.map(good => good.name).join('<br><br>');
    document.getElementById('goods-price').value = `${order.total} ₽`;
    document.getElementById('comment-edit').value = order.comment;

    // Заполнение товаров в заказе
    const goodsView = document.getElementById('goods-view');
    goodsView.innerHTML = order.goods.map(good => `<li>${good.name}</li>`).join('');

    // Обработчик сохранения изменений
    const form = document.getElementById('edit-form');
    form.onsubmit = function (event) {
        event.preventDefault();

        // Обновление данных заказа
        order.fullName = document.getElementById('full-name-edit').value;
        order.phone = document.getElementById('phone-edit').value;
        order.email = document.getElementById('email-edit').value;
        order.deliveryAddress = document.getElementById('address-edit').value;
        order.deliveryDate = document.getElementById('delivery-date-edit').value;
        order.deliveryTime = document.getElementById('delivery-time-edit').value;
        order.comment = document.getElementById('comment-edit').value;

        // Сохранение изменений
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        closeModal('edit-modal');
    };

    openModal(editModal);
}


document.addEventListener('DOMContentLoaded', loadOrders);
