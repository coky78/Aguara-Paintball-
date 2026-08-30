```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   ADMIN.JS
   CONFIGURACIÓN + RESERVAS
   EDITAR + CONFIRMAR + CANCELAR + ELIMINAR
   SOPORTE PARA RESERVAS ANTIGUAS SIN PUBLIC_ID
===================================================== */


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const DEFAULTS = {
  gamePrice: 29000,

  shotsText:
    "100 TIROS INCLUIDOS",

  hydrogelPrice: 0,

  hydrogelShotsText:
    "MUNICIÓN INCLUIDA",

  deposit: 50000,

  minPlayers: 10,

  whatsapp:
    "5493794250285",

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
   IDENTIFICADOR DE RESERVA
===================================================== */

/*
   Las reservas nuevas tienen public_id.

   La reserva antigua que quedó sin public_id
   puede utilizar el id interno de Supabase.

   NO modificamos los datos.
   Solo elegimos qué identificador enviar a la API.
*/

function getReservationId(b) {

  if (
    b &&
    b.public_id !== null &&
    b.public_id !== undefined &&
    String(b.public_id).trim() !== ""
  ) {

    return {
      type: "public_id",
      value: String(b.public_id).trim()
    };

  }


  if (
    b &&
    b.id !== null &&
    b.id !== undefined &&
    String(b.id).trim() !== ""
  ) {

    return {
      type: "id",
      value: String(b.id).trim()
    };

  }


  return null;
}


/* =====================================================
   CONFIG LOCAL
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
                (x) => x.trim()
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
   RESERVAS
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


    container.innerHTML =
      bookings
        .map(
          (booking) =>
            reservationHtml(
              booking
            )
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
        <strong>Error cargando reservas</strong>

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
   HTML DE CADA RESERVA
===================================================== */

function reservationHtml(b) {

  const status =
    String(
      b.status || "pending"
    );


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


  const identifier =
    getReservationId(b);


  const identifierValue =
    identifier
      ? identifier.value
      : "";


  const identifierType =
    identifier
      ? identifier.type
      : "";


  const hasIdentifier =
    Boolean(identifier);


  return `

    <div
      class="admin-reservation"
      style="
        border:1px solid #333;
        border-radius:14px;
        padding:20px;
        margin-bottom:18px;
        background:#111;
      "
    >

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
              b.booking_date
            )
          )}
          ·
          ${escapeHtml(
            b.booking_time
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


      <div
        style="
          line-height:1.8;
        "
      >

        <strong>
          ${escapeHtml(
            b.name
          )}
        </strong>

        <br>

        📱
        ${escapeHtml(
          b.phone
        )}

        <br>

        👥
        ${escapeHtml(
          b.players
        )}
        jugadores

        <br>

        💰
        Seña:
        ${money(
          b.deposit_amount
        )}

        <br>

        🎯
        Precio por jugador:
        ${money(
          b.game_price
        )}

        <br>

        🆔
        ${
          b.public_id
            ? escapeHtml(b.public_id)
            : "Reserva antigua — usando ID interno"
        }

        ${
          b.notes
            ? `
              <br>
              📝
              ${escapeHtml(
                b.notes
              )}
            `
            : ""
        }

      </div>


      <div
        style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:18px;
        "
      >

        ${
          hasIdentifier
            ? `
              <button
                type="button"
                class="btn btn-outline"
                onclick="editReservation(
                  '${escapeHtml(identifierValue)}',
                  '${escapeHtml(identifierType)}'
                )"
              >
                ✏️ Editar
              </button>
            `
            : ""
        }


        ${
          hasIdentifier &&
          status !== "confirmed"
            ? `
              <button
                type="button"
                class="btn btn-primary"
                onclick="changeStatus(
                  '${escapeHtml(identifierValue)}',
                  '${escapeHtml(identifierType)}',
                  'confirmed'
                )"
              >
                ✓ Confirmar
              </button>
            `
            : ""
        }


        ${
          hasIdentifier &&
          status !== "cancelled"
            ? `
              <button
                type="button"
                class="btn btn-outline"
                onclick="changeStatus(
                  '${escapeHtml(identifierValue)}',
                  '${escapeHtml(identifierType)}',
                  'cancelled'
                )"
              >
                ✕ Cancelar
              </button>
            `
            : ""
        }


        ${
          hasIdentifier
            ? `
              <button
                type="button"
                class="btn btn-outline"
                onclick="deleteReservation(
                  '${escapeHtml(identifierValue)}',
                  '${escapeHtml(identifierType)}'
                )"
              >
                🗑️ Eliminar
              </button>
            `
            : `
              <span style="color:#ff7777">
                Esta reserva no tiene identificador disponible.
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
  identifier,
  identifierType = "public_id"
) {

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
    Number(
      jugadores
    );


  if (
    !Number.isInteger(
      players
    ) ||
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

    const body = {

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

    };


    if (
      identifierType === "id"
    ) {

      body.id =
        identifier;

    } else {

      body.public_id =
        identifier;

    }


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
            JSON.stringify(body)
        }
      );


    const text =
      await response.text();


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
   CAMBIAR ESTADO
===================================================== */

async function changeStatus(
  identifier,
  identifierType,
  status
) {

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

    const body = {

      status:
        status

    };


    if (
      identifierType === "id"
    ) {

      body.id =
        identifier;

    } else {

      body.public_id =
        identifier;

    }


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
            JSON.stringify(body)
        }
      );


    const text =
      await response.text();


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
  identifier,
  identifierType = "public_id"
) {

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

    const body = {};


    if (
      identifierType === "id"
    ) {

      body.id =
        identifier;

    } else {

      body.public_id =
        identifier;

    }


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
            JSON.stringify(body)
        }
      );


    const text =
      await response.text();


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
   FUNCIONES DISPONIBLES PARA LOS BOTONES
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
  "Aguará Paintball — admin.js cargado."
);


render();
```
