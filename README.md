# 🌤 Weather Telegram Mini App

Погодный Telegram-бот и Mini App: текущая погода, 24 часа прогноза, 7 дней, поиск городов и геолокация. Русский и английский интерфейс, тема Telegram, сохранение города, обновление и обработка сетевых ошибок.

[Открыть приложение](https://kamil-weather.hackernet340.chatgpt.site) · [Telegram-бот](https://t.me/pokeint_bot)

## Стек

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, Telegram Bot API и Open-Meteo. Webhook вместо polling: компьютер не нужно держать включённым. Для погоды не нужен API-ключ. Клиент обращается к Open-Meteo напрямую; серверный прокси служит резервом.

## Быстрый локальный запуск

Нужны Node.js 22.13+ и pnpm версии из `package.json` (11.25.0).

```bash
git clone https://github.com/l1v0n1/weather-telegram-app.git
cd weather-telegram-app
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Открой адрес, показанный Vite (обычно http://127.0.0.1:5173). Погода и поиск работают без токена Telegram. Если Corepack отсутствует, установи pnpm официальным способом: https://pnpm.io/installation.

Для локальных серверных настроек скопируй `.env.example` в `.dev.vars` и заполни значения. Этот файл исключён из Git. Telegram не отправляет webhook на localhost: для настоящего бота нужен публичный HTTPS deployment.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен собственного бота из @BotFather; только серверный секрет |
| `WEBHOOK_SECRET` | Случайная строка для проверки заголовка Telegram webhook |
| `SETUP_SECRET` | Другой случайный секрет, защищающий одноразовую настройку |
| `WEBAPP_URL` | Полный HTTPS origin приложения без завершающего `/` |

Для каждого из двух секретов сгенерируй отдельное значение:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Не помещай токен или секреты в README, Git, URL, исходники или переменные `NEXT_PUBLIC_*`.

## Развёртывание на собственном Cloudflare

1. Создай аккаунт Cloudflare и включи Workers. Проверь актуальные квоты и условия: https://developers.cloudflare.com/workers/platform/pricing/.
2. Авторизуй Wrangler:

   ```bash
   pnpm exec wrangler login
   pnpm exec wrangler whoami
   ```

3. При необходимости измени уникальное `name` в `wrangler.jsonc`. Затем:

   ```bash
   pnpm typecheck
   pnpm test
   pnpm deploy
   ```

4. Скопируй выданный HTTPS URL. Через интерактивные команды сохрани секреты для этого Worker (ввод не включается в исходники):

   ```bash
   pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN
   pnpm exec wrangler secret put WEBHOOK_SECRET
   pnpm exec wrangler secret put SETUP_SECRET
   pnpm exec wrangler secret put WEBAPP_URL
   ```

   Для `WEBAPP_URL` введи HTTPS origin из предыдущего шага. Его хранение как secret необязательно, но позволяет использовать одинаковый способ настройки всех значений.

5. На доверенном компьютере создай игнорируемый `.env.setup` с `WEBAPP_URL` и `SETUP_SECRET` (те же значения, что на сервере), затем выполни:

   ```bash
   node --env-file=.env.setup scripts/setup-bot.mjs
   ```

   Скрипт вызывает защищённый `/api/setup`: проверяет бота, устанавливает `/start`, кнопку меню и webhook. Не вызывай этот endpoint через URL с секретом. У Telegram может быть только один webhook на бота: настройка собственного deployment переключит существующего бота на новый адрес.

6. Открой бота в Telegram, отправь `/start`, нажми **🌤 Открыть погоду**. Проверь поиск и разрешение геолокации на телефоне.

GitHub Pages сам по себе не запускает серверные маршруты и webhook. Публичный GitHub-репозиторий хранит исходники; существующий демонстрационный deployment работает отдельно. Этот README описывает самостоятельную установку, а не автоматическое переключение уже работающего бота.

## Проверки и обновления

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

Тесты проверяют секрет webhook, кнопку `/start`, исключение групповых чатов, ввод города и координат, прямую загрузку прогноза, резервный запрос и ошибки. Моки сетевых запросов не заменяют проверку реального Telegram и браузерных разрешений геолокации.

После изменений запусти проверки и `pnpm deploy`. Настройку бота повторяй при смене домена, токена или секрета webhook. Обновление GitHub не обновляет демонстрационный Sites deployment автоматически.

## Структура

```text
app/
  page.tsx                 # Интерфейс RU/EN
  globals.css              # Темы, адаптивность и погодные фоны
  api/weather/route.ts     # Резервный погодный API
  api/search/route.ts      # Резервный поиск городов
  api/telegram/route.ts    # Webhook /start
  api/setup/route.ts       # Защищённая настройка бота
lib/
  weather.ts               # Погодные коды и параметры API
  weather-client.ts        # Прямые запросы и резерв
  telegram.ts              # Серверный Telegram API
scripts/
  setup-bot.mjs            # Настройка после deployment
  test-app.mjs             # Регрессионные тесты
licenses/                  # Сохранённые уведомления об авторских правах
wrangler.jsonc             # Cloudflare Worker
```

Дизайн меняется в `app/globals.css`, тексты — в `app/page.tsx`, параметры API — в `lib/weather.ts` и серверном погодном маршруте.

## Ограничения и приватность

- Open-Meteo Free предназначен для некоммерческого использования; действуют лимиты. Для коммерческого проекта проверь отдельный тариф и условия провайдера.
- Бесплатные тарифы не гарантируют SLA и неограниченную доступность.
- При запросе погоды координаты передаются Open-Meteo. Последний выбранный город хранится в localStorage браузера. Геолокация запрашивается только кнопкой пользователя.
- В координатном режиме название отображается как «Моё местоположение»; обратное геокодирование не реализовано.
- Время прогноза соответствует часовому поясу выбранного города.
- `initDataUnsafe` используется только для языка, не для авторизации. Персонального серверного хранилища нет. Webhook защищён отдельным секретом.
- Если загрузка не удалась, обнови страницу. Если геолокация запрещена, используй поиск. Подробности: [SECURITY.md](SECURITY.md).

## Лицензия

Оригинальный код — [MIT](LICENSE). Уведомления и лицензии сторонних компонентов — [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Данные Open-Meteo — CC BY 4.0; условия использования их API действуют отдельно.
