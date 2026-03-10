# Calorie Tracker Pro - Backend

Express.js + PostgreSQL backend для приложения Calorie Tracker Pro.

## Запуск через Docker (рекомендуется)

```bash
docker compose up -d
```

Бэкенд будет доступен на `http://localhost:3001`. Миграции выполняются автоматически при старте.

## Локальная установка

```bash
npm install
```

Скопируйте `.env.example` в `.env` и настройте `DATABASE_URL`. Миграции выполняются автоматически при запуске сервера.

## Запуск

```bash
# Разработка (с автоперезагрузкой)
npm run dev

# Продакшн
npm start
```

## API

### Регистрация
`POST /api/auth/register`

```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79001234567",
  "email": "user@example.com",
  "password": "password123"
}
```

### Вход
`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Профиль (требуется токен)
`GET /api/auth/profile`

Header: `Authorization: Bearer <token>`
