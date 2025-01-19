const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';
const apiKey = '74ca26d4-79b4-484e-a3a8-201b7d84a758';

const ordersContainer = document.getElementById("orders-container");
const deleteModal = document.getElementById("delete-modal");
const viewModal = document.getElementById("modal-view");
const editModal = document.getElementById("edit-modal");
let orders = [];
let orderIdToDelete = null;

function showModal(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.body.appendChild(notification);
}


function loadOrders() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];

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
        const items = Array.isArray(order.items) ? order.items : [];
        const row = document.createElement('tr');

        row.innerHTML = `
        <tbody>
            <tr>
                <td>${index + 1}</td>
                <td>${order.id}</td>
                <td>${items.map(goods => goods.cart).join(', ')}</td>
                <td>${order.total} ₽</td>
                <td>${order.deliveryDate}, ${order.deliveryTime}</td>
                <td>
                    <button onclick="viewOrder(${index})">Просмотр</button>
                    <button onclick="editOrder(${index})">Редактировать</button>
                    <button onclick="openDeleteModal(${index})">Удалить</button>
                </td>
            </tr>
        </tbody>
        `;
        tableBody.appendChild(row);
    });
}

function openDeleteModal(index) {
    orderIdToDelete = index;
    deleteModal.classList.remove('modal-hidden');
    deleteModal.classList.add('modal-show');
}

function viewOrder(index) {
    const order = orders[index];
    document.getElementById('date-order').innerText = order.date;
    document.getElementById('full-name-view').innerText = order.name;
    document.getElementById('phone-view').innerText = order.phone;
    document.getElementById('email-view').innerText = order.email;
    document.getElementById('address-view').innerText = order.address;
    document.getElementById('delivery-date-view').innerText = order.deliveryDate;
    document.getElementById('delivery-time-view').innerText = order.deliveryTime;
    document.getElementById('goods-view').innerHTML = order.items.map(item => `< li > ${item.name}</li > `).join('');
    document.getElementById('goods-price').innerText = `${order.total} ₽`;
    document.getElementById('comment-view').innerText = order.comment;

    openModal(viewModal);
}



function confirmDeleteOrder() {
    if (orderIdToDelete !== null) {
        orders = orders.filter(order => order.id !== orderIdToDelete);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        closeModal(deleteModal);
        showModal('Заказ успешно удален');
        orderIdToDelete = null;
    }
}

function openModal(modal) {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('modal-show');
    modal.classList.add('modal-hidden');
}





document.addEventListener('DOMContentLoaded', loadOrders);
