import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { getCurrentLocation } from '../services/location';

// Poshxurt taxminiy markazi (GPS ishlamasa standart)
const DEFAULT_CENTER: [number, number] = [37.6286, 66.9],
  DEFAULT_ZOOM = 15;

interface MapPickerProps {
  onChange: (coords: { lat: number; lng: number }) => void;
}

// Leaflet'ni CDN'dan bir marta yuklaydi (asosiy bundle'ni shishirmaslik uchun)
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export const MapPicker: React.FC<MapPickerProps> = ({ onChange }) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;

      const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false })
        .setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      setReady(true);

      // Markaz o'zgarganda koordinatani uzatamiz (Yandex uslubi: markaz = olinish nuqtasi)
      const emit = () => {
        const c = map.getCenter();
        onChange({ lat: c.lat, lng: c.lng });
      };
      map.on('moveend', emit);
      emit();

      // Boshlanishda GPS bilan markazlashga urinamiz
      handleLocate(map);
    }).catch(() => setReady(false));

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = async (mapInstance?: any) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;
    setLocating(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        map.setView([loc.latitude, loc.longitude], 16);
        onChange({ lat: loc.latitude, lng: loc.longitude });
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={mapEl} className="w-full h-full" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <Loader2 size={28} className="animate-spin text-blue-400" />
        </div>
      )}

      {/* Markazdagi qo'zg'almas pin (Yandex uslubi) */}
      {ready && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[400]">
          <MapPin size={40} className="text-blue-600 drop-shadow-lg" fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
        </div>
      )}

      {/* "Meni top" tugmasi */}
      <button
        type="button"
        onClick={() => handleLocate()}
        className="absolute bottom-3 right-3 z-[400] bg-white p-3 rounded-full shadow-lg active:scale-90 transition-transform"
      >
        {locating ? <Loader2 size={22} className="animate-spin text-blue-600" /> : <LocateFixed size={22} className="text-blue-600" />}
      </button>

      {/* Yo'riqnoma */}
      {ready && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow text-xs font-bold text-slate-700 whitespace-nowrap">
          Xaritani suring — turgan joyingizni belgilang
        </div>
      )}
    </div>
  );
};
