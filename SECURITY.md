# Security

Never commit real tokens, `.dev.vars`, `.env*`, local runtime state or deployment credentials. `.env.example` contains only empty placeholders.

If a bot token becomes public, revoke it using @BotFather, replace `TELEGRAM_BOT_TOKEN` in the hosting secrets and run setup again. Rotate `WEBHOOK_SECRET` or `SETUP_SECRET` if exposed.

Do not report vulnerabilities with real credentials or personal data in public issues. Use GitHub's private vulnerability reporting if enabled; otherwise contact the repository owner privately.

Weather endpoints are public. This small personal app is not a hardened multi-tenant service; add distributed rate limits, monitoring and update deduplication before operating at large scale. Keep dependencies updated and preserve third-party license notices.
