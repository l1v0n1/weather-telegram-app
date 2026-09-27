# 🌤 Weather Telegram Mini App

**Language:** [🇷🇺 Русский](README.md) · 🇬🇧 English

A Telegram weather bot and Mini App with current conditions, a 24-hour forecast, a seven-day forecast, city search, and geolocation. It supports Russian and English, Telegram themes, a saved city, refresh, and network error states.

[Open the app](https://kamil-weather.hackernet340.chatgpt.site) · [Telegram bot](https://t.me/pokeint_bot)

## Stack

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, Telegram Bot API, and Open-Meteo. A webhook replaces polling, so your computer does not need to stay on. No weather API key is needed. The client requests Open-Meteo directly, with a server-side proxy as a fallback.

## Run locally

You need Node.js 22.13+ and the pnpm version specified in `package.json` (11.25.0).

```bash
git clone https://github.com/l1v0n1/weather-telegram-app.git
cd weather-telegram-app
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open the address printed by Vite (usually http://127.0.0.1:5173). Weather and city search work without a Telegram token. If Corepack is unavailable, install pnpm using the [official instructions](https://pnpm.io/installation).

For local server settings, copy `.env.example` to `.dev.vars` and fill in the values. That file is excluded from Git. Telegram cannot deliver a webhook to localhost; running the bot requires a public HTTPS deployment.

## Environment variables

| Variable | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather; server-side secret only |
| `WEBHOOK_SECRET` | Random value used to validate Telegram's webhook header |
| `SETUP_SECRET` | A separate random value protecting the one-time setup endpoint |
| `WEBAPP_URL` | Full HTTPS origin of your deployment, without a trailing `/` |

Generate a different value for each of the two secrets:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Never put your token or secrets in the README, Git, URLs, source code, or `NEXT_PUBLIC_*` variables.

## Deploy to your own Cloudflare account

1. Create a Cloudflare account and enable Workers. Check the [current pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/).
2. Authenticate Wrangler:

   ```bash
   pnpm exec wrangler login
   pnpm exec wrangler whoami
   ```

3. Change `name` in `wrangler.jsonc` if necessary to make it unique. Then run:

   ```bash
   pnpm typecheck
   pnpm test
   pnpm deploy
   ```

4. Copy the resulting HTTPS URL. Store the values in the deployed Worker through Wrangler's interactive prompts (the values are not committed to source):

   ```bash
   pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN
   pnpm exec wrangler secret put WEBHOOK_SECRET
   pnpm exec wrangler secret put SETUP_SECRET
   pnpm exec wrangler secret put WEBAPP_URL
   ```

   For `WEBAPP_URL`, enter the HTTPS origin from the previous step. This URL does not itself need to be secret, but using the same setup method is convenient.

5. On a trusted computer, create an ignored `.env.setup` containing `WEBAPP_URL` and `SETUP_SECRET` with the same values as your deployment. Then run:

   ```bash
   node --env-file=.env.setup scripts/setup-bot.mjs
   ```

   The script calls the protected `/api/setup` endpoint. It checks the bot and configures `/start`, the menu button, and the webhook. Never place the setup secret in a URL. A Telegram bot can have only one webhook: configuring your own deployment will switch the bot to the new URL.

6. Open the bot in Telegram, send `/start`, and tap **🌤 Open weather**. Check city search and the location permission flow on a phone.

GitHub Pages cannot run the server routes and webhook by itself. This public repository contains the source; the existing demo deployment is separate. These steps describe an independent installation and do not automatically move the live bot.

## Checks and updates

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

The tests cover the webhook secret, the `/start` WebApp button, excluding group chats, city and coordinate input, direct forecasts, the server fallback, and network errors. Mocked network tests do not replace a real Telegram or browser geolocation check.

After changes, run the checks and `pnpm deploy`. Reconfigure the bot if the domain, token, or webhook secret changes. Pushing to GitHub does not automatically update the demo Sites deployment.

## Project layout

```text
app/
  page.tsx                 # RU/EN interface
  globals.css              # Themes, responsive layout, weather backgrounds
  api/weather/route.ts     # Fallback weather API
  api/search/route.ts      # Fallback city search
  api/telegram/route.ts    # /start webhook
  api/setup/route.ts       # Protected bot setup
lib/
  weather.ts               # Weather codes and API parameters
  weather-client.ts        # Direct requests and fallback
  telegram.ts              # Server-side Telegram API
scripts/
  setup-bot.mjs            # Post-deployment bot configuration
  test-app.mjs             # Regression checks
licenses/                  # Preserved third-party notices
wrangler.jsonc             # Cloudflare Worker configuration
```

Edit the design in `app/globals.css`, interface text in `app/page.tsx`, and API parameters in `lib/weather.ts` and the server weather route.

## Limits and privacy

- Open-Meteo's free API is for non-commercial use and has limits. Check the provider's terms and pricing for commercial projects.
- Free hosting tiers do not guarantee an SLA or unlimited availability.
- Weather requests send coordinates to Open-Meteo. The most recently selected city is stored in browser localStorage. Geolocation is requested only when the user taps the location button.
- When using coordinates, the title is “My location”; reverse geocoding is not implemented.
- Forecast times use the selected location's time zone.
- `initDataUnsafe` is used only to select the interface language, not for authentication. The app has no personal server-side data store. A separate secret protects the webhook.
- If loading fails, refresh the app. If location permission is denied, use city search. See [SECURITY.md](SECURITY.md) for security notes.

## License

Original source code is [MIT-licensed](LICENSE). Third-party attributions and licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Open-Meteo data is licensed under CC BY 4.0; separate API usage terms also apply.
