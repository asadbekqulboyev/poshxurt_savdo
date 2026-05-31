import { authenticate, isAdmin, setCors } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

// GET /api/me — tasdiqlangan foydalanuvchining o'z profili.
// initData imzosi tekshiriladi; faqat o'z ma'lumotini qaytaradi.
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const tgUser = authenticate(req);
  if (!tgUser) return res.status(401).json({ error: 'Telegram imzosi tasdiqlanmadi' });

  // Foydalanuvchi botda /start qilган bo'lsa bazada bor
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('telegram_id', tgUser.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'not_registered' });

  const admin = isAdmin(tgUser.id);
  return res.status(200).json({
    id: data.id,
    telegramId: data.telegram_id,
    name: data.name,
    phone: data.phone,
    username: data.username || undefined,
    isAdmin: admin,
    isPremium: admin ? true : (data.is_premium ?? false),
    referralCount: data.referral_count ?? 0,
    referralLink: data.referral_link ?? `https://t.me/poshxurt_savdo_bot?start=ref_${data.telegram_id}`,
  });
}
