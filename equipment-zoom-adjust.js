/* =====================================================
   AGUARÁ — ZOOM DE EQUIPAMIENTO / FOTOS
   Barra visible, funcional e indicador de porcentaje.
===================================================== */
(() => {
  "use strict";

  // Permite ampliar Y reducir la foto. 100% es el tamaño original.
  const MIN_ZOOM = 0.10;
  const MAX_ZOOM = 3;

  function injectStyles() {
    if (document.getElementById("aguara-photo-zoom-styles")) return;
    const style = document.createElement("style");
    style.id = "aguara-photo-zoom-styles";
    style.textContent = `
      .catalog-photo-editor-controls { display:grid !important; grid-template-columns:1fr 1fr !important; gap:12px !important; }
      .catalog-photo-editor-controls label { display:grid !important; gap:6px !important; color:#bbb !important; font-size:13px !important; font-weight:800 !important; }
      .catalog-photo-editor-controls input[type="range"],
      .photo-editor-controls input[type="range"] { display:block !important; width:100% !important; min-height:30px !important; cursor:pointer !important; accent-color:#f28b24 !important; opacity:1 !important; visibility:visible !important; }
      .aguara-zoom-value { display:inline-block !important; margin-left:8px !important; color:#f28b24 !important; font-weight:900 !important; font-size:13px !important; }
      .catalog-photo-editor-controls .aguara-zoom-value { margin:0 !important; }
      @media(max-width:700px){ .catalog-photo-editor-controls { grid-template-columns:1fr !important; } }
    `;
    document.head.appendChild(style);
  }

  function enhance(root = document) {
    const inputs = root.querySelectorAll?.("#photoZoom, .catalog-editor-zoom");
    if (!inputs?.length) return;

    inputs.forEach((input) => {
      input.type = "range";
      input.min = String(MIN_ZOOM);
      input.max = String(MAX_ZOOM);
      input.step = "0.01";
      input.setAttribute("aria-label", "Zoom de la foto");
      input.title = "Izquierda: alejar · Derecha: acercar";

      const current = Number(input.value);
      input.value = String(Number.isFinite(current) ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current)) : 1);

      if (input.dataset.aguaraZoomEnhanced === "1") return;
      input.dataset.aguaraZoomEnhanced = "1";

      const label = input.closest("label");
      const value = document.createElement("output");
      value.className = "aguara-zoom-value";
      value.setAttribute("aria-live", "polite");
      value.textContent = `${Math.round(Number(input.value) * 100)}%`;

      if (label) label.appendChild(value);
      else input.parentNode?.appendChild(value);

      const update = () => {
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(input.value) || 1));
        value.textContent = `${Math.round(zoom * 100)}%`;
        input.value = String(zoom);
        input.dispatchEvent(new Event("change", { bubbles:true }));
      };

      input.addEventListener("input", update);
      update();
    });
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
    enhance();
    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, { childList:true, subtree:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
