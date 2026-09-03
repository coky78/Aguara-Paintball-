(function () {
  "use strict";

  const DEFAULT_TEXT = "Elegí primero la fecha y después uno de los horarios disponibles. La seña es necesaria para confirmar la reserva.";

  function addStyles() {
    if (document.getElementById("booking-info-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "booking-info-admin-styles";
    style.textContent = `
      .booking-info-admin-box { margin-top: 22px; padding: 18px; border: 1px solid rgba(255,255,255,.10); border-radius: 14px; background: rgba(255,255,255,.025); }
      .booking-info-admin-box h3 { margin: 0 0 8px; }
      .booking-info-admin-box p { margin: 0 0 12px; color: #aaa; font-size: 13px; }
      .booking-info-admin-box textarea { width: 100%; min-height: 120px; box-sizing: border-box; resize: vertical; padding: 13px; border: 1px solid #444; border-radius: 9px; background: #171717; color: #fff; font: inherit; }
      .booking-info-admin-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .booking-info-admin-status { font-size:13px; color:#aaa; min-height:20px; }
      .booking-info-admin-status.ok { color:#22c55e !important; }
      .booking-info-admin-status.error { color:#ff7777 !important; }
    `;
    document.head.appendChild(style);
  }

  async function load() {
    const field = document.getElementById("bookingInfoText");
    const status = document.getElementById("bookingInfoStatus");
    if (!field) return;
    try {
      const response = await fetch("/api/booking-info?t=" + Date.now(), {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo cargar el texto.");
      field.value = data.text || DEFAULT_TEXT;
      if (status) { status.textContent = "✓ Texto guardado en la base de datos."; status.className = "booking-info-admin-status ok"; }
    } catch (error) {
      field.value = DEFAULT_TEXT;
      if (status) { status.textContent = "No se pudo cargar el texto guardado. Podés editarlo y volver a guardar."; status.className = "booking-info-admin-status error"; }
    }
  }

  async function save() {
    const field = document.getElementById("bookingInfoText");
    const button = document.getElementById("bookingInfoSave");
    const status = document.getElementById("bookingInfoStatus");
    if (!field || !button) return;

    const text = field.value.trim();
    if (!text) { alert("El texto no puede quedar vacío."); return; }

    button.disabled = true;
    status.textContent = "Guardando...";
    status.className = "booking-info-admin-status";
    try {
      const response = await fetch("/api/booking-info", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo guardar.");

      field.value = data.text || text;
      status.textContent = "✓ Texto guardado correctamente.";
      status.className = "booking-info-admin-status ok";
    } catch (error) {
      status.textContent = error.message || "No se pudo guardar.";
      status.className = "booking-info-admin-status error";
    } finally {
      button.disabled = false;
    }
  }

  function render() {
    const panel = document.getElementById("admin-panel");
    if (!panel || document.getElementById("bookingInfoAdmin")) return;

    const target = document.querySelector(".admin-dashboard-grid") || panel;
    addStyles();

    const box = document.createElement("section");
    box.id = "bookingInfoAdmin";
    box.className = "booking-card admin-full-card booking-info-admin-box";
    box.innerHTML = `
      <h2>Texto junto al calendario</h2>
      <p>Este texto aparece junto al calendario de reservas para orientar a tus clientes. Se guarda en Supabase y queda disponible en la web pública.</p>
      <textarea id="bookingInfoText" maxlength="1200" placeholder="Escribí aquí la información para tus clientes..."></textarea>
      <div class="booking-info-admin-actions">
        <button id="bookingInfoSave" type="button" class="btn btn-primary">Guardar texto</button>
        <span id="bookingInfoStatus" class="booking-info-admin-status"></span>
      </div>
    `;
    target.appendChild(box);

    document.getElementById("bookingInfoSave").addEventListener("click", save);
    load();
  }

  function waitForPanel() {
    const panel = document.getElementById("admin-panel");
    if (panel && panel.style.display !== "none") {
      render();
      return;
    }
    setTimeout(waitForPanel, 100);
  }

  waitForPanel();
})();
