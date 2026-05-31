# Botni DigitalOcean App Platform'ga joylashtirish

Bot doimiy (24/7) ishlashi uchun DigitalOcean App Platform'ga **worker** sifatida joylanadi.

## Tayyorgarlik (bajarilgan)
- `bot/package.json` da `start` skripti va Node versiyasi bor
- Bot polling rejimida (`bot.launch()`) — worker uchun to'g'ri
- GitHub repo: `asadbekqulboyev/poshxurt_savdo`, kod `bot/` papkada

## Qadamlar

### 1. App yaratish
1. https://cloud.digitalocean.com/apps ga kiring
2. **Create App** bosing
3. Manba: **GitHub** → `asadbekqulboyev/poshxurt_savdo` repo, branch `main`
4. **Source Directory:** `/bot` deb belgilang (MUHIM — bot shu papkada)
5. DigitalOcean Node.js loyihasini avtomatik aniqlaydi

### 2. Resurs turini "Worker" qilish
- Avtomatik "Web Service" deb tanlanishi mumkin. Uni **Worker** ga o'zgartiring
  (bot port ochmaydi, faqat fon jarayoni).
- Agar "Web Service" majburiy bo'lsa — pastdagi muqobil yo'lga qarang.

### 3. Resurs hajmi
- **Basic → $5/oy** (512MB) yetarli. Student kreditдан to'lanadi.

### 4. Environment Variables (MUHIM)
Quyidagilarni qo'shing (Settings → App-Level yoki Component Environment Variables):

| Key | Value | Type |
|-----|-------|------|
| `BOT_TOKEN` | (BotFather token) | Secret (Encrypt) |
| `SUPABASE_URL` | `https://dggplgcbojhmgzmtvqbs.supabase.co` | Plain |
| `SUPABASE_SERVICE_KEY` | (service_role kalit) | Secret (Encrypt) |
| `WEBAPP_URL` | `https://poshxurt.app` | Plain |

### 5. Deploy
- **Create Resources** / **Deploy** bosing
- 2-4 daqiqada bot ishga tushadi
- Logда `✅ Bot ishga tushdi` ko'rinishi kerak

## Muhim: faqat BITTA bot ishlashi kerak!
Telegram polling'да bir vaqtda **ikkita bot bir token bilan** ishlasa, xato (409 Conflict) beradi.
Shuning uchun DigitalOcean'da ishga tushgach — **lokal botni (kompyuterdagi) to'xtating**.
