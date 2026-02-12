# Деплой Order Desk на Railway

Пошаговая инструкция по развёртыванию приложения на Railway.

## Важно: Supabase обязателен

На Railway хранилище файлов **эфемерное** — при каждом перезапуске `data/` и `exports/` удаляются. Поэтому для production **обязательно** используйте Supabase.

---

## Шаг 1: Создайте проект на Railway

1. Зайдите на [railway.app](https://railway.app) и войдите (GitHub).
2. Нажмите **New Project** → **Deploy from GitHub repo**.
3. Выберите репозиторий с Order Desk.
4. Railway подхватит проект и начнёт сборку.

---

## Шаг 2: Переменные окружения

В **Variables** добавьте:

| Переменная | Описание |
|------------|----------|
| `PORT` | Обычно задаётся Railway автоматически, можно не трогать |
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key из Supabase → Settings → API |
| `OPENAI_API_KEY` | (опционально) Для AI-парсинга заказов |

---

## Шаг 3: Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В **SQL Editor** выполните скрипт из `supabase/schema.sql`.
3. Возьмите URL и service role key в **Settings → API**.

---

## Шаг 4: Домен

1. В настройках сервиса Railway откройте **Settings**.
2. В разделе **Networking** нажмите **Generate Domain**.
3. Появится URL вида `https://your-app.up.railway.app`.

---

## Шаг 5: Сборка и деплой

Railway использует **Dockerfile** в корне проекта (если он есть) или **Nixpacks**.

- **С Dockerfile** — устанавливаются зависимости для Puppeteer и PDF.
- **Без Dockerfile** — используется стандартная Node.js-сборка (Puppeteer может не работать).

При первом пуше в GitHub Railway запустит сборку и деплой автоматически.

---

## Шаг 6: Проверка

1. Откройте `https://your-app.up.railway.app`.
2. Войдите в приложение.
3. Создайте тестовый заказ.
4. Сгенерируйте Florist PDF (Reports → Download Florist PDF).

Если PDF не отдаётся:
- Убедитесь, что используется Dockerfile.
- Проверьте логи в Railway → **Deployments** → **View Logs**.

---

## Структура проекта

```
buildCommand:  npm install && npm run build
                (или Dockerfile)
startCommand:  npm start
```

---

## Полезные ссылки

- [Railway Docs](https://docs.railway.app/)
- [Supabase](https://supabase.com)
- [Schema SQL](supabase/schema.sql)
