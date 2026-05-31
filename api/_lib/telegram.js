import crypto from 'crypto';

// Telegram WebApp initData imzosini tekshiradi.
// To'g'ri bo'lsa — foydalanuvchi obyektini qaytaradi, aks holda null.
// Algoritm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function validateInitData(initData, botToken, maxAgeSeconds = 86400) {
  if (!initData || !botToken) return null;

  let params;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  // data_check_string: kalitlar alifbo tartibida, "key=value" \n bilan birlashtiriladi
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  // secret_key = HMAC_SHA256(key="WebAppData", message=bot_token)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  // hash = HMAC_SHA256(key=secret_key, message=data_check_string)
  const calcHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Doimiy vaqtli taqqoslash (timing attack'дан himoya)
  const a = Buffer.from(calcHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Eskirishni tekshirish (replay attack'дан himoya)
  const authDate = Number(params.get('auth_date'));
  if (authDate && maxAgeSeconds > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > maxAgeSeconds) return null;
  }

  const userJson = params.get('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}
