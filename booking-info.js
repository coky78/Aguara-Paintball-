(() => {
  "use strict";

  const FALLBACK = "Elegí primero la fecha y después uno de los horarios disponibles. La seña es necesaria para confirmar la reserva.";

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function injectStyles() {
    if (document.getElementById("aguaraBookingInfoStyles")) return;
    const style = document.createElement("style");
    style.id = "aguaraBookingInfoStyles";
    style.textContent = `
      .aguara-booking-info {
        margin-top: 18px;
        padding: 22px;
        border: 1px solid rgba(240,138,53,.30);
        border-radius: 16px;
        background: linear-gradient(145deg, rgba(28,20,15,.98), rgba(12,12,12,.98));
        box-shadow: 0 14px 35px rgba(0,0,0,.25);
        color: rgba(255,255,255,.86);
        min-height: 150px;
        box-sizing: border-box;
      }
      .aguara-booking-info h3 {
        margin: 0 0 10px;
        color: #f08a35;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: .05em;
      }
      .aguara-booking-info-text {
        margin: 0;
        white-space: pre-line;
        line-height: 1.65;
        font-size: .94rem;
      }
      @media(max-width:640px){
        .aguara-booking-info { min-height: 0; padding: 17px; }
      }
    `;
    document.head.appendChild(style);
  }

  function createInfo() {
    if (document.getElementById("aguaraBookingInfo")) return true;
    const calendar = document.getElementById("aguaraCalendarShell");
    const side = document.querySelector(".booking-side");
    if (!calendar || !side) return false;
    const box = document.createElement("div");
    box.id = "aguaraBookingInfo";
    box.className = "aguara-booking-info";
    box.innerHTML = `<h3>Información de la reserva</h3><p class="aguara-booking-info-text" id="aguaraBookingInfoText">${escapeHtml(FALLBACK)}</p>`;
    side.appendChild(box);
    return true;
  }

  async function load() {
    injectStyles();
    if (!createInfo()) return;
    try {
      const response = await fetch("/api/booking-info", { cache: "no-store", headers: { Accept: "application/json" } });
      const data = await response.json();
      if (response.ok && data.ok && document.getElementById("aguaraBookingInfoText")) {
        document.getElementById("aguaraBookingInfoText").textContent = data.text || FALLBACK;
      }
    } catch (error) {
      console.error("AGUARÁ → ERROR CARGANDO INFORMACIÓN DE RESERVA:", error);
    }
  }

  function start() {
    if (document.getElementById("aguaraCalendarShell")) load();
    else setTimeout(start, 150);
  }

  start();
})();
