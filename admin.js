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


function formatDate(date) {
  if (!date) {
    return "";
  }

  const parts = String(date).split("-");

  if (parts.length !== 3) {
    return String(date);
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function cloneDefaults() {
  return {
    ...DEFAULTS,
    slots: [...DEFAULTS.slots]
  };
}


/* =====================================================
   MENSAJE DE CONFIGURACIÓN
===================================================== */

function showSavedMessage(message, color = "") {
  const saved = $("saved");

  if (!saved) {
    return;
  }

  saved.hidden = false;
  saved.textContent = message;
  saved.style.color = color;
}


/* =====================================================
   APLICAR CONFIGURACIÓN AL FORMULARIO
===================================================== */

function applyConfigToForm(config) {
  const incoming =
    config && typeof config === "object"
      ? config
      : {};

  cfg = {
    ...cloneDefaults(),
    ...incoming
  };

  if (!Array.isArray(cfg.slots)) {
    cfg.slots = [...DEFAULTS.slots];
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
    Number($("gamePrice")?.value || 0);

  const hydrogelPrice =
    Number($("hydrogelPrice")?.value || 0);

  const deposit =
    Number($("deposit")?.value || 0);

  const minPlayers =
    Number($("minPlayers")?.value || 1);

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
    slots = $("slots")
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
    !Number.isFinite(config.gamePrice) ||
    config.gamePrice < 0
  ) {
    alert(
      "El precio de Paintball no es válido."
    );
    return false;
  }

  if (
    !Number.isFinite(config.hydrogelPrice) ||
    config.hydrogelPrice < 0
  ) {
    alert(
      "El precio de Hidrogel no es válido."
    );
    return false;
  }

  if (
    !Number.isFinite(config.deposit) ||
    config.deposit < 0
  ) {
    alert(
      "La seña no es válida."
    );
    return false;
  }

  if (
    !Number.isInteger(config.minPlayers) ||
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

    console.log(
      "AGUARÁ → CONFIGURACIÓN CARGADA:",
      cfg
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
    console.log(
      "AGUARÁ → CONFIGURACIÓN A ENVIAR:",
      next
    );

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
      typeof data.config === "object"
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

    console.log(
      "AGUARÁ → CONFIGURACIÓN GUARDADA:",
      cfg
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
          orderA - orderB
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

    console.log(
      "AGUARÁ → RESERVAS RECIBIDAS:",
      bookings
    );

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
          🔄 Reintentar
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

  if (
    status === "confirmed"
  ) {
    statusText =
      "CONFIRMADA";
  }

  if (
    status === "cancelled"
  ) {
    statusText =
      "CANCELADA";
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

  let statusClass =
    "booking-status-pending";

  if (
    status === "confirmed"
  ) {
    statusClass =
      "booking-status-confirmed";
  }

  if (
    status === "cancelled"
  ) {
    statusClass =
      "booking-status-cancelled";
  }

  let html = "";

  html += `
    <article
      class="admin-reservation ${statusClass}"
    >
  `;


  /* ===============================================
     ENCABEZADO
  =============================================== */

  html += `
    <div class="admin-reservation-header">

      <div>
        <div class="admin-reservation-date">
          📅
          ${escapeHtml(
            formatDate(bookingDate)
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
     INFORMACIÓN
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
        📝
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
     BOTONES
  =============================================== */

  html += `
    <div class="booking-actions">

      ${
        publicId
          ? `
            <button
              type="button"
              class="admin-action-btn admin-edit"
              onclick="editReservation('${escapeHtml(publicId)}')"
            >
              <span class="admin-action-icon">✏️</span>
              <span>Editar</span>
            </button>
          `
          : ""
      }

      ${
        publicId &&
        status !== "confirmed"
          ? `
            <button
              type="button"
              class="admin-action-btn admin-confirm"
              onclick="changeStatus('${escapeHtml(publicId)}', 'confirmed')"
            >
              <span class="admin-action-icon">✓</span>
              <span>Confirmar</span>
            </button>
          `
          : ""
      }

      ${
        publicId &&
        status !== "cancelled"
          ? `
            <button
              type="button"
              class="admin-action-btn admin-cancel"
              onclick="changeStatus('${escapeHtml(publicId)}', 'cancelled')"
            >
              <span class="admin-action-icon">✕</span>
              <span>Cancelar</span>
            </button>
          `
          : ""
      }

      ${
        publicId
          ? `
            <button
              type="button"
              class="admin-action-btn admin-delete"
              onclick="deleteReservation('${escapeHtml(publicId)}')"
            >
              <span class="admin-action-icon">🗑️</span>
              <span>Eliminar</span>
            </button>
          `
          : `
            <div class="booking-warning">
              Esta reserva no tiene public_id.
            </div>
          `
      }

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
    players < Number(cfg.minPlayers)
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

          cache: "no-store",

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

          cache: "no-store",

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

          cache: "no-store",

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


/* =====================================================
   INICIAR PANEL
===================================================== */

function bindEvents() {
  const configForm =
    $("configForm");

  if (!configForm) {
    return;
  }

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
