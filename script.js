       let cachedData = null;

        async function loadData() {
            if (cachedData) return cachedData;
            try {
                const response = await fetch('recipes.json');
                cachedData = await response.json();
                return cachedData;
            } catch (error) {
                document.getElementById("recipes-container").innerHTML = "<h3>Ошибка загрузки книги рецептов.</h3>";
                return null;
            }
        }

        // Функция для отображения Главной страницы сайта
                // Функция для отображения Главной страницы с бесконечной лентой всех рецептов
               async function showHome(buttonElement) {
            const headerBlock = document.querySelector('.fixed-top');
            headerBlock.style.position = "absolute"; /* Меняем fixed на absolute, чтобы шапка каталась! */

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            if(buttonElement) buttonElement.classList.add('active');


            const container = document.getElementById("recipes-container");
            
            // 1. Сначала выводим приветствие и кнопку случайного блюда
            container.innerHTML = `
                <div class="recipe-card" style="border-left-color: #2ed573; text-align: center; animation: fadeIn 0.4s ease-out;">
                    <h2 style="border: none; padding: 0;">Добро пожаловать в eda.vkusno! 🍳</h2>
                    <p style="font-size: 18px; color: #57606f; line-height: 1.6;">
                        Не знаете, что приготовить сегодня? Пускай искусственный интеллект сделает выбор за вас! 
                        Нажмите на кнопку ниже, и ИИ выберет случайное блюдо из нашей огромной кулинарной книги.
                    </p>
                    <br>
                    <button onclick="getRandomRecipe()" style="background-color: #ffaf40; color: white; border: none; padding: 15px 35px; font-size: 18px; font-weight: bold; border-radius: 50px; cursor: pointer; box-shadow: 0 6px 20px rgba(255, 175, 64, 0.4); transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎲 Найти случайное блюдо!
                    </button>
                </div>
                <div id="feed-loading" style="text-align: center; color: var(--color-text-muted); margin-top: 20px;">
                    <h3>🤖 ИИ загружает ленту всех рецептов...</h3>
                </div>
            `;

            const headerHeight = headerBlock.offsetHeight;
            container.style.marginTop = (headerHeight + 20) + "px";

            // 2. Загружаем данные для ленты
            const data = await loadData();
            
            // Удаляем надпись загрузки
            const loadingLabel = document.getElementById("feed-loading");
            if (loadingLabel) loadingLabel.remove();
            
            if (!data) return;

            // Названия в ленте в точности как на кнопках
            const categoryTitles = {
                'soups': '🍲 Супы',
                'potatoes': '🥔 Картошка',
                'pizzas': '🍕 Пицца',
                'burgers': '🍔 Бургеры',
                'desserts': '🍦 Десерты',
                'drinks': '🍹 Напитки',
                'salats': '🥗 Салаты',
                'sushi': '🍣 Суши',
            };

            // 3. Перебираем все категории по очереди и добавляем их рецепты в ленту
            const categoriesOrder = ['soups', 'potatoes', 'pizzas', 'burgers', 'desserts', 'drinks', 'salats', 'sushi'];
            
            categoriesOrder.forEach(catKey => {
                if (data[catKey] && data[catKey].length > 0) {
                    // Создаем заголовок секции для конкретной категории
                    const sectionTitle = document.createElement("h2");
                    sectionTitle.style.cssText = "margin: 40px 0 10px 10px; color: var(--color-text-main); font-size: 24px; font-weight: 800; text-align: left; width: 100%;";
                    sectionTitle.innerText = categoryTitles[catKey] || catKey;
                    container.appendChild(sectionTitle);

                    // Добавляем все карточки из этой категории
                    data[catKey].forEach(recipe => {
                        const card = document.createElement("div");
                        card.className = "recipe-card";
                        card.innerHTML = `
                            <h2>${recipe.name}</h2>
                            <div class="ingredients"><strong>Что понадобится:</strong> ${recipe.ingredients}</div>
                            <div class="steps"><strong>Пошаговое руководство от ИИ:</strong><br>${recipe.steps}</div>
                        `;
                        container.appendChild(card);
                    });
                }
            });
        }

        // Алгоритм генерации абсолютно любого случайного рецепта из всех категорий
        // Алгоритм генерации случайного рецепта БЕЗ удаления ленты
        async function getRandomRecipe() {
            const data = await loadData();
            if (!data) return;

            // Собираем вообще все рецепты в один массив
            let allRecipes = [];
            for (let category in data) {
                data[category].forEach(recipe => {
                    recipe.categoryName = category; 
                    allRecipes.push(recipe);
                });
            }

            // Выбираем случайный
            const randomIndex = Math.floor(Math.random() * allRecipes.length);
            const randomRecipe = allRecipes[randomIndex];

            // Словарь для красивого перевода тегов категорий в случайном блюде
            const categoryTitles = {
                'soups': '🍲 Супы',
                'potatoes': '🥔 Картошка',
                'pizzas': '🍕 Пицца',
                'burgers': '🍔 Бургеры',
                'desserts': '🍦 Десерты',
                'drinks': '🍹 Напитки', // <-- Поставили запятую
                'salats': '🥗 Салаты',  // <-- Поставили запятую
                'sushi': '🍣 Суши'
            };
            const prettyCategory = categoryTitles[randomRecipe.categoryName] || randomRecipe.categoryName;

            // Находим блок приветствия (это самая первая карточка в контейнере)
            const container = document.getElementById("recipes-container");
            const welcomeCard = container.querySelector('.recipe-card');

            if (welcomeCard) {
                // Меняем содержимое приветственной карточки, выводя туда рецепт!
                welcomeCard.style.borderLeftColor = "#ffaf40"; // Меняем полоску на оранжевую
                welcomeCard.style.textAlign = "left"; // Выравниваем текст по левому краю
                welcomeCard.innerHTML = `
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="background-color: #ffaf40; color: #fff; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 10px; text-transform: uppercase;">🎲 СЛУЧАЙНОЕ БЛЮДО: ${prettyCategory}</span>
                    </div>
                    <h2 style="margin-top: 10px;">${randomRecipe.name}</h2>
                    <div class="ingredients"><strong>Что понадобится:</strong> ${randomRecipe.ingredients}</div>
                    <div class="steps"><strong>Пошаговое руководство от ИИ:</strong><br>${randomRecipe.steps}</div>
                    <br>
                    <div style="text-align: center;">
                        <button onclick="getRandomRecipe()" style="background-color: #2ed573; color: white; border: none; padding: 12px 30px; font-size: 16px; font-weight: bold; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3); transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🔄 Выбрать другое случайное блюдо
                        </button>
                    </div>
                `;
            }
        }

        // Функция для отображения отдельных категорий при клике на кнопки
        async function showCategory(category, buttonElement) {
            const headerBlock = document.querySelector('.fixed-top');
            headerBlock.style.position = "fixed"; // Оставляем fixed, чтобы меню кнопок не уезжало на вкладках

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            if(buttonElement) buttonElement.classList.add('active');

            const container = document.getElementById("recipes-container");
            container.innerHTML = "<h3>ИИ открывает нужную страницу...</h3>";

            const data = await loadData();
            if (!data) return;

            container.innerHTML = "";
            const recipes = data[category] || [];
            
            recipes.forEach(recipe => {
                const card = document.createElement("div");
                card.className = "recipe-card";
                card.innerHTML = `
                    <h2>${recipe.name}</h2>
                    <div class="ingredients"><strong>Что понадобится:</strong> ${recipe.ingredients}</div>
                    <div class="steps"><strong>Пошаговое руководство от ИИ:</strong><br>${recipe.steps}</div>
                `;
                container.appendChild(card);
            });

            const headerHeight = headerBlock.offsetHeight;
            container.style.marginTop = (headerHeight + 20) + "px";
        }

            container.innerHTML = "";
            const recipes = data[category] || [];
            
            recipes.forEach(recipe => {
                const card = document.createElement("div");
                card.className = "recipe-card";
                  card.innerHTML = `
                    <h2>${recipe.name}</h2>
                    <div class="ingredients"><strong>Что понадобится:</strong> ${recipe.ingredients}</div>
                    <div class="steps"><strong>Пошаговое руководство от ИИ:</strong><br>${recipe.steps}</div>
                `; // <-- Вот здесь добавилась кавычка перед точкой с запятой!
                container.appendChild(card);

            });

            const headerHeight = headerBlock.offsetHeight;
            container.style.marginTop = (headerHeight + 20) + "px"

        }

        // МАТЕМАТИЧЕСКИЙ АЛГОРИТМ ЛЕВЕНШТЕЙНА ДЛЯ ПРОВЕРКИ ОПЕЧАТОК
        function levDistance(s1, s2) {
            s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
            let costs = new Array();
            for (let i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= s2.length; j++) {
                    if (i == 0) costs[j] = j;
                    else {
                        if (j > 0) {
                            let newValue = costs[j - 1];
                            if (s1.charAt(i - 1) != s2.charAt(j - 1))
                                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                            costs[j - 1] = lastValue;
                            lastValue = newValue;
                        }
                    }
                }
                if (i > 0) costs[s2.length] = lastValue;
            }
            return costs[s2.length];
        }

        function isMatch(queryWord, targetText) {
            if (targetText.toLowerCase().includes(queryWord.toLowerCase())) return true;
            const targetWords = targetText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/);
            
            for (let word of targetWords) {
                if (word.length < 4) continue;
                let maxErrors = word.length > 6 ? 2 : 1;
                if (levDistance(queryWord, word) <= maxErrors) return true;
            }
            return false;
        }

        // УМНЫЙ ПОИСК ПО ВСЕМ КАТЕГОРИЯМ (ВКЛЮЧАЯ САЛАТЫ И СУШИ)
        async function handleSearch(query) {
            const clearBtn = document.getElementById("clear-search");
            if (clearBtn) clearBtn.style.display = query.trim() ? "block" : "none";
            const container = document.getElementById("recipes-container");
            
            if (!query.trim()) {
                const activeBtn = document.querySelector('.nav-btn.active');
                if (activeBtn) {
                    activeBtn.click();
                } else {
                    const firstBtn = document.querySelector('.nav-btn');
                    if (firstBtn) firstBtn.click();
                }
                return;
            }

            const data = await loadData();
            if (!data) return;

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            container.innerHTML = "";

            const queryWords = query.trim().split(/\s+/);
            let foundAny = false;

            const categoryTitles = {
                'soups': '🍲 Супы',
                'potatoes': '🥔 Картошка',
                'pizzas': '🍕 Пицца',
                'burgers': '🍔 Бургеры',
                'desserts': '🍦 Десерты',
                'drinks': '🍹 Напитки',
                'salats': '🥗 Салаты',
                'sushi': '🍣 Суши'
            };

            for (let category in data) {
                data[category].forEach(recipe => {
                    let matchAllWords = queryWords.every(qWord => 
                        isMatch(qWord, recipe.name) || isMatch(qWord, recipe.ingredients)
                    );

                    if (matchAllWords) {
                        foundAny = true;
                        const card = document.createElement("div");
                        card.className = "recipe-card";
                        const prettyCat = categoryTitles[category] || category;
                        card.innerHTML = `
                            <span style="background-color: var(--color-primary); color: #fff; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 10px; text-transform: uppercase;">${prettyCat}</span>
                            <h2 style="margin-top: 10px;">${recipe.name}</h2>
                            <div class="ingredients"><strong>Что понадобится:</strong> ${recipe.ingredients}</div>
                            <div class="steps"><strong>Пошаговое руководство от ИИ:</strong><br>${recipe.steps}</div>
                        `;
                        container.appendChild(card);
                    }
                });
            }

            if (!foundAny) {
                container.innerHTML = "<h3 style='text-align: center; color: var(--color-text-muted);'>ИИ ничего не нашёл. Попробуйте изменить запрос.</h3>";
            }
        }

        // ФУНКЦИЯ ОЧИСТКИ ПОЛЯ ПОИСКА И КНОПКА КРЕСТИКА
        function clearSearchField() {
            const input = document.getElementById("search-input");
            const clearBtn = document.getElementById("clear-search");
            
            if (input) input.value = "";
            if (clearBtn) clearBtn.style.display = "none";
            
            const activeBtn = document.querySelector('.nav-btn.active');
            
            if (activeBtn) {
                activeBtn.click();
            } else {
                const firstBtn = document.querySelector('.nav-btn');
                if (firstBtn) firstBtn.click();
            }
        }

        // СТАРТ САЙТА ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
        window.onload = () => {
            const firstBtn = document.querySelector('.nav-btn');
            showHome(firstBtn);
        };
    
