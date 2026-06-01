// Foydalanuvchi joylashuvini olish.
// 1) Telegram LocationManager (yangi Telegram, eng ishonchli)
// 2) Browser geolocation (zaxira)
// Koordinata qaytadi yoki xato sababini beradi.

export interface GeoResult {
  latitude: number;
  longitude: number;
}

// Google Maps havolasi — haydovchi bosib xaritada ko'radi
export function mapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

// Telegram LocationManager orqali (mavjud bo'lsa)
function getViaTelegram(): Promise<GeoResult | null> {
  return new Promise((resolve) => {
    const lm = (window as any).Telegram?.WebApp?.LocationManager;
    if (!lm) return resolve(null);

    try {
      lm.init(() => {
        if (!lm.isLocationAvailable) return resolve(null);
        lm.getLocation((loc: any) => {
          if (loc && typeof loc.latitude === 'number') {
            resolve({ latitude: loc.latitude, longitude: loc.longitude });
          } else {
            resolve(null); // foydalanuvchi rad etdi yoki xato
          }
        });
      });
    } catch {
      resolve(null);
    }
  });
}

// Browser geolocation orqali (zaxira)
function getViaBrowser(): Promise<GeoResult | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

// Asosiy funksiya: avval Telegram, keyin browser
export async function getCurrentLocation(): Promise<GeoResult | null> {
  const viaTg = await getViaTelegram();
  if (viaTg) return viaTg;
  return getViaBrowser();
}
