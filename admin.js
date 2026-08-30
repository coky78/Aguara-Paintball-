```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   ADMIN.JS
   CONFIGURACIÓN + RESERVAS
   EDITAR + ELIMINAR
===================================================== */


const DEFAULTS = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",
  hydrogelPrice: 0,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",
  deposit: 50000,
  minPlayers: 10,
  whatsapp: "5493794250285",

  /* HORARIOS — NO MODIFICAR */
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
   UTILIDADES
===================================================== */

const $ = (id) =>
  document.getElementById(id);


function money(n) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   CONFIGURACIÓN
===================================================== */

function loadConfig() {

  try {

    return {
      ...DEFAULTS,
      ...JSON.parse(
        localStorage.getItem("aguaraConfig") || "{}"
      )
    };

  } catch {

    return {
      ...DEFAULTS
    };

  }

}


const cfg = loadConfig();


/* =====================================================
   CARGAR CONFIGURACIÓN
===================================================== */

if ($("gamePrice")) {
  $("gamePrice").value = cfg.gamePrice;
}

if ($("shotsText")) {
  $("shotsText").value = cfg.shotsText;
}

if ($("hydrogelPrice")) {
  $("hydrogelPrice").value = cfg.hydrogelPrice;
}

if ($("hydrogelShotsText")) {
  $("hydrogelShotsText").value =
    cfg.hydrogelShotsText;
}

if ($("deposit")) {
  $("deposit").value = cfg.deposit;
}

if ($("minPlayers")) {
  $("minPlayers").value = cfg.minPlayers;
}

if ($("whatsapp")) {
  $("whatsapp").value = cfg.whatsapp;
}

if ($("slots")) {
  $("slots").value = cfg.slots.join(", ");
}


/* =====================================================
   GUARDAR CONFIGURACIÓN
===================================================== */

if ($("configForm")) {

  $("configForm").addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const next = {

        gamePrice:
          Number($("gamePrice").value),

        shotsText:
          $("shotsText").value.trim(),

        hydrogelPrice:
          Number($("hydrogelPrice").value),

        hydrogelShotsText:
          $("hydrogelShotsText")
            .value
            .trim(),

        deposit:
          Number($("deposit").value),

        minPlayers:
          Number($("minPlayers").value),

        whatsapp:
          $("whatsapp")
            .value
            .replace(/\D/g, ""),

        slots:
          $("slots")
            .value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)

      };


      localStorage.setItem(
        "aguaraConfig",
        JSON.stringify(next)
      );


      if ($("saved")) {

        $("saved").hidden = false;

        setTimeout(() => {

          $("saved").hidden = true;

        }, 3000);

      }

    }
  );

}


/* =====================================================
   ESTADO
===================================================== */

let editingReservationId = null;


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
          headers: {
            Accept:
              "application/json"
          }
        }
      );


    const data =
      await response.json();


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
      Array.isArray(data.reservas)
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
          (b) =>
            createBookingHtml(b)
        )
        .join("");


  } catch (error) {

    console.error(
      "Error cargando reservas:",
      error
    );


    container.innerHTML =
      `<p class="muted">
        ${escapeHtml(
          error.message ||
          "Error cargando reservas."
        )}
      </p>`;

  }

}


/* =====================================================
   HTML DE CADA RESERVA
===================================================== */

function createBookingHtml(b) {

  const id =
    escapeHtml(
      b.public_id
    );


  const date =
    escapeHtml(
      b.booking_date
    );


  const time =
    escapeHtml(
      b.booking_time
    );


  const name =
    escapeHtml(
      b.name
    );


  const phone =
    escapeHtml(
      b.phone
    );


  const players =
    escapeHtml(
      b.players
    );


  const status =
    escapeHtml(
      b.status
    );


  const deposit =
    money(
      b.deposit_amount
    );


  const gamePrice =
    money(
      b.game_price
    );


  return `

    <div
      class="admin-booking"
      id="booking-${id}"
      style="
        border-top:1px solid #333;
        padding:20px 0;
      "
    >

      <div
        id="view-${id}"
      >

        <strong
          style="font-size:18px"
        >
          ${date} · ${time}
        </strong>

        <br>

        <span>
          ${name}
        </span>

        ·

        <span>
          ${players} jugadores
        </span>

        <br>

        <small>
          WhatsApp:
          ${phone}
        </small>

        <br>

        <small>
          ID:
          ${id}
        </small>

        <br>

        <small>
          Precio:
          ${gamePrice}
          · Seña:
          ${deposit}
        </small>

        <br>

        <small>
          Estado:
          <strong>
            ${status}
          </strong>
        </small>

        <div
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-top:12px;
          "
        >

          <button
            type="button"
            class="btn btn-primary"
            onclick="editReservation('${id}')"
          >
            ✏️ Editar
          </button>


          ${
            b.status !== "confirmed"
              ? `
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="confirmReservation('${id}')"
                >
                  ✅ Confirmar
                </button>
              `
              : ""
          }


          <button
            type="button"
            class="btn btn-outline"
            onclick="deleteReservation('${id}')"
          >
            🗑️ Eliminar
          </button>

        </div>

      </div>


      <div
        id="edit-${id}"
        style="display:none"
      >

        <h3>
          Editar reserva
        </h3>


        <label>
          Nombre

          <input
            id="edit-name-${id}"
            type="text"
            value="${escapeHtml(b.name)}"
          >

        </label>


        <label>
          WhatsApp

          <input
            id="edit-phone-${id}"
            type="tel"
            value="${escapeHtml(b.phone)}"
          >

        </label>


        <label>
          Fecha

          <input
            id="edit-date-${id}"
            type="date"
            value="${escapeHtml(b.booking_date)}"
          >

        </label>


        <label>
          Horario

          <select
            id="edit-time-${id}"
          >

            ${createTimeOptions(
              b.booking_time
            )}

          </select>

        </label>


        <label>
          Jugadores

          <input
            id="edit-players-${id}"
            type="number"
            min="10"
            value="${escapeHtml(b.players)}"
          >

        </label>


        <label>
          Observaciones

          <textarea
            id="edit-notes-${id}"
            rows="3"
          >${escapeHtml(b.notes || "")}</textarea>

        </label>


        <div
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-top:12px;
          "
        >

          <button
            type="button"
            class="btn btn-primary"
            onclick="saveReservation('${id}')"
          >
            💾 Guardar cambios
          </button>


          <button
            type="button"
            class="btn btn-outline"
            onclick="cancelEdit('${id}')"
          >
            Cancelar
          </button>

        </div>


        <p
          id="edit-message-${id}"
          class="form-message"
          hidden
        ></p>

      </div>

    </div>

  `;

}


/* =====================================================
   OPCIONES DE HORARIOS
===================================================== */

function createTimeOptions(currentTime) {

  const slots =
    Array.isArray(cfg.slots)
      ? cfg.slots
      : DEFAULTS.slots;


  return slots
    .map(
      (time) => `

        <option
          value="${escapeHtml(time)}"
          ${
            time === currentTime
              ? "selected"
              : ""
          }
        >
          ${escapeHtml(time)}
        </option>

      `
    )
    .join("");

}


/* =====================================================
   EDITAR RESERVA
===================================================== */

window.editReservation =
  function (publicId) {

    if (editingReservationId) {

      cancelEdit(
        editingReservationId
      );

    }


    editingReservationId =
      publicId;


    const view =
      document.getElementById(
        `view-${publicId}`
      );


    const edit =
      document.getElementById(
        `edit-${publicId}`
      );


    if (view) {
      view.style.display =
        "none";
    }


    if (edit) {
      edit.style.display =
        "block";
    }

  };


/* =====================================================
   CANCELAR EDICIÓN
===================================================== */

window.cancelEdit =
  function (publicId) {

    const view =
      document.getElementById(
        `view-${publicId}`
      );


    const edit =
      document.getElementById(
        `edit-${publicId}`
      );


    if (view) {
      view.style.display =
        "block";
    }


    if (edit) {
      edit.style.display =
        "none";
    }


    editingReservationId =
      null;

  };


/* =====================================================
   GUARDAR EDICIÓN
===================================================== */

window.saveReservation =
  async function (publicId) {

    const name =
      $(`edit-name-${publicId}`)
        ?.value
        .trim();


    const phone =
      $(`edit-phone-${publicId}`)
        ?.value
        .trim();


    const date =
      $(`edit-date-${publicId}`)
        ?.value;


    const time =
      $(`edit-time-${publicId}`)
        ?.value;


    const players =
      Number(
        $(`edit-players-${publicId}`)
          ?.value
      );


    const notes =
      $(`edit-notes-${publicId}`)
        ?.value
        .trim();


    const message =
      $(`edit-message-${publicId}`);


    if (!name) {

      showEditMessage(
        message,
        "Ingresá el nombre.",
        "error"
      );

      return;

    }


    if (!phone) {

      showEditMessage(
        message,
        "Ingresá el WhatsApp.",
        "error"
      );

      return;

    }


    if (!date) {

      showEditMessage(
        message,
        "Elegí una fecha.",
        "error"
      );

      return;

    }


    if (!time) {

      showEditMessage(
        message,
        "Elegí un horario.",
        "error"
      );

      return;

    }


    if (
      !Number.isInteger(players) ||
      players < 10
    ) {

      showEditMessage(
        message,
        "La reserva requiere mínimo 10 jugadores.",
        "error"
      );

      return;

    }


    showEditMessage(
      message,
      "Guardando cambios...",
      "success"
    );


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

                nombre:
                  name,

                whatsapp:
                  phone,

                fecha:
                  date,

                horario:
                  time,

                jugadores:
                  players,

                observaciones:
                  notes

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

        data = {};

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          "No se pudo modificar la reserva."
        );

      }


      editingReservationId =
        null;


      await render();


    } catch (error) {

      console.error(
        "ERROR EDITANDO RESERVA:",
        error
      );


      showEditMessage(
        message,
        error.message ||
        "No se pudo modificar la reserva.",
        "error"
      );

    }

  };


/* =====================================================
   MENSAJE DE EDICIÓN
===================================================== */

function showEditMessage(
  element,
  message,
  type
) {

  if (!element) {
    return;
  }


  element.hidden =
    false;


  element.textContent =
    message;


  element.className =
    "form-message " +
    (
      type ||
      "success"
    );

}


/* =====================================================
   ELIMINAR RESERVA
===================================================== */

window.deleteReservation =
  async function (publicId) {

    const confirmar =
      window.confirm(
        "¿Seguro que querés eliminar esta reserva?\n\n" +
        "Esta acción no se puede deshacer."
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


      let data = {};

      try {

        data =
          JSON.parse(text);

      } catch {

        data = {};

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          "No se pudo eliminar la reserva."
        );

      }


      await render();


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

  };


/* =====================================================
   CONFIRMAR RESERVA
===================================================== */

window.confirmReservation =
  async function (publicId) {

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
                  "confirmed"

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

        data = {};

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          "No se pudo confirmar la reserva."
        );

      }


      await render();


    } catch (error) {

      console.error(
        "ERROR CONFIRMANDO RESERVA:",
        error
      );


      alert(
        error.message ||
        "No se pudo confirmar la reserva."
      );

    }

  };


/* =====================================================
   INICIAR
===================================================== */

render();
```
