/* =====================================================
   AGUARÁ — ZOOM DE EQUIPAMIENTO
   Mantiene el control como barra y permite reducir la foto.
===================================================== */
(() => {
  "use strict";

  function injectAdminButtonStyle() {
    if (document.getElementById("aguara-admin-rect-buttons")) return;
    const style = document.createElement("style");
    style.id = "aguara-admin-rect-buttons";
    style.textContent = `
      .admin-reservation button,
      #login-screen button,
      #admin-panel button,
      .promotion-admin-actions button{
        border-radius:6px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function adjustZoom(root = document) {
    const input = root.querySelector?.("#photoZoom");
    if (!input || input.dataset.aguaraZoomAdjusted === "1") return;
    input.min = "0.5";
    input.max = "3";
    input.step = "0.01";
    if (!input.value || Number(input.value) > 3 || Number(input.value) < 0.5) input.value = "1";
    input.dataset.aguaraZoomAdjusted = "1";
  }

  function init() {
    injectAdminButtonStyle();
    adjustZoom();
    new MutationObserver(() => adjustZoom()).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
