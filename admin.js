```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   ADMIN.JS
   RESERVAS + EDITAR + ELIMINAR
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


function money(value) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

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
   CONFIGURACIÓN
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


function loadConfigForm() {

  const cfg =
    loadConfig();

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

}


/* =====================================================
   GUARDAR CONFIGURACIÓN
===================================================== */

const configForm =
  $("configForm");


if (configForm) {

  configForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      const next = {

        gamePrice:
          Number(
            $("gamePrice").value
          ),

        shotsText:
          $("shotsText").value.trim(),

        hydrogelPrice:
          Number(
            $("hydrogelPrice").value
          ),

        hydrogelShotsText:
          $("hydrogelShotsText")
            .value.trim(),

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
              function (x) {
                return x.trim();
              }
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

      }

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
          },

          cache: "no-store"
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
          function (b) {

            return `

              <div
                style="
                  border-top:1px solid #333;
                  padding:18px 0;
                "
              >

                <strong>
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

                <br>

                <strong>
                  ${escapeHtml(
                    b.name
                  )}
                </strong>

                ·
                ${escapeHtml(
                  b.players
                )}
                jugadores

                <br>

                <small>
                  WhatsApp:
                  ${escapeHtml(
                    b.phone
                  )}
                </small>

                <br>

                <small>
                  ID:
                  ${escapeHtml(
                    b.public_id
                  )}
                </small>

                <br>

                <small>
                  Seña:
                  ${money(
                    b.deposit_amount
                  )}
                </small>

                <br>

                <small>
                  Estado:
                  ${escapeHtml(
                    b.status
                  )}
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
                    onclick="editarReserva('${escapeHtml(
                      b.public_id
                    )}')"
                  >
                    EDITAR
                  </button>


                  <button
                    type="button"
                    class="btn btn-outline"
                    onclick="eliminarReserva('${escapeHtml(
                      b.public_id
                    )}')"
                  >
                    ELIMINAR
                  </button>

                </div>

              </div>

            `;

          }
        )
        .join("");

  } catch (error) {

    console.error(
      "Error cargando reservas:",
      error
    );


    container.innerHTML = `

      <p class="muted">
        ${escapeHtml(
          error.message ||
          "Error cargando reservas."
        )}
      </p>

      <button
        type="button"
        class="btn btn-primary"
        onclick="render()"
        style="margin-top:10px"
      >
        RECARGAR RESERVAS
      </button>

    `;

  }

}


/* =====================================================
   EDITAR RESERVA
===================================================== */

async function editarReserva(
  publicId
) {

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

          cache: "no-store"
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


    const reservas =
      Array.isArray(
        data.reservas
      )
        ? data.reservas
        : [];


    const reserva =
      reservas.find(
        function (item) {

          return (
            item.public_id ===
            publicId
          );

        }
      );


    if (!reserva) {

      alert(
        "No encontramos esa reserva."
      );

      return;

    }


    const nombre =
      prompt(
        "Nombre y apellido:",
        reserva.name || ""
      );


    if (nombre === null) {
      return;
    }


    const whatsapp =
      prompt(
        "WhatsApp:",
        reserva.phone || ""
      );


    if (whatsapp === null) {
      return;
    }


    const fecha =
      prompt(
        "Fecha (AAAA-MM-DD):",
        reserva.booking_date || ""
      );


    if (fecha === null) {
      return;
    }


    const horario =
      prompt(
        "Horario:",
        reserva.booking_time || ""
      );


    if (horario === null) {
      return;
    }


    const jugadores =
      prompt(
        "Cantidad de jugadores:",
        reserva.players || 10
      );


    if (jugadores === null) {
      return;
    }


    const notas =
      prompt(
        "Observaciones:",
        reserva.notes || ""
      );


    if (notas === null) {
      return;
    }


    const body = {

      public_id:
        publicId,

      name:
        nombre.trim(),

      phone:
        whatsapp.trim(),

      booking_date:
        fecha.trim(),

      booking_time:
        horario.trim(),

      players:
        Number(jugadores),

      notes:
        notas.trim()

    };


    const updateResponse =
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
      await updateResponse.text();


    let result = {};

    try {

      result =
        JSON.parse(text);

    } catch {

      result = {};

    }


    if (
      !updateResponse.ok ||
      !result.ok
    ) {

      throw new Error(
        result.message ||
        "No se pudo modificar la reserva."
      );

    }


    alert(
      "Reserva modificada correctamente."
    );


    render();


  } catch (error) {

    console.error(
      "ERROR EDITANDO RESERVA:",
      error
    );


    alert(
      error.message ||
      "No se pudo modificar la reserva."
    );

  }

}


/* =====================================================
   ELIMINAR RESERVA
===================================================== */

async function eliminarReserva(
  publicId
) {

  const confirmar =
    confirm(
      "¿Seguro que querés eliminar esta reserva?\n\n" +
      "Esta acción liberará el horario."
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
   EXPONER FUNCIONES
===================================================== */

window.editarReserva =
  editarReserva;

window.eliminarReserva =
  eliminarReserva;

window.renderReservas =
  render;


/* =====================================================
   INICIO
===================================================== */

loadConfigForm();

render();

console.log(
  "Aguará Paintball — admin.js cargado correctamente."
);
```
