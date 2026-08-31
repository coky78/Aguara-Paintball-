/* =====================================================
   AGUARÁ PAINTBALL
   ADMIN.JS
   RESERVAS + CONFIGURACIÓN
   BOTONES PROFESIONALES
===================================================== */

const DEFAULTS = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",

  hydrogelPrice: 25000,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",

  deposit: 50000,
  minPlayers: 10,

  whatsapp: "5493794250285",

  slots: [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00"
  ]
};

let cfg = {
  ...DEFAULTS,
  slots: [...DEFAULTS.slots]
};

let adminInitialized = false;
let configLoaded = false;
let reservationsLoaded = false;


/* =====================================================
   ESTILO PROFESIONAL
   Se inyecta desde admin.js
===================================================== */

function injectAdminStyles() {
  if (document.getElementById("aguara-admin-button-styles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "aguara-admin-button-styles";

  style.textContent = `
    .booking-actions {
      display: flex !important;
      gap: 10px !important;
      flex-wrap: wrap !important;
      margin-top: 20px !important;
      padding-top: 16px !important;
      border-top: 1px solid rgba(255,255,255,.08) !important;
    }

    .admin-action-btn {
      appearance: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;

      min-height: 46px !important;
      padding: 12px 17px !important;

      border-radius: 11px !important;
      border: 1px solid rgba(255,255,255,.14) !important;

      color: #fff !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 800 !important;
      letter-spacing: .15px !important;
      line-height: 1 !important;

      cursor: pointer !important;

      box-shadow:
        0 7px 18px rgba(0,0,0,.28),
        inset 0 1px 0 rgba(255,255,255,.06) !important;

      transition:
        transform .16s ease,
        filter .16s ease,
        box-shadow .16s ease,
        border-color .16s ease !important;
    }

    .admin-action-btn:hover {
      transform: translateY(-2px) !important;
      filter: brightness(1.1) !important;

      box-shadow:
        0 11px 25px rgba(0,0,0,.38),
        inset 0 1px 0 rgba(255,255,255,.08) !important;
    }

    .admin-action-btn:active {
      transform: translateY(0) scale(.98) !important;

      box-shadow:
        0 5px 12px rgba(0,0,0,.25) !important;
    }

    .admin-action-btn:focus-visible {
      outline: 2px solid rgba(255,255,255,.9) !important;
      outline-offset: 3px !important;
    }

    .admin-action-icon {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      width: 22px !important;
      height: 22px !important;

      font-size: 17px !important;
      line-height: 1 !important;
    }

    .admin-edit {
      background:
        linear-gradient(
          180deg,
          #3b3b3b 0%,
          #252525 100%
        ) !important;

      border-color: #5a5a5a !important;
    }

    .admin-confirm {
      background:
        linear-gradient(
          180deg,
          #22a447 0%,
          #127332 100%
        ) !important;

      border-color: #39d66a !important;
    }

    .admin-cancel {
      background:
        linear-gradient(
          180deg,
          #d68a18 0%,
          #a85d08 100%
        ) !important;

      border-color: #f5b642 !important;
    }

    .admin-delete {
      background:
        linear-gradient(
          180deg,
          #dc3b3b 0%,
          #9f2020 100%
        ) !important;

      border-color: #f06464 !important;
    }

    .admin-retry {
      background:
        linear-gradient(
          180deg,
          #414141 0%,
          #272727 100%
        ) !important;
    }

    .admin-reservation {
      position: relative !important;
      overflow: hidden !important;

      border-radius: 16px !important;
      margin-bottom: 18px !important;
      padding: 20px !important;

      box-shadow:
        0 12px 30px rgba(0,0,0,.22) !important;
    }

    .admin-reservation-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 15px !important;
      flex-wrap: wrap !important;

      margin-bottom: 16px !important;
      padding-bottom: 14px !important;

      border-bottom: 1px solid rgba(255,255,255,.08) !important;
    }

    .admin-reservation-date {
      font-size: 18px !important;
      font-weight: 900 !important;
      color: #fff !important;
    }

    .admin-reservation-time {
      margin-top: 5px !important;

      font-size: 15px !important;
      font-weight: 700 !important;
      color: #d0d0d0 !important;
    }

    .admin-status-badge {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      padding: 8px 12px !important;

      border-radius: 999px !important;

      font-size: 11px !important;
      font-weight: 900 !important;
      letter-spacing: .6px !important;

      background: rgba(255,255,255,.06) !important;
      border: 1px solid rgba(255,255,255,.12) !important;
    }

    .booking-status-confirmed {
      border-color: rgba(34,197,94,.55) !important;
    }

    .booking-status-pending {
      border-color: rgba(255,255,255,.14) !important;
    }

    .booking-status-cancelled {
      border-color: rgba(239,68,68,.55) !important;
    }

    .admin-reservation-info {
      line-height: 1.75 !important;
    }

    .admin-reservation-name {
      margin-bottom: 8px !important;

      font-size: 18px !important;
      font-weight: 900 !important;
      color: #fff !important;
    }

    .admin-reservation-row {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;

      color: #dedede !important;
    }

    .admin-reservation-id {
      margin-top: 10px !important;

      color: #999 !important;
      font-size: 12px !important;
      word-break: break-all !important;
    }

    .admin-reservation-notes {
      display: flex !important;
      gap: 7px !important;

      margin-top: 9px !important;
      padding-top: 9px !important;

      border-top: 1px solid rgba(255,255,255,.06) !important;

      color: #cfcfcf !important;
    }

    .booking-warning {
      padding: 10px 12px !important;

      border-radius: 9px !important;

      color: #ff8a8a !important;
      background: rgba(239,68,68,.08) !important;
      border: 1px solid rgba(239,68,68,.22) !important;

      font-size: 13px !important;
    }

    @media (max-width: 640px) {
      .booking-actions {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      .admin-action-btn {
        width: 100% !important;
        min-height: 48px !important;
      }
    }

    @media (max-width: 420px) {
      .booking-actions {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  document.head.appendChild(style);
}


/* =====================================================
   UTILIDADES
===================================================== */

function $(id) {
  return document.getElementById(id);
}


function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
  return escapeHtml(value);
}


function formatDate(date) {
  if (!date) {
    return "";
  }

  const parts =
    String(date).split("-");

  if (parts.length !== 3) {
    return String(date);
  }

  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );
}


function cloneDefaults() {
  return {
    ...DEFAULTS,
    slots: [...DEFAULTS.slots]
  };
}


/* =====================================================
   MENSAJE
===================================================== */

function showSavedMessage(
  message,
  color = ""
) {
  const saved =
    $("saved");

  if (!saved) {
    return;
  }

  saved.hidden = false;
  saved.textContent = message;
  saved.style.color = color;
}


/* =====================================================
   APLICAR CONFIGURACIÓN
===================================================== */

function applyConfigToForm(config) {
  const incoming =
    config &&
    typeof config === "object"
      ? config
      : {};

  cfg = {
    ...cloneDefaults(),
    ...incoming
  };

  if (!Array.isArray(cfg.slots)) {
    cfg.slots =
      [...DEFAULTS.slots];
  }

  if ($("gamePrice")) {
    $("gamePrice").value =
      Number(cfg.gamePrice) || 0;
  }

  if ($("shotsText")) {
    $("shotsText").value =
      cfg.shotsText ??
      DEFAULTS.shotsText;
  }

  if ($("hydrogelPrice")) {
    $("hydrogelPrice").value =
      Number(cfg.hydrogelPrice) || 0;
  }

  if ($("hydrogelShotsText")) {
    $("hydrogelShotsText").value =
      cfg.hydrogelShotsText ??
      DEFAULTS.hydrogelShotsText;
  }

  if ($("deposit")) {
    $("deposit").value =
      Number(cfg.deposit) || 0;
  }

  if ($("minPlayers")) {
    $("minPlayers").value =
      Number(cfg.minPlayers) ||
      DEFAULTS.minPlayers;
  }

  if ($("whatsapp")) {
    $("whatsapp").value =
      String(cfg.whatsapp || "");
  }

  if ($("slots")) {
    $("slots").value =
      cfg.slots.join(", ");
  }

  console.log(
    "AGUARÁ → CONFIGURACIÓN APLICADA:",
    cfg
  );
}


/* =====================================================
   LEER CONFIGURACIÓN
===================================================== */

function readConfigFromForm() {
  const gamePrice =
    Number(
      $("gamePrice")?.value || 0
    );

  const hydrogelPrice =
    Number(
      $("hydrogelPrice")?.value || 0
    );

  const deposit =
    Number(
      $("deposit")?.value || 0
    );

  const minPlayers =
    Number(
      $("minPlayers")?.value || 1
    );

  const shotsText =
    $("shotsText")
      ? $("shotsText").value.trim()
      : DEFAULTS.shotsText;

  const hydrogelShotsText =
    $("hydrogelShotsText")
      ? $("hydrogelShotsText")
          .value
          .trim()
      : DEFAULTS.hydrogelShotsText;

  const whatsapp =
    $("whatsapp")
      ? $("whatsapp")
          .value
          .replace(/\D/g, "")
      : DEFAULTS.whatsapp;

  let slots = [];

  if ($("slots")) {
    slots =
      $("slots")
        .value
        .split(",")
        .map(function (slot) {
          return slot.trim();
        })
        .filter(Boolean);
  }

  return {
    gamePrice,
    shotsText,
    hydrogelPrice,
    hydrogelShotsText,
    deposit,
    minPlayers,
    whatsapp,
    slots
  };
}


/* =====================================================
   VALIDAR CONFIGURACIÓN
===================================================== */

function validateConfig(config) {
  if (
    !Number.isFinite(
      config.gamePrice
    ) ||
    config.gamePrice < 0
  ) {
    alert(
      "El precio de Paintball no es válido."
    );
    return false;
  }

  if (
    !Number.isFinite(
      config.hydrogelPrice
    ) ||
    config.hydrogelPrice < 0
  ) {
    alert(
      "El precio de Hidrogel no es válido."
    );
    return false;
  }

  if (
    !Number.isFinite(
      config.deposit
    ) ||
    config.deposit < 0
  ) {
    alert(
      "La seña no es válida."
    );
    return false;
  }

  if (
    !Number.isInteger(
      config.minPlayers
    ) ||
    config.minPlayers < 1
  ) {
    alert(
      "El mínimo de jugadores no es válido."
    );
    return false;
  }

  if (
    !Array.isArray(config.slots) ||
    config.slots.length === 0
  ) {
    alert(
      "Debe existir al menos un horario."
    );
    return false;
  }

  for (const slot of config.slots) {
    if (
      !/^\d{2}:\d{2}$/.test(slot)
    ) {
      alert(
        `El horario "${slot}" no tiene formato HH:MM.`
      );
      return false;
    }

    const [hours, minutes] =
      slot.split(":").map(Number);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      alert(
        `El horario "${slot}" no es válido.`
      );
      return false;
    }
  }

  return true;
}


/* =====================================================
   CARGAR CONFIGURACIÓN
===================================================== */

async function loadConfig() {
  console.log(
    "AGUARÁ ADMIN → Cargando configuración..."
  );

  try {
    const response =
      await fetch(
        "/api/config",
        {
          method: "GET",

          headers: {
            Accept:
              "application/json"
          },

          cache: "no-store",

          credentials:
            "same-origin"
        }
      );

    const text =
      await response.text();

    console.log(
      "AGUARÁ → RESPUESTA CONFIG:",
      response.status,
      text
    );

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API de configuración no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudo cargar la configuración."
      );
    }

    const config =
      data.config ||
      data.configuracion ||
      data.data ||
      {};

    applyConfigToForm(config);

    configLoaded = true;

    showSavedMessage(
      "Configuración cargada correctamente.",
      "#22c55e"
    );

    return cfg;

  } catch (error) {
    console.error(
      "AGUARÁ → ERROR CARGANDO CONFIGURACIÓN:",
      error
    );

    if (!configLoaded) {
      applyConfigToForm(
        cloneDefaults()
      );
    }

    showSavedMessage(
      "No se pudo cargar la configuración: " +
      (
        error.message ||
        "Error desconocido."
      ),
      "#ff7777"
    );

    return cfg;
  }
}


/* =====================================================
   GUARDAR CONFIGURACIÓN
===================================================== */

async function saveConfig() {
  const next =
    readConfigFromForm();

  if (!validateConfig(next)) {
    return;
  }

  showSavedMessage(
    "Guardando configuración...",
    ""
  );

  try {
    const response =
      await fetch(
        "/api/config",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json"
          },

          cache: "no-store",

          credentials:
            "same-origin",

          body:
            JSON.stringify(next)
        }
      );

    const text =
      await response.text();

    console.log(
      "AGUARÁ → RESPUESTA GUARDAR CONFIG:",
      response.status,
      text
    );

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API de configuración no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudo guardar la configuración."
      );
    }

    if (
      data.config &&
      typeof data.config ===
        "object"
    ) {
      applyConfigToForm(
        data.config
      );
    } else {
      applyConfigToForm(
        next
      );
    }

    configLoaded = true;

    showSavedMessage(
      "Configuración guardada correctamente.",
      "#22c55e"
    );

  } catch (error) {
    console.error(
      "AGUARÁ → ERROR GUARDANDO CONFIGURACIÓN:",
      error
    );

    showSavedMessage(
      error.message ||
      "No se pudo guardar la configuración.",
      "#ff7777"
    );

    alert(
      error.message ||
      "No se pudo guardar la configuración."
    );
  }
}


/* =====================================================
   ORDENAR RESERVAS
===================================================== */

function sortBookings(bookings) {
  const statusOrder = {
    confirmed: 0,
    pending: 1,
    cancelled: 2
  };

  return bookings.sort(
    function (a, b) {
      const statusA =
        String(
          a.status ||
          "pending"
        )
          .trim()
          .toLowerCase();

      const statusB =
        String(
          b.status ||
          "pending"
        )
          .trim()
          .toLowerCase();

      const orderA =
        statusOrder[statusA] ?? 1;

      const orderB =
        statusOrder[statusB] ?? 1;

      if (
        orderA !== orderB
      ) {
        return (
          orderA -
          orderB
        );
      }

      const dateA =
        String(
          a.booking_date ||
          a.fecha ||
          ""
        );

      const dateB =
        String(
          b.booking_date ||
          b.fecha ||
          ""
        );

      if (
        dateA !== dateB
      ) {
        return dateA.localeCompare(
          dateB
        );
      }

      const timeA =
        String(
          a.booking_time ||
          a.horario ||
          ""
        );

      const timeB =
        String(
          b.booking_time ||
          b.horario ||
          ""
        );

      return timeA.localeCompare(
        timeB
      );
    }
  );
}


/* =====================================================
   CARGAR RESERVAS
===================================================== */

async function render() {
  const container =
    $("bookings");

  if (!container) {
    console.error(
      "No existe #bookings en admin.html."
    );
    return;
  }

  container.innerHTML = `
    <div class="admin-loading">
      Cargando reservas...
    </div>
  `;

  try {
    const response =
      await fetch(
        "/api/reservations",
        {
          method: "GET",

          headers: {
            Accept:
              "application/json"
          },

          cache: "no-store",

          credentials:
            "same-origin"
        }
      );

    const text =
      await response.text();

    console.log(
      "AGUARÁ → RESPUESTA RESERVAS:",
      response.status,
      text
    );

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API de reservas no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudieron cargar las reservas."
      );
    }

    let bookings = [];

    if (
      Array.isArray(
        data.reservas
      )
    ) {
      bookings =
        data.reservas;

    } else if (
      Array.isArray(
        data.reservations
      )
    ) {
      bookings =
        data.reservations;

    } else if (
      Array.isArray(
        data.data
      )
    ) {
      bookings =
        data.data;

    } else if (
      Array.isArray(data)
    ) {
      bookings =
        data;
    }

    reservationsLoaded = true;

    if (
      bookings.length === 0
    ) {
      container.innerHTML = `
        <div class="admin-empty">
          No hay reservas todavía.
        </div>
      `;

      return;
    }

    bookings =
      sortBookings(
        bookings
      );

    container.innerHTML =
      bookings
        .map(function (booking) {
          return reservationHtml(
            booking
          );
        })
        .join("");

  } catch (error) {
    console.error(
      "AGUARÁ → ERROR CARGANDO RESERVAS:",
      error
    );

    container.innerHTML = `
      <div class="admin-error">
        <strong>
          Error cargando reservas
        </strong>

        <p>
          ${escapeHtml(
            error.message ||
            "Error desconocido."
          )}
        </p>

        <button
          type="button"
          class="admin-action-btn admin-retry"
          onclick="render()"
        >
          <span class="admin-action-icon">🔄</span>
          <span>Reintentar</span>
        </button>
      </div>
    `;
  }
}


/* =====================================================
   MOSTRAR RESERVA
===================================================== */

function reservationHtml(b) {
  const publicId =
    String(
      b.public_id ||
      ""
    ).trim();

  const status =
    String(
      b.status ||
      "pending"
    )
      .trim()
      .toLowerCase();

  let statusText =
    "PENDIENTE";

  let statusClass =
    "booking-status-pending";

  if (
    status === "confirmed"
  ) {
    statusText =
      "CONFIRMADA";

    statusClass =
      "booking-status-confirmed";
  }

  if (
    status === "cancelled"
  ) {
    statusText =
      "CANCELADA";

    statusClass =
      "booking-status-cancelled";
  }

  const name =
    b.name ||
    b.nombre ||
    "Sin nombre";

  const phone =
    b.phone ||
    b.whatsapp ||
    "Sin teléfono";

  const bookingDate =
    b.booking_date ||
    b.fecha ||
    "";

  const bookingTime =
    b.booking_time ||
    b.horario ||
    "";

  const players =
    b.players ??
    b.jugadores ??
    0;

  const deposit =
    b.deposit_amount ??
    b.sena_requerida ??
    0;

  const gamePrice =
    b.game_price ??
    b.precio_por_jugador ??
    0;

  const notes =
    b.notes ||
    b.observaciones ||
    "";

  const borderColor =
    status === "confirmed"
      ? "#22c55e"
      : status === "cancelled"
        ? "#ef4444"
        : "#444";

  const backgroundColor =
    status === "confirmed"
      ? "rgba(34,197,94,0.10)"
      : status === "cancelled"
        ? "rgba(239,68,68,0.08)"
        : "#111";

  let html = "";

  html += `
    <article
      class="admin-reservation ${statusClass}"
      style="
        border: 1px solid ${borderColor};
        background: ${backgroundColor};
      "
    >
  `;


  /* ===============================================
     CABECERA
  =============================================== */

  html += `
    <div class="admin-reservation-header">

      <div>

        <div class="admin-reservation-date">
          📅
          ${escapeHtml(
            formatDate(
              bookingDate
            )
          )}
        </div>

        <div class="admin-reservation-time">
          🕐
          ${escapeHtml(
            bookingTime
          )}
        </div>

      </div>


      <span
        class="admin-status-badge ${statusClass}"
      >
        ${escapeHtml(
          statusText
        )}
      </span>

    </div>
  `;


  /* ===============================================
     DATOS
  =============================================== */

  html += `
    <div class="admin-reservation-info">

      <div class="admin-reservation-name">
        ${escapeHtml(name)}
      </div>

      <div class="admin-reservation-row">
        <span>📱</span>
        <span>
          ${escapeHtml(phone)}
        </span>
      </div>

      <div class="admin-reservation-row">
        <span>👥</span>
        <span>
          ${escapeHtml(players)}
          jugadores
        </span>
      </div>

      <div class="admin-reservation-row">
        <span>💰</span>
        <span>
          Seña:
          <strong>
            ${money(deposit)}
          </strong>
        </span>
      </div>

      <div class="admin-reservation-row">
        <span>🎯</span>
        <span>
          Precio por jugador:
          <strong>
            ${money(gamePrice)}
          </strong>
        </span>
      </div>
  `;


  if (publicId) {
    html += `
      <div class="admin-reservation-id">
        🆔 ${escapeHtml(publicId)}
      </div>
    `;
  }


  if (notes) {
    html += `
      <div class="admin-reservation-notes">
        <span>📝</span>
        <span>
          ${escapeHtml(notes)}
        </span>
      </div>
    `;
  }


  html += `
    </div>
  `;


  /* ===============================================
     BOTONES PROFESIONALES
  =============================================== */

  html += `
    <div class="booking-actions">
  `;


  if (publicId) {

    html += `
      <button
        type="button"
        class="admin-action-btn admin-edit"
        onclick="editReservation('${escapeAttribute(publicId)}')"
      >
        <span class="admin-action-icon">
          ✏️
        </span>

        <span>
          Editar
        </span>
      </button>
    `;


    if (
      status !== "confirmed"
    ) {

      html += `
        <button
          type="button"
          class="admin-action-btn admin-confirm"
          onclick="changeStatus('${escapeAttribute(publicId)}', 'confirmed')"
        >
          <span class="admin-action-icon">
            ✓
          </span>

          <span>
            Confirmar
          </span>
        </button>
      `;

    }


    if (
      status !== "cancelled"
    ) {

      html += `
        <button
          type="button"
          class="admin-action-btn admin-cancel"
          onclick="changeStatus('${escapeAttribute(publicId)}', 'cancelled')"
        >
          <span class="admin-action-icon">
            ✕
          </span>

          <span>
            Cancelar
          </span>
        </button>
      `;

    }


    html += `
      <button
        type="button"
        class="admin-action-btn admin-delete"
        onclick="deleteReservation('${escapeAttribute(publicId)}')"
      >
        <span class="admin-action-icon">
          🗑️
        </span>

        <span>
          Eliminar
        </span>
      </button>
    `;

  } else {

    html += `
      <div class="booking-warning">
        Esta reserva no tiene public_id.
      </div>
    `;

  }


  html += `
    </div>
  `;


  html += `
    </article>
  `;

  return html;
}


/* =====================================================
   EDITAR RESERVA
===================================================== */

async function editReservation(
  publicId
) {
  if (!publicId) {
    alert(
      "Falta el identificador de la reserva."
    );
    return;
  }

  const nombre =
    prompt(
      "Nombre y apellido:"
    );

  if (
    nombre === null
  ) {
    return;
  }

  const name =
    nombre.trim();

  if (!name) {
    alert(
      "El nombre no puede estar vacío."
    );
    return;
  }

  const telefono =
    prompt(
      "Número de WhatsApp:"
    );

  if (
    telefono === null
  ) {
    return;
  }

  const phone =
    telefono.trim();

  if (!phone) {
    alert(
      "El teléfono no puede estar vacío."
    );
    return;
  }

  const fecha =
    prompt(
      "Fecha (AAAA-MM-DD):"
    );

  if (
    fecha === null
  ) {
    return;
  }

  const bookingDate =
    fecha.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      bookingDate
    )
  ) {
    alert(
      "La fecha no es válida."
    );
    return;
  }

  const hora =
    prompt(
      "Horario (HH:MM):"
    );

  if (
    hora === null
  ) {
    return;
  }

  const bookingTime =
    hora.trim();

  if (
    !/^\d{2}:\d{2}$/.test(
      bookingTime
    )
  ) {
    alert(
      "El horario no es válido."
    );
    return;
  }

  const jugadores =
    prompt(
      "Cantidad de jugadores:"
    );

  if (
    jugadores === null
  ) {
    return;
  }

  const players =
    Number(jugadores);

  if (
    !Number.isInteger(players) ||
    players <
      Number(cfg.minPlayers)
  ) {
    alert(
      "La reserva requiere un mínimo de " +
      cfg.minPlayers +
      " jugadores."
    );
    return;
  }

  const notas =
    prompt(
      "Observaciones:",
      ""
    );

  if (
    notas === null
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json"
          },

          cache:
            "no-store",

          credentials:
            "same-origin",

          body:
            JSON.stringify({
              public_id:
                publicId,

              name:
                name,

              phone:
                phone,

              booking_date:
                bookingDate,

              booking_time:
                bookingTime,

              players:
                players,

              notes:
                notas.trim()
            })
        }
      );

    const text =
      await response.text();

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudo editar la reserva."
      );
    }

    alert(
      "Reserva actualizada correctamente."
    );

    await render();

  } catch (error) {

    console.error(
      "AGUARÁ → ERROR EDITANDO RESERVA:",
      error
    );

    alert(
      error.message ||
      "No se pudo editar la reserva."
    );
  }
}


/* =====================================================
   CAMBIAR ESTADO
===================================================== */

async function changeStatus(
  publicId,
  status
) {
  if (!publicId) {
    alert(
      "Falta el identificador de la reserva."
    );
    return;
  }

  if (
    status !== "confirmed" &&
    status !== "cancelled"
  ) {
    alert(
      "Estado de reserva no válido."
    );
    return;
  }

  const texto =
    status === "confirmed"
      ? "¿Confirmar esta reserva?"
      : "¿Cancelar esta reserva?";

  if (
    !confirm(texto)
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json"
          },

          cache:
            "no-store",

          credentials:
            "same-origin",

          body:
            JSON.stringify({
              public_id:
                publicId,

              status:
                status
            })
        }
      );

    const text =
      await response.text();

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudo cambiar el estado."
      );
    }

    alert(
      status === "confirmed"
        ? "Reserva confirmada correctamente."
        : "Reserva cancelada correctamente."
    );

    await render();

  } catch (error) {

    console.error(
      "AGUARÁ → ERROR CAMBIANDO ESTADO:",
      error
    );

    alert(
      error.message ||
      "No se pudo cambiar el estado."
    );
  }
}


/* =====================================================
   ELIMINAR RESERVA
===================================================== */

async function deleteReservation(
  publicId
) {
  if (!publicId) {
    alert(
      "Falta el identificador de la reserva."
    );
    return;
  }

  const confirmar =
    confirm(
      "¿ESTÁS SEGURO?\n\n" +
      "Esta acción eliminará definitivamente la reserva.\n\n" +
      "No se puede deshacer."
    );

  if (!confirmar) {
    return;
  }

  try {

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json"
          },

          cache:
            "no-store",

          credentials:
            "same-origin",

          body:
            JSON.stringify({
              public_id:
                publicId
            })
        }
      );

    const text =
      await response.text();

    let data = {};

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "La API no devolvió JSON válido."
      );
    }

    if (
      !response.ok ||
      !data.ok
    ) {
      throw new Error(
        data.message ||
        "No se pudo eliminar la reserva."
      );
    }

    alert(
      "Reserva eliminada correctamente."
    );

    await render();

  } catch (error) {

    console.error(
      "AGUARÁ → ERROR ELIMINANDO RESERVA:",
      error
    );

    alert(
      error.message ||
      "No se pudo eliminar la reserva."
    );
  }
}


/* =====================================================
   FUNCIONES GLOBALES
===================================================== */

window.render =
  render;

window.loadConfig =
  loadConfig;

window.saveConfig =
  saveConfig;

window.editReservation =
  editReservation;

window.changeStatus =
  changeStatus;

window.deleteReservation =
  deleteReservation;

window.initAdmin =
  initAdmin;


/* =====================================================
   INICIAR PANEL
===================================================== */

function bindEvents() {
  const configForm =
    $("configForm");

  if (!configForm) {
    return;
  }

  /*
    Evitamos registrar el mismo evento
    más de una vez.
  */

  if (
    configForm.dataset.aguaraBound ===
    "true"
  ) {
    return;
  }

  configForm.dataset.aguaraBound =
    "true";

  configForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      saveConfig();
    }
  );
}


async function initAdmin() {
  if (adminInitialized) {
    return;
  }

  adminInitialized = true;

  injectAdminStyles();

  console.log(
    "===================================="
  );

  console.log(
    "AGUARÁ PAINTBALL"
  );

  console.log(
    "ADMINISTRACIÓN INICIADA"
  );

  console.log(
    "===================================="
  );

  bindEvents();

  await loadConfig();

  await render();
}


/* =====================================================
   INICIO
===================================================== */

console.log(
  "Aguará Paintball — admin.js cargado correctamente."
);


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      initAdmin();
    }
  );

} else {

  initAdmin();

}
