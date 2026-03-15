# Telegram Bot Setup

1. Open Telegram and message @BotFather
2. Send /newbot
3. Follow prompts to name your bot (e.g., "SnowballCryptoBot")
4. Copy the BOT_TOKEN BotFather gives you
5. Add to Vercel environment variables:
   - TELEGRAM_BOT_TOKEN = your token
   - SUPABASE_SERVICE_ROLE_KEY = from Supabase dashboard > Settings > API > service_role key
6. After deploying, visit: https://your-app.vercel.app/api/telegram/setup-webhook
   This registers the webhook with Telegram automatically.
7. Users can now connect via the "Connect Telegram" panel on the dashboard.
