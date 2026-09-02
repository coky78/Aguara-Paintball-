(() => {
  "use strict";

  const RESERVATION_URL = "#reservas";
  const RESERVATION_TEXT = "RESERVÁ AHORA";

  function $(id) { return document.getElementById(id); }

  function status(text, ok = false) {
    const el = $("promotionStatus");
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.style.color = ok ? "#22c55e" : "#aaa";
  }

  function injectStyles() {
    if ($("promotion-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "promotion-admin-styles";
    style.textContent = `
      .promotion-admin-box{margin-top:20px;padding:22px;border:1px solid rgba(240,138,53,.28);border-radius:16px;background:linear-gradient(145deg,rgba(242,139,36,.06),rgba(255,255,255,.02));}
      .promotion-admin-box h2{margin:0 0 6px;}
      .promotion-admin-box>p{margin:0 0 18px;color:#aaa;}
      .promotion-admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
      .promotion-admin-grid .full-row{grid-column:1/-1;}
      .promotion-admin-grid label{display:grid;gap:7px;}
      .promotion-admin-grid textarea{min-height:100px;resize:vertical;}
      .promotion-admin-toggle{display:flex!important;align-items:center;gap:9px;}
      .promotion-admin-toggle input{width:auto;}
      .promotion-admin-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;}
      .promotion-admin-actions button{min-width:170px;}
      .promotion-reservation-note{grid-column:1/-1;padding:12px 14px;border:1px solid rgba(34,197,94,.22);border-radius:10px;background:rgba(34,197,94,.06);color:#bbb;font-size:13px;line-height:1.5;}
      @media(max-width:700px){.promotion-admin-grid{grid-template-columns:1fr}.promotion-admin-grid .full-row,.promotion-reservation-note{grid-column:auto}.promotion-admin-actions button{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  async function api(options = {}) {
    const response = await fetch("/api/home-promotion", {
      ...options,
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo gestionar la promoción.");
    return data;
  }

  function apply(promo = {}) {
    $("promoEnabled").checked = promo.enabled === true;
    $("promoTitle").value = promo.title || "";
    $("promoText").value = promo.text || "";
    $("promoDate").value = promo.date || "";
    $("promoCtaText").value = RESERVATION_TEXT;
    $("promoCtaUrl").value = RESERVATION_URL;
    $("promoCtaText").readOnly = true;
    $("promoCtaUrl").readOnly = true;
  }

  async function load() {
    injectStyles();
    status("Cargando promoción...");
    try {
      const data = await api();
      apply(data.promotion || {});
      status(data.promotion?.enabled ? "✓ Promoción activa." : "Promoción oculta. Podés editarla y activarla.", true);
    } catch (error) {
      status(error.message || "No se pudo cargar la promoción.");
    }
  }

  async function save() {
    status("Guardando...");
    try {
      const data = await api({
        method: "POST",
        body: JSON.stringify({
          enabled: $("promoEnabled").checked,
          title: $("promoTitle").value,
          text: $("promoText").value,
          date: $("promoDate").value,
          ctaText: RESERVATION_TEXT,
          ctaUrl: RESERVATION_URL
        })
      });
      apply(data.promotion || {});
      status("✓ Promoción guardada. El botón lleva directamente a Reservar.", true);
    } catch (error) {
      status(error.message || "No se pudo guardar la promoción.");
    }
  }

  function init() {
    if (!$("promotionAdmin")) return;
    if ($("promotionSave")) $("promotionSave").addEventListener("click", save);
    load();
  }

  const wait = () => {
    if ($("admin-panel")?.style.display === "block") init();
    else setTimeout(wait, 150);
  };

  wait();
})();
