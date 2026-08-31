```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   ADMIN.JS
   CONFIGURACIÓN + RESERVAS
   EDITAR + CONFIRMAR + CANCELAR + ELIMINAR
   ORDEN: CONFIRMADAS → PENDIENTES → CANCELADAS
===================================================== */


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const DEFAULTS = {
  gamePrice: 29000,

  shotsText: "100 TIROS INCLUIDOS",

  hydrogelPrice: 0,

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


/* =====================================================
   HELPERS
===================================================== */

const $ = (id) =>
  document.getElementById(id);


function money(value) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(
    Number(value) || 0
  );
}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatDate(date) {

  if (!date) {
    return "";
  }

  const parts =
    String(date).split("-");

  if (parts.length !== 3) {
    return date;
  }

  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );
}


/* =====================================================
   CONFIGURACIÓN LOCAL
===================================================== */

function loadConfig() {

  try {

    return {
      ...DEFAULTS,

      ...JSON.parse(
        localStorage.getItem(
          "aguaraConfig"
        ) || "{}"
      )
    };

  } catch {

    return {
      ...DEFAULTS
    };

  }
}


const cfg =
  loadConfig();


/* =====================================================
   CARGAR CONFIGURACIÓN
===================================================== */

if ($("gamePrice")) {
  $("gamePrice").value =
    cfg.gamePrice;
}

if ($("shotsText")) {
  $("shotsText").value =
    cfg.shotsText;
}

if ($("hydrogelPrice")) {
  $("hydrogelPrice").value =
    cfg.hydrogelPrice;
}

if ($("hydrogelShotsText")) {
  $("hydrogelShotsText").value =
    cfg.hydrogelShotsText;
}

if ($("deposit")) {
  $("deposit").value =
    cfg.deposit;
}

if ($("minPlayers")) {
  $("minPlayers").value =
    cfg.minPlayers;
}

if ($("whatsapp")) {
  $("whatsapp").value =
    cfg.whatsapp;
}

if ($("slots")) {
  $("slots").value =
    cfg.slots.join(", ");
}


/* =====================================================
   GUARDAR CONFIGURACIÓN
===================================================== */

if ($("configForm")) {

  $("configForm")
    .addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const next = {

          gamePrice:
            Number(
              $("gamePrice").value
            ),

          shotsText:
            $("shotsText")
              .value
              .trim(),

          hydrogelPrice:
            Number(
              $("hydrogelPrice").value
            ),

          hydrogelShotsText:
            $("hydrogelShotsText")
              .value
              .trim(),

          deposit:
            Number(
              $("deposit").value
            ),

          minPlayers:
            Number(
              $("minPlayers").value
            ),

          whatsapp:
            $("whatsapp")
              .value
              .replace(/\D/g, ""),

          slots:
            $("slots")
              .value
              .split(",")
              .map(
                (x) =>
                  x.trim()
              )
              .filter(Boolean)
        };

        localStorage.setItem(
          "aguaraConfig",
          JSON.stringify(next)
        );

        if ($("saved")) {

          $("saved").hidden =
            false;

          $("saved").textContent =
            "Configuración guardada correctamente.";
        }

      }
    );
}


/* =====================================================
   ORDEN DE RESERVAS
   CONFIRMADAS → PENDIENTES → CANCELADAS
===================================================== */

function reservationStatusOrder(status) {

  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (normalized === "confirmed") {
    return 1;
  }

  if (normalized === "pending") {
    return 2;
  }

  if (normalized === "cancelled") {
    return 3;
  }

  return 4;
}


function sortReservations(bookings) {

  return [...bookings].sort(
    function (a, b) {

      const statusA =
        reservationStatusOrder(
          a.status
        );

      const statusB =
        reservationStatusOrder(
          b.status
        );

      return statusA - statusB;
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
    return;
  }

  container.innerHTML =
    "<p class='muted'>Cargando reservas...</p>";

  try {

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "GET",

          headers: {
            Accept:
              "application/json"
          }
        }
      );

    const text =
      await response.text();

    console.log(
      "RESPUESTA RESERVAS:",
      response.status,
      text
    );

    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch {

      data = {};

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

    const bookings =
      Array.isArray(
        data.reservas
      )
        ? data.reservas
        : [];

    if (!bookings.length) {

      container.innerHTML =
        "<p class='muted'>No hay reservas todavía.</p>";

      return;
    }

    /*
      ORDENAMOS SOLO LA VISUALIZACIÓN.

      No modificamos la base de datos.
      No modificamos fechas.
      No modificamos horarios.
    */

    const orderedBookings =
      sortReservations(
        bookings
      );

    container.innerHTML =
      orderedBookings
        .map(
          function (booking) {

            return reservationHtml(
              booking
            );

          }
        )
        .join("");

  } catch (error) {

    console.error(
      "ERROR CARGANDO RESERVAS:",
      error
    );

    container.innerHTML =
      `
      <div
        style="
          padding:20px;
          border:1px solid #663333;
          border-radius:10px;
        "
      >

        <strong>
          Error cargando reservas
        </strong>

        <p class="muted">
          ${escapeHtml(
            error.message ||
            "Error desconocido."
          )}
        </p>

        <button
          type="button"
          class="btn btn-primary"
          onclick="render()"
        >
          Reintentar
        </button>

      </div>
      `;
  }
}


/* =====================================================
   HTML DE RESERVA
===================================================== */

function reservationHtml(b) {

  const publicId =
    String(
      b.public_id ??
      ""
    ).trim();

  const status =
    String(
      b.status ??
      "pending"
    ).trim()
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


  /* -------------------------------------------------
     DATOS COMPATIBLES CON LA TABLA ACTUAL
  ------------------------------------------------- */

  const name =
    b.name ??
    b.nombre ??
    "Sin nombre";

  const phone =
    b.phone ??
    b.whatsapp ??
    "Sin teléfono";

  const bookingDate =
    b.booking_date ??
    b.fecha ??
    "";

  const bookingTime =
    b.booking_time ??
    b.horario ??
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
    b.notes ??
    b.observaciones ??
    "";


  /* -------------------------------------------------
     RESERVA ANTIGUA SIN PUBLIC_ID
  ------------------------------------------------- */

  const oldReservation =
    !publicId;


  /* -------------------------------------------------
     COLORES
  ------------------------------------------------- */

  let borderColor =
    "#333";

  let backgroundColor =
    "#111";

  if (
    status === "confirmed"
  ) {

    borderColor =
      "#22c55e";

    backgroundColor =
      "rgba(34,197,94,0.15)";
  }

  if (
    status === "cancelled"
  ) {

    borderColor =
      "#ef4444";

    backgroundColor =
      "rgba(239,68,68,0.10)";
  }


  return `

    <div
      class="admin-reservation"
      style="
        border:2px solid ${borderColor};
        border-radius:14px;
        padding:20px;
        margin-bottom:18px;
        background:${backgroundColor};
      "
    >

      <!-- CABECERA -->

      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:15px;
          flex-wrap:wrap;
          align-items:center;
          margin-bottom:15px;
        "
      >

        <strong
          style="
            font-size:18px;
          "
        >

          ${escapeHtml(
            formatDate(
              bookingDate
            )
          )}

          ·

          ${escapeHtml(
            bookingTime
          )}

        </strong>


        <span
          style="
            font-weight:bold;
          "
        >

          ${escapeHtml(
            statusText
          )}

        </span>

      </div>


      <!-- DATOS -->

      <div
        style="
          line-height:1.8;
        "
      >

        <strong>
          ${escapeHtml(name)}
        </strong>

        <br>

        📱
        ${escapeHtml(phone)}

        <br>

        👥
        ${escapeHtml(players)}
        jugadores

        <br>

        💰
        Seña:
        ${money(deposit)}

        <br>

        🎯
        Precio por jugador:
        ${money(gamePrice)}

        <br>

        🆔

        ${
          publicId
            ? escapeHtml(publicId)
            : "<span style='color:#ff5555'>SIN IDENTIFICADOR</span>"
        }

        ${
          notes
            ? `
              <br>
              📝
              ${escapeHtml(notes)}
            `
            : ""
        }

      </div>


      <!-- BOTONES -->

      <div
        style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:18px;
        "
      >

        ${
          !oldReservation
            ? `

              <button
                type="button"
                class="btn btn-outline"
                onclick="editReservation('${escapeHtml(publicId)}')"
              >
                ✏️ Editar
              </button>

            `
            : ""
        }


        ${
          !oldReservation &&
          status !== "confirmed"
            ? `

              <button
                type="button"
                class="btn btn-primary"
                onclick="changeStatus('${escapeHtml(publicId)}','confirmed')"
              >
                ✓ Confirmar
              </button>

            `
            : ""
        }


        ${
          !oldReservation &&
          status !== "cancelled"
            ? `

              <button
                type="button"
                class="btn btn-outline"
                onclick="changeStatus('${escapeHtml(publicId)}','cancelled')"
              >
                ✕ Cancelar
              </button>

            `
            : ""
        }


        ${
          !oldReservation
            ? `

              <button
                type="button"
                class="btn btn-outline"
                onclick="deleteReservation('${escapeHtml(publicId)}')"
              >
                🗑️ Eliminar
              </button>

            `
            : `

              <span
                style="
                  color:#ff7777;
                  font-size:14px;
                  align-self:center;
                "
              >
                Esta reserva antigua no tiene public_id.
              </span>

            `
        }

      </div>

    </div>

  `;
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
    players < cfg.minPlayers
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

    console.log(
      "RESPUESTA EDITAR:",
      response.status,
      text
    );

    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch {

      data = {};

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

    render();

  } catch (error) {

    console.error(
      "ERROR EDITANDO RESERVA:",
      error
    );

    alert(
      error.message ||
      "No se pudo editar la reserva."
    );
  }
}


/* =====================================================
   CONFIRMAR / CANCELAR
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

    console.log(
      "RESPUESTA ESTADO:",
      response.status,
      text
    );

    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch {

      data = {};

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

    /*
      Al volver a renderizar,
      sortReservations() la coloca
      automáticamente en su nueva posición.
    */

    render();

  } catch (error) {

    console.error(
      "ERROR CAMBIANDO ESTADO:",
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
      "Esta acción eliminará definitivamente " +
      "la reserva.\n\n" +
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

          body:
            JSON.stringify({

              public_id:
                publicId

            })
        }
      );

    const text =
      await response.text();

    console.log(
      "RESPUESTA ELIMINAR:",
      response.status,
      text
    );

    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch {

      data = {};

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

    render();

  } catch (error) {

    console.error(
      "ERROR ELIMINANDO RESERVA:",
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

window.editReservation =
  editReservation;

window.changeStatus =
  changeStatus;

window.deleteReservation =
  deleteReservation;


/* =====================================================
   INICIO
===================================================== */

console.log(
  "Aguará Paintball — admin.js cargado correctamente."
);

render();
```
