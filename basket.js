function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    return JSON.parse(savedCart)
}

function totalSummary(cart) {
    cart ??= [];
    const totalSum = cart.reduce((sum, currentGood) => sum + (currentGood.discount_price ?? currentGood.actual_price), 0)
    return totalSum
}

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


export function renderGoods(goods) {
    const categoryContainer = document.querySelector('.cata-log');
    categoryContainer.innerHTML = '';

    const goodsToShow = goods.slice(0, currentDisplayedGoods);
    goodsToShow.forEach((good) => {
        const goodDiv = document.createElement('div');
        goodDiv.classList.add('good');
        const discountPercentage = good.discount_price
            ? Math.round(((good.actual_price - good.discount_price) / good.actual_price) * 100)
            : null;

        goodDiv.innerHTML = `
            <img src="${good.image_url}" alt="${good.name}" class="good-img">
            <div class="good-content">
                <p class="good-title">${good.name}</p>
                <p class="good-rating">
                    ${good.rating}
                    <span class="rating-stars" data-rating="${good.rating}"></span>
                </p>
                <p class="good-price">
                    ${good.discount_price ? `<span class="striked-price">${good.actual_price}₽</span>` : `${good.actual_price}₽`}
                    ${good.discount_price
                ? `<span class="discount-percentage" style="color: red;">-${discountPercentage}%</span>` : ''}
                </p>
                ${good.discount_price ? `<p class="discount-price">${good.discount_price}₽</p>` : ''}
                <button class="add-button" data-id="${good.id}">Добавить</button>
            </div>
        `;

        categoryContainer.appendChild(goodDiv);
    });

    document.querySelectorAll('.add-button').forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const good = goods.find((g) => g.id === id);
            addToCart(good);
        });
    });


}

function updateCartPage() {
    const cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = '';
    const cart = loadCartFromLocalStorage();

    if (Object.keys(cart ?? {}).length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
    } else {
        Object.values(cart).forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            const goodDiv = document.createElement('div');
            goodDiv.classList.add('good');
            const discountPercentage = item.discount_price
                ? Math.round(((item.actual_price - item.discount_price) / item.actual_price) * 100)
                : null;
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                <img src="${item.image_url}" alt="${item.name}" class="good-img">
                <div class="good-content">
                    <p class="good-title">${item.name}</p>
                    <p class="good-rating">
                    ${item.rating}
                    <span class="rating-stars" data-rating="${item.rating}"></span>
                </p>
                    <p class="good-price">
                    ${item.discount_price ? `<span class="striked-price">${item.actual_price}₽</span>` : `${item.actual_price}₽`}
                    ${item.discount_price
                    ? `<span class="discount-percentage" style="color: red;">-${discountPercentage}%</span>` : ''}
                </p>
                    ${item.discount_price ? `<p class="discount-price">${item.discount_price}₽</p>` : ''}
                
                <button class="remove-item" data-id="${item.id}">Удалить</button>
                </div>
                </div>
            `;
            cartContainer.appendChild(itemDiv);
        });

        document.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = Number(event.target.dataset.id);
                const newCart = cart.filter(good => good.id !== id);
                localStorage.setItem('cart', JSON.stringify(newCart));
                updateDeliveryPrice();
                updateCartPage();
            });
        });

        function updateStars() {
            document.querySelectorAll('.rating-stars').forEach(starContainer => {
                const rating = parseFloat(starContainer.dataset.rating);
                starContainer.innerHTML = '';

                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    if (i <= Math.floor(rating)) {
                        star.classList.add('bi', 'bi-star-fill'); // Закрашенная звезда
                    } else if (i - rating < 1) {
                        star.classList.add('bi', 'bi-star-half'); // Полузакрашенная звезда
                    } else {
                        star.classList.add('bi', 'bi-star'); // Пустая звезда
                    }
                    starContainer.appendChild(star);
                }
            });
        }
        updateStars();
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

const dateInput = document.querySelector('#date');
const timeOfTheDayInput = document.querySelector('#delivery-time');

function updateDeliveryPrice() {
    const cart = loadCartFromLocalStorage();

    const totalContainer = document.querySelector('.cart-total');

    const date = dateInput.value;
    const timeOfTheDay = timeOfTheDayInput.value;
    let deliveryPrice = 200;
    const year = date.slice(0, date.indexOf('-'));
    const month = date.slice(year.length + 1, year.length + 3);
    const day = date.slice(year.length + month.length + 2);

    const dateObj = new Date(year, month - 1, day);
    const isTodayAWorkingDay = dateObj.getDay() >= 1 && dateObj.getDay() < 6;
    const isPastSix = Number(timeOfTheDay.slice(0, timeOfTheDay.indexOf('-'))) >= 18;

    const areInputsComplete = (year && month && day && timeOfTheDay) || false;

    if (isTodayAWorkingDay && isPastSix) {
        deliveryPrice += 200
    }
    if (!isTodayAWorkingDay) {
        deliveryPrice += 300
    }
    if (!areInputsComplete) {
        deliveryPrice = 200
    }

    totalContainer.innerHTML = `
        <p class="totalContainerSum">Итоговая стоимость: ${totalSummary(cart) + deliveryPrice}₽</p><br>
        <p class="totalContainerDelivery">(Стоимость доставки: ${deliveryPrice}₽)</p>
    `;
}

dateInput.addEventListener('change', (event) => {
    updateDeliveryPrice()
})
timeOfTheDayInput.addEventListener('change', (event) => {
    updateDeliveryPrice()
})

function saveOrder(order) {
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
}


document.getElementById('submitbutton').addEventListener('click', (event) => {
    event.preventDefault();

    const cart = loadCartFromLocalStorage();
    if (!cart || cart.length === 0) {
        alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
        return;
    }

    const fullName = document.querySelector('#name').value;
    const phone = document.querySelector('#phone').value;
    const email = document.querySelector('#email').value;
    const deliveryAddress = document.querySelector('#address').value;
    const deliveryDate = document.querySelector('#date').value;
    const deliveryTime = document.querySelector('#delivery-time').value;
    const comment = document.querySelector('#comment').value;

    if (!fullName || !phone || !email || !deliveryAddress || !deliveryDate || !deliveryTime) {
        showModal("Заполните все поля!");
        return;
    }

    const order = {
        fullName,
        phone,
        email,
        deliveryAddress,
        deliveryDate,
        deliveryTime,
        comment,
        goods: cart,
        total: totalSummary(cart),
        createdAt: new Date(),
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    localStorage.removeItem('cart');  //?
    updateCartPage();

    showModal("Заказ успешно оформлен");
});

document.getElementById('resetbutton').addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('cart');


    document.querySelector('form').reset();
    const cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = `

        <p>Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>
    `;
    const totalContainer = document.querySelector('.cart-total');
    totalContainer.innerHTML = `
        <p class="totalContainerSum">Итоговая стоимость: 0₽</p>
    `;
    showModal("Заказ успешно удалён");
    updateCartPage();
});



updateCartPage();
updateDeliveryPrice();


