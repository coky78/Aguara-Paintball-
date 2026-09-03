/* Aguará — control de zoom visible y usable para el editor de fotos */
(() => {
  "use strict";
  const MIN = 0.10;
  const MAX = 3;

  function apply(root = document) {
    const input = root.querySelector?.("#photoZoom");
    if (!input || input.dataset.aguaraZoomFixed === "1") return;

    input.dataset.aguaraZoomFixed = "1";
    input.type = "range";
    input.min = String(MIN);
    input.max = String(MAX);
    input.step = "0.01";
    if (!Number.isFinite(Number(input.value))) input.value = "1";
    input.value = String(Math.min(MAX, Math.max(MIN, Number(input.value))));
    input.setAttribute("aria-label", "Zoom de la foto");
    input.title = "Izquierda: alejar · Derecha: acercar";

    const controls = input.closest(".photo-editor-controls");
    if (!controls) return;
    const label = controls.querySelector('label[for="photoZoom"]');
    if (label) label.textContent = "Zoom de la foto";

    let value = controls.querySelector(".aguara-zoom-value");
    if (!value) {
      value = document.createElement("output");
      value.className = "aguara-zoom-value";
      value.setAttribute("for", "photoZoom");
      input.parentNode?.appendChild(value);
    }
    const update = () => { value.textContent = `${Number(input.value).toFixed(2)}×`; };
    input.addEventListener("input", update);
    update();
  }

  function styles() {
    if (document.getElementById("aguara-photo-zoom-fix-styles")) return;
    const style = document.createElement("style");
    style.id = "aguara-photo-zoom-fix-styles";
    style.textContent = `
      .photo-editor-controls input[type="range"] { display:block !important; width:100% !important; min-height:28px; cursor:pointer; }
      .photo-editor-controls .aguara-zoom-value { display:inline-block; min-width:58px; margin-left:8px; color:#f28b24; font-weight:800; font-size:13px; }
      .photo-editor-controls label[for="photoZoom"] { font-weight:800; color:#fff; }
    `;
    document.head.appendChild(style);
  }

  function init() {
    styles();
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
