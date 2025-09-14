# Хлопоты — PWA для домашних дел

Лёгкое PWA‑приложение для ведения домашних дел, мотивации и учёта очков между участниками домохозяйства. Поддерживает офлайн‑режим, пуш‑уведомления и работу на iOS/Android через установку как веб‑приложение.

Демо/прод: https://hlopoty.netlify.app

## Технологии

### Бэкенд
- Supabase (Postgres/Auth/Realtime) — БД, JWT‑аутентификация, подписки на изменения; политики RLS для изоляции по домохозяйствам.
- Netlify Functions — серверлесс‑эндпойнты (Node, esbuild) для пушей, подписок и безопасных операций с сервисной ролью.
- Web Push (VAPID) — отправка уведомлений из функций; данные подписок хранятся в БД.

### Фронтенд
- React + TypeScript + Vite — SPA на хуках, быстрая сборка и HMR.
- React Router (hash‑based) — маршрутизация, дружелюбная к статическому хостингу/PWA.
- Tailwind CSS + PostCSS — utility‑стили, иконки как React‑компоненты (SVG).
- PWA: vite-plugin-pwa + Workbox — кэширование и кастомный сервис‑воркер (`src/sw.js`) с обработкой push.
- IndexedDB (Dexie) — локальный кэш и офлайн‑сценарии.

## Архитектура и техническое описание

**Общая архитектура**
- SPA на React/TypeScript с hash‑маршрутизацией; PWA со своим сервис‑воркером.
- Бэкенд: Supabase (Postgres/Auth/Realtime) + серверлесс‑функции Netlify под сервисную роль.
- Основные данные — таблица `public.entries` (task/reward/penalty) с дробными очками; в UI суммарные балансы округляются до целых.

**Бэкенд (Supabase)**
- PostgreSQL с RLS; клиент `@supabase/supabase-js` используется для CRUD, аутентификации (JWT) и realtime‑подписок.
- Realtime: подписка на изменения `entries` по `household_id`; суммы на Home пересчитываются инкрементально.
- Политики RLS ограничивают доступ данными домохозяйства; операции, требующие обхода RLS (каскадная чистка коэффициентов при удалении комнаты), вынесены в функции с сервисной ролью.

**Серверлесс‑функции (Netlify)**
- `pushSubscribe` / `pushUnsubscribe` — управление подписками на веб‑пуш (проверка JWT, связь с `profile_id`).
- `notifyEvent` — формирование текста уведомлений по сценариям (добавление/редактирование/удаление записей; редактирование дел/наказаний) и рассылка через `web-push`.
- `pushNotify` — служебная рассылка по списку профилей.
- `deleteRoom` — удаление комнаты с сервисной ролью: чистит `chores.coefficient_dict` в рамках household и удаляет запись в `rooms` (проверяет, что вызывающий — член household по JWT).

**Пуш‑уведомления**
- Регистрация и хранение подписки — `src/lib/push.ts` + функция `pushSubscribe`.
- Отправка — из функций `notifyEvent`/`pushNotify` через `web-push` (VAPID).
- Показ/клик — `src/sw.js`: `showNotification` и переход по `data.url` (History/EditEntry/EditTask/EditPunishment).
- iOS‑учёт: заголовок/тело разделены, чтобы избежать лишнего жирного заголовка.

**Фронтенд**
- Маршрутизация: React Router (hash‑based), пути объявлены в `src/main.tsx`.
- Стили: Tailwind CSS + PostCSS; иконки — SVG React‑компоненты в `src/icons`.
- Расчёт очков: `ChooseRooms` допускает дробные коэффициенты; `History` и `ChooseRooms: Итого` показывают округлённые значения; `Home` отображает округлённые балансы и определяет лидера по округлению.

**Безопасность**
- Клиентские операции — под RLS и JWT; функции с сервисной ролью дополнительно проверяют принадлежность household по токену, прежде чем выполнять привилегированные действия.

**Сборка и деплой**
- Продакшн: https://hlopoty.netlify.app
- Сборка: Vite, публикация `dist/`; функции — в `netlify/functions` (esbuild). Env‑переменные разделены для фронта и функций (см. ниже).

## Старт локально

Предусловия: Node 18+, npm 9+, проект Supabase (URL/ключи), VAPID‑ключи.

1) Установить зависимости

```bash
npm install
```

2) Настроить переменные окружения фронтенда (создать `.env`)

```env
VITE_SUPABASE_URL=...            # URL проекта Supabase
VITE_SUPABASE_ANON_KEY=...       # Anon key для клиента
VITE_VAPID_PUBLIC_KEY=...        # Публичный VAPID ключ (Base64 URL‑safe)
```

3) Запустить дев‑сервер

```bash
npm run dev
```

Приложение доступно на http://localhost:5173. Для теста пушей нужен HTTPS/хостинг (используется Netlify: https://hlopoty.netlify.app).

## Деплой на Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Функции: `netlify/functions` (см. `netlify.toml`)

Переменные окружения (Site settings → Environment variables):

Frontend (build/runtime)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`
- `PWA_NAME` (опционально; префикс для уведомлений)

Functions (server, не коммитить в репозиторий)
- `SUPABASE_URL` — тот же URL
- `SUPABASE_SERVICE_ROLE` — сервисный ключ (секрет)
- `VAPID_PUBLIC_KEY` — публичный ключ
- `VAPID_PRIVATE_KEY` — приватный ключ
- `VAPID_SUBJECT` — `mailto:you@example.com`

## Пуш‑уведомления

- Клиент регистрирует подписку (`src/lib/push.ts`), сохраняет её через функцию `pushSubscribe`.
- Отправка уведомлений — из функций (`notifyEvent.js`, `pushNotify.js`) через `web-push`.
- Сервис‑воркер (`src/sw.js`) показывает уведомление и переходит по `data.url` при клике.
- Для iOS заголовок/тело уведомления разделены, чтобы избежать жирного дублирования названия приложения.

## Работа с данными

- Основные записи — таблица `public.entries` (очковое событие: task/reward/penalty). Очки могут быть дробными; суммарные балансы в UI отображаются округлёнными.
- Realtime‑каналы Supabase используются для живого пересчёта на главном экране.
- Некоторые операции выполняются через функцию `deleteRoom` на Netlify с сервисной ролью (чистит ссылки в `chores.coefficient_dict` и удаляет комнату).

## Скрипты

- `npm run dev` — дев‑сервер Vite
- `npm run build` — сборка продакшн бандла + сервис‑воркер
- `npm run preview` — предпросмотр собранного бандла

## Структура

- `src/pages/*` — страницы приложения (Home, History, Settings и т.д.)
- `src/components/*` — UI‑компоненты
- `src/icons/*` — SVG‑иконки как React‑компоненты
- `src/lib/*` — вспомогательные модули (Supabase, push и т.п.)
- `netlify/functions/*` — серверлесс‑функции (push, notify, deleteRoom)
- `vite.config.ts` — конфигурация Vite и PWA
- `src/sw.js` — сервис‑воркер (Workbox + обработчики событий)

## Примечания

- Для корректной работы RLS в Supabase убедитесь, что политики допускают чтение/запись только в пределах household. Привилегированные действия выносятся в функции с сервисной ролью и проверкой JWT.
- Для пушей на iOS/Android устройство должно предоставить разрешение и быть в онлайне хотя бы раз после установки.

---

Вопросы и улучшения приветствуются. Приятной работы!
