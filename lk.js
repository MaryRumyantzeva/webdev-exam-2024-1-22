const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=74ca26d4-79b4-484e-a3a8-201b7d84a758';
const apiKey = '74ca26d4-79b4-484e-a3a8-201b7d84a758';
const ordersContainer = document.getElementById("orders-container");
let orders = [];

function renderOrder(orders) {
    
    ordersContainer.innerHTML = "";
    for (const order of orders) {
        // Загрузка товаров
        const goodsPromises = order.good_ids.map(id =>
            fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=apiKey`)
                .then(response => response.json())
                .catch(err => {
                    console.error("Ошибка получения информации о товаре:", err);
                    return { actual_price: 0, discount_price: 0 };
                })
        );
    }
}

function closeModal() {
    modal.classList.remove("show");

    editModal.classList.remove("show");
    modal.classList.add("hidden");
    editModal.classList.add("hidden");

    overlay.classList.remove("overlay-show");
    overlay.classList.add("hidden");
}

function confirmDeleteOrder(orderId) {
    orderIdToDelete = orderId; // Запоминаем ID заказа
    const deleteModal = document.getElementById("delete-modal");
    deleteModal.classList.remove("hidden");
    deleteModal.classList.add("show");
    overlay.classList.add("overlay-show");
    overlay.classList.remove("hidden");
}