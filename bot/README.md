# Poshxurt Bot (@poshxurt_savdo_bot)

Telegram bot: `/start` → telefon raqam so'raydi → Supabase `users` jadvaliga saqlaydi → "Bozorni ochish" Web App tugmasini beradi.

## Ishga tushirish

1. Kerakli paketlarni o'rnating:
   ```bash
   cd bot
   npm install
   ```

2. `.env.example` ni `.env` ga nusxalang va to'ldiring:
   - `BOT_TOKEN` — @BotFather → /mybots → @poshxurt_savdo_bot → API Token
   - `SUPABASE_URL` — Supabase → Settings → API → Project URL
   - `SUPABASE_SERVICE_KEY` — Supabase → Settings → API → **service_role** kalit (anon EMAS!)
   - `WEBAPP_URL` — deploy qilingan ilova manzili (https bo'lishi shart)

3. Botni ishga tushiring:
   ```bash
   npm start
   ```

## Eslatmalar

- Telefon raqam faqat bot orqali olinadi (Telegram web app'ga raqamni avtomatik bermaydi).
- `users` jadvalida `telegram_id` UNIQUE — `/start` qayta bosilsa dublikat yaratilmaydi (upsert).
- `service_role` kalit faqat serverda (bot) ishlatiladi, hech qachon frontend'ga qo'yilmaydi.
- Web App tugmasi faqat `https://` manzil bilan ishlaydi (localhost bo'lmaydi). Lokal test uchun `ngrok` yoki deploy kerak.
