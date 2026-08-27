```javascript
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


/* =========================
   CONFIGURACIÓN
========================= */

function getConfig() {

  let savedConfig = {};

  try {
    savedConfig = JSON.parse(
      localStorage.getItem("aguaraConfig") || "{}"
    );
  } catch (error) {
    savedConfig = {};
  }

  return {
    ...DEFAULTS,
    ...savedConfig
  };
}

const cfg = getConfig();


/* =========================
   DINERO
========================= */

function money(value) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

}


/* =========================
   AÑO
========================= */

const yearElement =
  document.getElementById("year");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}


/* =========================
   PRECIOS
========================= */

const publicGamePrice =
  document.getElementById("publicGamePrice");

if (publicGamePrice) {
  publicGamePrice.textContent =
    money(cfg.gamePrice);
}


const publicShotsText =
  document.getElementById("publicShotsText");

if (publicShotsText) {
  publicShotsText.textContent =
    cfg.shotsText;
}


const publicHydrogelPrice =
  document.getElementById("publicHydrogelPrice");

if (publicHydrogelPrice) {
  publicHydrogelPrice.textContent =
    money(cfg.hydrogelPrice);
}


const publicHydrogelShotsText =
  document.getElementById(
    "publicHydrogelShotsText"
  );

if (publicHydrogelShotsText) {
  publicHydrogelShotsText.textContent =
    cfg.hydrogelShotsText;
}


const publicDeposit =
  document.getElementById("publicDeposit");

if (publicDeposit) {
  publicDeposit.textContent =
    money(cfg.deposit);
}


const depositInline =
  document.getElementById("depositInline");

if (depositInline) {
  depositInline.textContent =
    money(cfg.deposit);
}


const publicMinPlayers =
  document.getElementById("publicMinPlayers");

if (publicMinPlayers) {
  publicMinPlayers.textContent =
    cfg.minPlayers;
}


/* =========================
   ELEMENTOS DE RESERVA
========================= */

const bookingForm =
  document.getElementById("bookingForm");

const dateInput =
  document.getElementById("date");

const timeSelect =
  document.getElementById("time");

const nameInput =
  document.getElementById("name");

const phoneInput =
  document.getElementById("phone");

const playersInput =
  document.getElementById("players");

const notesInput =
  document.getElementById("notes");

const bookingMessage =
  document.getElementById("bookingMessage");


/* =========================
   MENSAJES
========================= */

function showBookingMessage(
  message,
  type = "success"
) {

  if (!bookingMessage) {
    alert(message);
    return;
  }

  bookingMessage.hidden = false;

  bookingMessage.textContent =
    message;

  bookingMessage.className =
    `form-message ${type}`;
}


/* =========================
   OBTENER RESERVAS DE NEON
========================= */

async function getReservations() {

  try {

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Accept":
              "application/json"
          }
        }
      );

    if (!response.ok) {
      console.error(
        "Error HTTP:",
        response.status
      );

      return [];
    }

    const data =
      await response.json();

    console.log(
      "Reservas recibidas:",
      data
    );

    if (
      data &&
      Array.isArray(data.reservas)
    ) {
      return data.reservas;
    }

    return [];

  } catch (error) {

    console.error(
      "No se pudieron obtener las reservas:",
      error
    );

    return [];

  }

}


/* =========================
   CARGAR HORARIOS
========================= */

async function loadAvailableSlots() {

  if (!timeSelect) {
    return;
  }

  const selectedDate =
    dateInput
      ? dateInput.value
      : "";


  /* Siempre empezar desde cero */

  timeSelect.innerHTML = "";


  /* Si no hay fecha */

  if (!selectedDate) {

    const option =
      document.createElement("option");

    option.value = "";

    option.textContent =
      "Elegí una fecha";

    timeSelect.appendChild(
      option
    );

    return;
  }


  /* Mostrar carga */

  const loadingOption =
    document.createElement("option");

  loadingOption.value = "";

  loadingOption.textContent =
    "Cargando horarios...";

  timeSelect.appendChild(
    loadingOption
  );


  /* Obtener reservas */

  const bookings =
    await getReservations();


  /* Limpiar */

  timeSelect.innerHTML = "";


  const firstOption =
    document.createElement("option");

  firstOption.value = "";

  firstOption.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    firstOption
  );


  let availableCount = 0;


  /* =========================
     CREAR HORARIOS
  ========================== */

  cfg.slots.forEach(
    function (slot) {

      const ocupado =
        bookings.some(
          function (booking) {

            const bookingDate =
              String(
                booking.fecha ?? ""
              ).substring(0, 10);

            const bookingTime =
              String(
                booking.horario ?? ""
              ).substring(0, 5);


            const estadoReserva =
              String(
                booking.estado_de_reserva ?? ""
              ).toLowerCase();


            const cancelada =
              estadoReserva ===
                "cancelada" ||
              estadoReserva ===
                "cancelled";


            return (
              bookingDate ===
                selectedDate &&
              bookingTime ===
                slot &&
              !cancelada
            );

          }
        );


      if (!ocupado) {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          slot;

        option.textContent =
          slot;

        timeSelect.appendChild(
          option
        );

        availableCount++;

      }

    }
  );


  /* =========================
     SIN HORARIOS
  ========================== */

  if (availableCount === 0) {

    timeSelect.innerHTML =
      "";

    const option =
      document.createElement(
        "option"
      );

    option.value = "";

    option.textContent =
      "No hay horarios disponibles";

    timeSelect.appendChild(
      option
    );

  }

}


/* =========================
   FECHA MÍNIMA
========================= */

if (dateInput) {

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  dateInput.min =
    `${year}-${month}-${day}`;

}


/* =========================
   CAMBIO DE FECHA
========================= */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      loadAvailableSlots();

    }
  );

}


/* =========================
   CREAR RESERVA
========================= */

async function createReservation() {

  if (!bookingForm) {
    return;
  }


  const name =
    nameInput
      ? nameInput.value.trim()
      : "";


  const phone =
    phoneInput
      ? phoneInput.value.trim()
      : "";


  const date =
    dateInput
      ? dateInput.value
      : "";


  const time =
    timeSelect
      ? timeSelect.value
      : "";


  const players =
    playersInput
      ? Number(playersInput.value)
      : 0;


  const notes =
    notesInput
      ? notesInput.value.trim()
      : "";


  /* =========================
     VALIDACIONES
  ========================== */

  if (!name) {

    showBookingMessage(
      "Ingresá tu nombre y apellido.",
      "error"
    );

    return;

  }


  if (!phone) {

    showBookingMessage(
      "Ingresá tu número de WhatsApp.",
      "error"
    );

    return;

  }


  if (!date) {

    showBookingMessage(
      "Elegí una fecha.",
      "error"
    );

    return;

  }


  if (!time) {

    showBookingMessage(
      "Elegí un horario.",
      "error"
    );

    return;

  }


  if (
    !Number.isFinite(players) ||
    players < Number(cfg.minPlayers)
  ) {

    showBookingMessage(
      `La reserva requiere un mínimo de ${cfg.minPlayers} jugadores.`,
      "error"
    );

    return;

  }


  /* =========================
     PRECIO
  ========================== */

  const pricePerPlayer =
    Number(cfg.gamePrice) || 0;


  const total =
    pricePerPlayer *
    players;


  const deposit =
    Number(cfg.deposit) || 0;


  /* =========================
     BOTÓN
  ========================== */

  const submitButton =
    bookingForm.querySelector(
      'button[type="submit"]'
    );


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.dataset.originalText =
      submitButton.innerHTML;

    submitButton.innerHTML =
      "Guardando reserva...";

  }


  try {

    /* =========================
       GUARDAR EN NEON
    ========================== */

    const response =
      await fetch(
        "/api/reservations",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify({

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

              tipo_de_juego:
                "Paintball",

              precio_por_jugador:
                pricePerPlayer,

              total:
                total,

              sena_requerida:
                deposit,

              monto_recibido:
                0,

              estado_de_pago:
                "pendiente",

              estado_de_reserva:
                "pendiente",

              fecha_de_transferencia:
                null,

              observaciones:
                notes

            })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.ok === false
    ) {

      throw new Error(
        data.message ||
        "No se pudo guardar la reserva."
      );

    }


    /* =========================
       ÉXITO
    ========================== */

    showBookingMessage(
      `¡Reserva registrada correctamente! Fecha: ${date} — Horario: ${time}. Seña requerida: ${money(deposit)}.`,
      "success"
    );


    /* =========================
       LIMPIAR
    ========================== */

    if (nameInput) {
      nameInput.value = "";
    }

    if (phoneInput) {
      phoneInput.value = "";
    }

    if (dateInput) {
      dateInput.value = "";
    }

    if (timeSelect) {

      timeSelect.innerHTML =
        '<option value="">Elegí una fecha</option>';

    }

    if (playersInput) {

      playersInput.value =
        cfg.minPlayers;

    }

    if (notesInput) {

      notesInput.value = "";

    }


  } catch (error) {

    console.error(
      "Error creando reserva:",
      error
    );


    showBookingMessage(
      "No se pudo guardar la reserva. Intentá nuevamente.",
      "error"
    );


  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        submitButton.dataset.originalText ||
        "Continuar con la reserva";

    }

  }

}


/* =========================
   FORMULARIO
========================= */

if (bookingForm) {

  bookingForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      createReservation();

    }
  );

}


/* =========================
   WHATSAPP
========================= */

const waNumber =
  cfg.whatsapp ||
  "5493794250285";


const waMessage =
  encodeURIComponent(
    "Hola, quiero consultar por una reserva en Aguará Paintball."
  );


const waUrl =
  `https://wa.me/${waNumber}?text=${waMessage}`;


const whatsappHero =
  document.getElementById(
    "whatsappHero"
  );


const whatsappBooking =
  document.getElementById(
    "whatsappBooking"
  );


if (whatsappHero) {

  whatsappHero.href =
    waUrl;

  whatsappHero.target =
    "_blank";

}


if (whatsappBooking) {

  whatsappBooking.href =
    waUrl;

  whatsappBooking.target =
    "_blank";

}
```
