/* Aguará Paintball — texto editable junto al calendario */
(() => {
  "use strict";
  const DEFAULT_TEXT = "Elegí primero la fecha y después uno de los horarios disponibles. La seña es necesaria para confirmar la reserva.";

  async function init() {
    const box = document.getElementById("bookingInfoPublic");
    if (!box) return;
    try {
      const response = await fetch("/api/booking-info?t=" + Date.now(), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo cargar la información.");
      box.textContent = data.text || DEFAULT_TEXT;
    } catch (error) {
      console.warn("AGUARÁ BOOKING INFO:", error);
      box.textContent = DEFAULT_TEXT;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
