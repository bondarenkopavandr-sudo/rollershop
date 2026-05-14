# RollerShop: хостинг через GitHub Pages

## 1) Подготовка репозитория на GitHub

1. Зайди на [https://github.com](https://github.com) и нажми `New repository`.
2. Назови репозиторий, например: `rollershop`.
3. Нажми `Create repository`.

## 2) Инициализация git в папке проекта

Открой терминал в папке проекта и выполни:

```bash
git init
git add .
git commit -m "Initial RollerShop site"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/rollershop.git
git push -u origin main
```

Если git попросит имя и почту:

```bash
git config --global user.name "Твое Имя"
git config --global user.email "you@example.com"
```

## 3) Включение GitHub Pages

1. Открой репозиторий на GitHub.
2. Перейди в `Settings` -> `Pages`.
3. В блоке `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Нажми `Save`.

Через 1-3 минуты появится ссылка вида:

`https://ТВОЙ_ЛОГИН.github.io/rollershop/`

## 4) Обновление сайта после изменений

После любых правок делай:

```bash
git add .
git commit -m "Update site content"
git push
```

GitHub Pages автоматически обновит сайт.

## 5) Картинки товаров (важно)

1. Создай папку `images` в корне проекта.
2. Положи туда файлы, например: `images/yashik.jpg`.
3. В `script.js` у товара добавь:

```js
image: "images/yashik.jpg",
```

## 6) Чат с OpenAI на GitHub Pages

Сайт на GitHub Pages статический, поэтому:

- можно использовать чат с вводом API-ключа прямо в интерфейсе;
- ключ хранится только в `sessionStorage` текущей вкладки браузера;
- на публичном сайте это подходит только для личного теста.

Для продакшена лучше вынести OpenAI-вызов в backend (Cloudflare Workers, Vercel Functions и т.д.) и не хранить ключ в браузере.
