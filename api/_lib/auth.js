import { validateInitData } from './telegram.js';
import { supabaseAdmin, ADMIN_TELEGRAM_IDS } from './supabaseAdmin.js';

// So'rovдан initData'ни oladi (header yoki body'дан)
export function getInitData(req) {
  const headerData = req.headers['x-telegram-init-data'];
  if (headerData) return headerData;
  if (req.body && typeof req.body === 'object' && req.body.initData) return req.body.initData;
  return null;
}

// initData'ни tekshirib, tasdiqlangan Telegram user'ни qaytaradi.
// Xato bo'lsa null.
export function authenticate(req) {
  const initData = getInitData(req);
  const botToken = process.env.BOT_TOKEN;
  const tgUser = validateInitData(initData, botToken);
  if (!tgUser?.id) return null;
  return tgUser;
}

export function isAdmin(telegramId) {
  return ADMIN_TELEGRAM_IDS.includes(Number(telegramId));
}

// Tasdiqlangan tg user bo'yicha bazadagi 'users' yozuvini topadi (id kerak bo'lganда)
export async function getDbUser(telegramId) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  return data;
}

// CORS va umumiy header'lar (Telegram WebApp uchun)
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data');
}
