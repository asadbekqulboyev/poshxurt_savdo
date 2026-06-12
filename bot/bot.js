import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// --- Sozlamalar tekshiruvi ---
const { BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY, WEBAPP_URL } = process.env;

if (!BOT_TOKEN) {
  console.error("XATO: .env faylida BOT_TOKEN yo'q!");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("XATO: .env faylida SUPABASE_URL yoki SUPABASE_SERVICE_KEY yo'q!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const webAppUrl = WEBAPP_URL || 'https://example.com';

// Inline tugmalar: Bozorni ochish + Taxi (xabar ostida turadi)
const mainInlineKeyboard = Markup.inlineKeyboard([
  [Markup.button.webApp('🚖 Taxi', `${webAppUrl}/?screen=taxi`)],
  [Markup.button.webApp('🛒 Bozorni ochish', `${webAppUrl}/?screen=market`)],
]);

// Telefon so'rash uchun (Telegram qoidasi: contact faqat reply keyboard bilan)
const contactKeyboard = Markup.keyboard([
  [Markup.button.contactRequest('📱 Raqamni ulashish')],
]).resize().oneTime();

// --- /start ---
bot.start(async (ctx) => {
  const tgId = ctx.from.id;
  const name = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ').trim() || 'Foydalanuvchi';

  const { data: existing, error } = await supabase
    .from('users')
    .select('id, phone')
    .eq('telegram_id', tgId)
    .maybeSingle();

  if (error) console.error('Supabase select xatosi:', error.message);

  if (existing && existing.phone) {
    // Allaqachon ro'yxatda — inline tugmalar (Bozor + Taxi)
    return ctx.reply(
      `Xush kelibsiz, ${name}! 🛒\nQuyidagidan birini tanlang:`,
      mainInlineKeyboard
    );
  }

  // Yangi yoki telefonsiz — raqam so'raymiz
  return ctx.reply(
    `Assalomu alaykum, ${name}! 👋\n\n` +
    `Poshxurt Bozor va Taksi platformasiga xush kelibsiz.\n\n` +
    `Davom etish uchun telefon raqamingizni ulashing 👇`,
    contactKeyboard
  );
});

// --- Kontakt (telefon raqam) qabul qilish ---
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;

  if (contact.user_id !== ctx.from.id) {
    return ctx.reply("Iltimos, faqat o'zingizning raqamingizni ulashing. /start ni qayta bosing.");
  }

  const tgId = ctx.from.id;
  const name = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ').trim() || 'Foydalanuvchi';
  const username = ctx.from.username || null;

  let phone = contact.phone_number;
  if (!phone.startsWith('+')) phone = '+' + phone;

  const { error } = await supabase
    .from('users')
    .upsert(
      { telegram_id: tgId, name, phone, username },
      { onConflict: 'telegram_id' }
    );

  if (error) {
    console.error('Supabase upsert xatosi:', error.message);
    return ctx.reply("Kechirasiz, xatolik yuz berdi. Birozdan so'ng /start ni qayta urinib ko'ring.");
  }

  // Avval reply keyboardni yopamiz, keyin inline tugmalarni beramiz
  await ctx.reply(`Rahmat, ${name}! ✅ Ro'yxatdan o'tdingiz.`, Markup.removeKeyboard());
  return ctx.reply('Quyidagidan birini tanlang:', mainInlineKeyboard);
});

// --- Har qanday boshqa xabar ---
bot.on('message', async (ctx) => {
  const { data: existing } = await supabase
    .from('users')
    .select('phone')
    .eq('telegram_id', ctx.from.id)
    .maybeSingle();

  if (existing && existing.phone) {
    return ctx.reply('Quyidagidan birini tanlang:', mainInlineKeyboard);
  }
  return ctx.reply('Boshlash uchun /start ni bosing.');
});

// --- Ishga tushirish ---
console.log('⏳ Bot Telegram serveriga ulanmoqda...');
bot.launch();
console.log('✅ Bot ishga tushdi: @poshxurt_savdo_bot — /start kutilmoqda');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
