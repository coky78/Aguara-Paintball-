/* =====================================================
   AGUARÁ — ZOOM DE EQUIPAMIENTO / FOTOS
   Control visible para ampliar y reducir la foto.
===================================================== */
(() => {
  "use strict";

  const MIN_ZOOM = 0.10;
  const MAX_ZOOM = 3;

  function injectStyles() {
    if (document.getElementById("aguara-photo-zoom-styles")) return;
    const style = document.createElement("style");
    style.id = "aguara-photo-zoom-styles";
    style.textContent = `
      .photo-editor-controls input[type="range"] { display:block !important; width:100% !important; min-height:28px; cursor:pointer; }
      .photo-editor-controls label[for="photoZoom"] { font-weight:800; color:#fff; }
      .aguara-zoom-value { display:inline-block; min-width:58px; margin-left:8px; color:#f28b24; font-weight:800; font-size:13px; }
    `;
    document.head.appendChild(style);
  }

  function adjustZoom(root = document) {
    const input = root.querySelector?.("#photoZoom");
    if (!input) return;

    input.min = String(MIN_ZOOM);
    input.max = String(MAX_ZOOM);
    input.step = "0.01";
    input.type = "range";
    input.setAttribute("aria-label", "Zoom de la foto");
    input.title = "Izquierda: alejar la foto · Derecha: acercar la foto";

    const current = Number(input.value);
    input.value = String(Number.isFinite(current) ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current)) : 1);

    const controls = input.closest(".photo-editor-controls");
    if (!controls || input.dataset.aguaraZoomReady === "1") return;

    input.dataset.aguaraZoomReady = "1";
    const label = controls.querySelector('label[for="photoZoom"]');
    if (label) label.textContent = "Zoom de la foto";

    const value = document.createElement("output");
    value.className = "aguara-zoom-value";
    value.setAttribute("for", "photoZoom");
    input.parentNode?.appendChild(value);

    const updateValue = () => { value.textContent = `${Number(input.value).toFixed(2)}×`; };
    input.addEventListener("input", updateValue);
    updateValue();
  }

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

  function init() {
    injectStyles();
    injectAdminButtonStyle();
    adjustZoom();
    const observer = new MutationObserver(() => adjustZoom());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
