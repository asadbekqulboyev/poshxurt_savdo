// Eng oddiy test endpoint — hech qanday import yo'q.
// Agar bu ishlasa, Vercel funksiyalari umuman ishlaydi degani.
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    msg: 'pong',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasBotToken: !!process.env.BOT_TOKEN,
    hasAdminIds: !!process.env.ADMIN_TELEGRAM_IDS,
  });
}
