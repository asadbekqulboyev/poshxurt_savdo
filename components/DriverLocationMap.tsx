import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { getTaxiMarkerHTML, injectTaxiMarkerStyles } from './TaxiMarkerIcon';

// Leaflet CDN dan yuklash (MapPicker bilan umumiy)
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    // CSS allaqachon yuklangan bo'lishi mumkin (MapPicker orqali)
    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve((window as any).L);
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      // Script bor, lekin hali yuklanmagan bo'lishi mumkin
      const check = setInterval(() => {
        if ((window as any).L) { clearInterval(check); resolve((window as any).L); }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error('Leaflet timeout')); }, 10000);
    }
  });
  return leafletPromise;
}

interface DriverLocationMapProps {
  lat: number;
  lng: number;
  /** Popup matni */
  label?: string;
}

export const DriverLocationMap: React.FC<DriverLocationMapProps> = ({ lat, lng, label }) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    injectTaxiMarkerStyles();

    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current) return;

      // Agar oldingi xarita bo'lsa — tozalash
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true,
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom taxi marker
      const icon = L.divIcon({
        html: getTaxiMarkerHTML(44),
        iconSize: [44, 58],
        iconAnchor: [22, 58],
        popupAnchor: [0, -50],
        className: '', // Leaflet default class'ini o'chirish
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="text-align:center;font-weight:700;font-size:14px;padding:4px 8px;">
          📍 ${label || "Yo'lovchi shu yerda"}
        </div>`,
        { closeButton: false, className: 'taxi-popup' }
      );

      // Markerga bosilganda popup ochiladi
      marker.on('click', () => marker.openPopup());

      // Kichik delay bilan popup ni ochib qo'yamiz
      setTimeout(() => {
        if (!cancelled) marker.openPopup();
      }, 800);

      mapRef.current = map;
      setReady(true);
    }).catch(() => setReady(false));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, label]);

  // Expanded o'zgarganda xarita o'lchamini yangilash
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [expanded]);

  const handleOpenInMaps = () => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className={`relative w-full overflow-hidden border-2 border-amber-200 bg-amber-50 transition-all duration-300 ${expanded ? 'rounded-2xl h-80' : 'rounded-2xl h-48'}`}>
      <div ref={mapEl} className="w-full h-full" />

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-amber-500" />
            <span className="text-xs font-bold text-amber-600">Xarita yuklanmoqda...</span>
          </div>
        </div>
      )}

      {/* Kengaytirish / kichraytirish tugmasi */}
      {ready && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur p-2 rounded-xl shadow-md active:scale-90 transition-transform"
        >
          {expanded ? <Minimize2 size={18} className="text-slate-700" /> : <Maximize2 size={18} className="text-slate-700" />}
        </button>
      )}

      {/* Google Maps da ochish tugmasi */}
      {ready && (
        <button
          type="button"
          onClick={handleOpenInMaps}
          className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-md text-xs font-bold text-blue-600 active:scale-95 transition-all flex items-center gap-1"
        >
          🗺️ Google Maps
        </button>
      )}

      {/* Sarlavha */}
      {ready && (
        <div className="absolute top-3 left-3 z-[400] bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5">
          🚕 Yo'lovchi joylashuvi
        </div>
      )}
    </div>
  );
};
