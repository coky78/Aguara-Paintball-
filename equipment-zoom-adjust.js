/* =====================================================
   AGUARÁ — ZOOM DE EQUIPAMIENTO
   El control permite ampliar Y reducir la foto.
===================================================== */
(() => {
  "use strict";

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;

  function injectAdminButtonStyle() {
    if (document.getElementById("aguara-admin-rect-buttons")) return;
    const style = document.createElement("style");
    style.id = "aguara-admin-rect-buttons";
    style.textContent = `
      .admin-reservation button,
      #login-screen button,
      #admin-panel button,
      .promotion-admin-actions button { border-radius:6px !important; }
    `;
    document.head.appendChild(style);
  }

  function adjustZoom(root = document) {
    const input = root.querySelector?.("#photoZoom");
    if (!input) return;
    input.min = String(MIN_ZOOM);
    input.max = String(MAX_ZOOM);
    input.step = "0.01";
    input.setAttribute("aria-label", "Zoom de la foto");
    input.title = "Deslizá hacia la izquierda para alejar y hacia la derecha para acercar";
    if (!input.value || !Number.isFinite(Number(input.value))) input.value = "1";
    if (Number(input.value) < MIN_ZOOM) input.value = String(MIN_ZOOM);
    if (Number(input.value) > MAX_ZOOM) input.value = String(MAX_ZOOM);
  }

  function init() {
    injectAdminButtonStyle();
    adjustZoom();
    const observer = new MutationObserver(() => adjustZoom());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
