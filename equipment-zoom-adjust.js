/* =====================================================
   AGUARÁ — ZOOM DE EQUIPAMIENTO
   Mantiene el control como barra y permite reducir la foto.
===================================================== */
(() => {
  "use strict";

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
    adjustZoom();
    new MutationObserver(() => adjustZoom()).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
