// SVG asosidagi mashincha belgisi — Leaflet divIcon uchun HTML qaytaradi
// Pulsating animatsiya bilan "jonli" his qilish uchun

/**
 * Leaflet divIcon uchun taxi marker HTML generatsiya qiladi.
 * @param size — marker o'lchami (px)
 */
export function getTaxiMarkerHTML(size = 48): string {
  return `
    <div style="position:relative;width:${size}px;height:${size + 14}px;display:flex;flex-direction:column;align-items:center;">
      <!-- Pulse ring -->
      <div style="
        position:absolute;
        top:${size / 2 - 20}px;
        left:50%;
        transform:translateX(-50%);
        width:40px;height:40px;
        border-radius:50%;
        background:rgba(250,204,21,0.25);
        animation:taxiPulse 2s ease-in-out infinite;
        z-index:0;
      "></div>
      <!-- Car icon circle -->
      <div style="
        position:relative;
        z-index:1;
        width:${size}px;height:${size}px;
        background:linear-gradient(135deg,#fbbf24,#f59e0b);
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 14px rgba(245,158,11,0.45),0 0 0 3px #fff;
        animation:taxiBounceIn 0.5s cubic-bezier(.68,-.55,.27,1.55) both;
      ">
        <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Taxi car SVG -->
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" fill="#1e293b"/>
          <path d="M3 17h2m4 0h6m4 0h2v-4.97a1.98 1.98 0 0 0-.394-1.19L18.5 8H16l-2-4H10L8 8H5.5L3.394 10.84A1.98 1.98 0 0 0 3 12.03V17Z" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 13h14" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <!-- Arrow pointer -->
      <div style="
        width:0;height:0;
        border-left:8px solid transparent;
        border-right:8px solid transparent;
        border-top:10px solid #f59e0b;
        margin-top:-2px;
        filter:drop-shadow(0 2px 4px rgba(245,158,11,0.3));
      "></div>
    </div>
  `;
}

/**
 * Taxi marker uchun kerakli CSS animatsiyalarni sahifaga qo'shadi.
 * Bir marta chaqiriladi.
 */
let stylesInjected = false;
export function injectTaxiMarkerStyles(): void {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes taxiPulse {
      0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
      50% { transform: translateX(-50%) scale(1.8); opacity: 0; }
    }
    @keyframes taxiBounceIn {
      0% { transform: scale(0) translateY(20px); opacity: 0; }
      60% { transform: scale(1.15) translateY(-4px); opacity: 1; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
