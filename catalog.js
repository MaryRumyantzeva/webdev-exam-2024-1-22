const apiUrl = 'http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=74ca26d4-79b4-484e-a3a8-201b7d84a758';
const apiKey = '74ca26d4-79b4-484e-a3a8-201b7d84a758';

let allGoods = []; // Сохраняем все товары для фильтрации

function getCategoriesFromGoods(goods) {
    const categoriesWithSubCategories = goods.reduce((prev, current) => {
        prev[current.main_category] ??= [];
        if (prev[current.main_category].indexOf(current.sub_category) < 0) {
            prev[current.main_category].push(current.sub_category);
        }
        return prev;
    }, {});
    return categoriesWithSubCategories;
}

function renderThings(goods) {
    const catalogContainer = document.querySelector('div.cata-log');
    catalogContainer.innerHTML = ''; // Очищаем старые товары

    goods.forEach((good) => {
        const goodDiv = document.createElement('div');
        goodDiv.classList.add('good');
        goodDiv.innerHTML = `
            <img src="${good.image_url}" alt="${good.name}" class="good-img"/>
            <div class="good-content">
                <p class="good-title">${good.name}</p>
                <p class="good-rating">
                    ${good.rating}
                    <span class="rating-stars" data-rating="${good.rating}"></span>
                </p>
                <p class="good-price">${good.actual_price}₽</p>
                <p class="discount-price">${good.discount_price ? good.discount_price + '₽' : ''}</p>
                <button class="add-button">Добавить</button>
            </div>
        `;
        catalogContainer.appendChild(goodDiv);
    });

    updateStars();
}

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

function filterGoods() {
    let filteredGoods = [...allGoods]; // Начинаем с копии всех товаров

    // Фильтрация по категории
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.value);
    if (selectedCategories.length) {
        filteredGoods = filteredGoods.filter(good => selectedCategories.includes(good.main_category));
    }

    // Фильтрация по цене
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    filteredGoods = filteredGoods.filter(good => good.actual_price >= minPrice && good.actual_price <= maxPrice);

    // Фильтрация по скидке
    const discountOnly = document.getElementById('discount-only').checked;
    if (discountOnly) {
        filteredGoods = filteredGoods.filter(good => good.discount_price);
    }

    renderThings(filteredGoods);
}

function loadThings() {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network error!');
            }
            return response.json();
        })
        .then(goods => {
            allGoods = goods; // Сохраняем все товары
            const categories = getCategoriesFromGoods(goods);

            // Добавляем категории в сайдбар
            const categoriesList = document.getElementById('categories-list');
            for (const category in categories) {
                const categoryLabel = document.createElement('label');
                categoryLabel.innerHTML = `<input type="checkbox" name="category" value="${category}"> ${category}`;
                categoriesList.appendChild(categoryLabel);
            }

            // Отображаем все товары
            renderThings(goods);

            // Применение фильтров
            document.getElementById('apply-filters').addEventListener('click', filterGoods);
        })
        .catch(error => {
            console.error('Ошибка! ', error);
        });
}
