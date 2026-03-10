# Calorie Tracker Pro

Fullstack веб-приложение для учёта калорий, управления питанием и здоровым образом жизни.

## Стек

- **Frontend:** React 19, Vite 7, React Router
- **Backend:** Node.js, Express, PostgreSQL
- **Инфраструктура:** Docker, Docker Compose

---

## Быстрый старт

### Вариант 1: С Docker (рекомендуется)

**Требования:** Docker и Docker Compose

1. **Запустить PostgreSQL и Backend:**
   ```bash
   cd Backend
   docker-compose up -d
   ```

2. **Запустить Frontend:**
   ```bash
   cd "Front end"
   npm install
   npm run dev
   ```

3. Открыть в браузере: **http://localhost:5173**

---

### Вариант 2: Без Docker

**Требования:** Node.js 18+, PostgreSQL 14+

1. **Создать базу данных:**
   ```bash
   # В psql или pgAdmin
   CREATE DATABASE calorie_tracker;
   ```

2. **Backend:**
   ```bash
   cd Backend
   cp .env.example .env
   # Отредактировать .env: DATABASE_URL, JWT_SECRET
   npm install
   npm run dev
   ```

3. **Frontend** (в новом терминале):
   ```bash
   cd "Front end"
   npm install
   npm run dev
   ```

4. Открыть: **http://localhost:5173**

---

## Переменные окружения

### Backend (.env)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт сервера | `3001` |
| `DATABASE_URL` | Подключение к PostgreSQL | `postgresql://postgres:postgres@localhost:5432/calorie_tracker` |
| `JWT_SECRET` | Секрет для JWT | Любая случайная строка |
| `FRONTEND_URL` | CORS: разрешённый origin | `http://localhost:5173` |

### Frontend (опционально)

Создать `.env` в папке `Front end` при необходимости:

```
VITE_API_URL=http://localhost:3001/api
```

---

## Портa

| Сервис | Порт |
|--------|------|
| Frontend (Vite) | 5173 |
| Backend API | 3001 |
| PostgreSQL | 5432 |

---

## Структура проекта

```
Diplomka/
├── Backend/          # Express API + PostgreSQL
│   ├── src/
│   ├── database/
│   └── docker-compose.yml
├── Front end/        # React SPA
│   └── src/
└── README.md
```

---

## Тестовые данные

- **Тестовая карта для оплаты:** `4242 4242 4242 4242`
- **Валюта:** тенге (₸)

---

## Команды

| Команда | Где | Описание |
|---------|-----|----------|
| `npm run dev` | Backend | Запуск API с hot-reload |
| `npm start` | Backend | Запуск API (production) |
| `npm run dev` | Front end | Запуск dev-сервера |
| `npm run build` | Front end | Сборка для production |
| `docker-compose up -d` | Backend | Запуск PostgreSQL + Backend в Docker |
