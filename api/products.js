import { authenticate, isAdmin, setCors } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const PAGE_SIZE = 20;

const mapProduct = (row) => ({
  id: row.id,
  sellerId: row.seller_id,
  sellerName: row.seller_name,
  sellerPhone: row.seller_phone,
  title: row.title,
  price: row.price,
  description: row.description,
  images: row.images ?? [],
  category: row.category,
  isTop: row.is_top ?? false,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  status: row.status ?? 'active',
  location: row.location,
});

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // --- GET: e'lonlar ro'yxati (ochiq, sahifalab) ---
  if (req.method === 'GET') {
    const page = Math.max(0, parseInt(req.query.page ?? '0', 10) || 0);
    const category = req.query.category;
    const sellerId = req.query.sellerId;

    let query = supabaseAdmin.from('products').select('*');

    if (sellerId) {
      query = query.eq('seller_id', sellerId).order('created_at', { ascending: false });
    } else {
      query = query
        .order('is_top', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (category && category !== 'all') query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json((data ?? []).map(mapProduct));
  }

  // --- POST: e'lon yaratish (faqat tasdiqlangан foydalanuvchi) ---
  if (req.method === 'POST') {
    const tgUser = authenticate(req);
    if (!tgUser) return res.status(401).json({ error: 'Telegram imzosi tasdiqlanmadi' });

    // Bazadagi user — seller ma'lumotlari serverдан olinadi (client yubormайди)
    const { data: dbUser } = await supabaseAdmin
      .from('users').select('*').eq('telegram_id', tgUser.id).maybeSingle();
    if (!dbUser) return res.status(403).json({ error: 'not_registered' });

    const p = req.body || {};
    if (!p.title || !p.price) return res.status(400).json({ error: 'title va price shart' });

    const admin = isAdmin(tgUser.id);
    const { error } = await supabaseAdmin.from('products').insert([{
      title: String(p.title).slice(0, 200),
      price: Number(p.price) || 0,
      description: p.description ? String(p.description).slice(0, 2000) : '',
      category: p.category || 'others',
      location: p.location || 'Poshxurt',
      images: Array.isArray(p.images) ? p.images : [],
      is_top: admin || (dbUser.is_premium ?? false),
      seller_id: dbUser.id,
      seller_name: dbUser.name,
      seller_phone: dbUser.phone,
    }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true });
  }

  // --- DELETE: e'lon o'chirish (faqat egasi yoki admin) ---
  if (req.method === 'DELETE') {
    const tgUser = authenticate(req);
    if (!tgUser) return res.status(401).json({ error: 'Telegram imzosi tasdiqlanmadi' });

    const ids = (req.body && req.body.ids) || [];
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids kerak' });

    const { data: dbUser } = await supabaseAdmin
      .from('users').select('id').eq('telegram_id', tgUser.id).maybeSingle();
    if (!dbUser) return res.status(403).json({ error: 'not_registered' });

    const admin = isAdmin(tgUser.id);

    // O'chiriladigan e'lonlarни olamiz (rasm tozalash + egalik tekshiruvi uchun)
    const { data: products } = await supabaseAdmin
      .from('products').select('id, seller_id, images').in('id', ids);

    // Admin emas bo'lsa — faqat o'z e'lonlarini o'chira oladi
    const allowed = (products ?? []).filter((p) => admin || p.seller_id === dbUser.id);
    if (allowed.length === 0) return res.status(403).json({ error: 'ruxsat yo`q' });

    // Storage'дан rasmlarni o'chirish
    const urls = allowed.flatMap((p) => p.images || []).filter((u) => typeof u === 'string' && u.startsWith('http'));
    const paths = urls
      .map((u) => { const m = u.indexOf('/object/public/product-images/'); return m === -1 ? null : u.slice(m + '/object/public/product-images/'.length); })
      .filter(Boolean);
    if (paths.length) await supabaseAdmin.storage.from('product-images').remove(paths);

    const allowedIds = allowed.map((p) => p.id);
    const { error } = await supabaseAdmin.from('products').delete().in('id', allowedIds);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, deleted: allowedIds.length });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
