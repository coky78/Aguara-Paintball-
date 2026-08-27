```javascript
/* =========================================================
   AGUARÁ PAINTBALL
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   CONFIGURACIÓN POR DEFECTO
========================================================= */

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


/* =========================================================
   CONFIGURACIÓN
========================================================= */

function getConfig() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "aguaraConfig"
        ) || "{}"
      );

    return {
      ...DEFAULTS,
      ...saved
    };

  } catch (error) {

    console.warn(
      "No se pudo leer la configuración guardada.",
      error
    );

    return {
      ...DEFAULTS
    };

  }

}


const cfg =
  getConfig();


/* =========================================================
   DINERO
========================================================= */

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


/* =========================================================
   AÑO
========================================================= */

const yearElement =
  document.getElementById(
    "year"
  );

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   PRECIOS
========================================================= */

const publicGamePrice =
  document.getElementById(
    "publicGamePrice"
  );

if (publicGamePrice) {

  publicGamePrice.textContent =
    money(
      cfg.gamePrice
    );

}


const publicShotsText =
  document.getElementById(
    "publicShotsText"
  );

if (publicShotsText) {

  publicShotsText.textContent =
    cfg.shotsText;

}


const publicHydrogelPrice =
  document.getElementById(
    "publicHydrogelPrice"
  );

if (publicHydrogelPrice) {

  publicHydrogelPrice.textContent =
    money(
      cfg.hydrogelPrice
    );

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
  document.getElementById(
    "publicDeposit"
  );

if (publicDeposit) {

  publicDeposit.textContent =
    money(
      cfg.deposit
    );

}


const depositInline =
  document.getElementById(
    "depositInline"
  );

if (depositInline) {

  depositInline.textContent =
    money(
      cfg.deposit
    );

}


const publicMinPlayers =
  document.getElementById(
    "publicMinPlayers"
  );

if (publicMinPlayers) {

  publicMinPlayers.textContent =
    cfg.minPlayers;

}


/* =========================================================
   ELEMENTOS DEL FORMULARIO
========================================================= */

const bookingForm =
  document.getElementById(
    "bookingForm"
  );

const dateInput =
  document.getElementById(
    "date"
  );

const timeSelect =
  document.getElementById(
    "time"
  );

const nameInput =
  document.getElementById(
    "name"
  );

const phoneInput =
  document.getElementById(
    "phone"
  );

const playersInput =
  document.getElementById(
    "players"
  );

const notesInput =
  document.getElementById(
    "notes"
  );

const bookingMessage =
  document.getElementById(
    "bookingMessage"
  );


/* =========================================================
   MENSAJES
========================================================= */

function showBookingMessage(
  message,
  type = "success"
) {

  if (!bookingMessage) {

    alert(message);

    return;

  }

  bookingMessage.hidden =
    false;

  bookingMessage.textContent =
    message;

  bookingMessage.className =
    "form-message " + type;

}


/* =========================================================
   FECHA MÍNIMA
========================================================= */

function setMinimumDate() {

  if (!dateInput) {
    return;
  }

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  const todayString =
    `${year}-${month}-${day}`;

  dateInput.min =
    todayString;

}


setMinimumDate();


/* =========================================================
   MOSTRAR HORARIOS
========================================================= */

function showAllSlots() {

  if (!timeSelect) {

    console.error(
      "No se encontró #time en index.html"
    );

    return;

  }


  /* Limpiar */

  timeSelect.innerHTML =
    "";


  /* Primera opción */

  const firstOption =
    document.createElement(
      "option"
    );

  firstOption.value =
    "";

  firstOption.textContent =
    "Elegí un horario";

  firstOption.selected =
    true;

  timeSelect.appendChild(
    firstOption
  );


  /* Obtener horarios */

  let slots =
    Array.isArray(cfg.slots)
      ? cfg.slots
      : DEFAULTS.slots;


  /* Si por alguna razón están vacíos */

  if (!slots.length) {

    slots =
      DEFAULTS.slots;

  }


  /* Crear horarios */

  slots.forEach(
    function (slot) {

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

    }
  );


  console.log(
    "Horarios cargados:",
    slots
  );

}


/* =========================================================
   OBTENER RESERVAS DESDE NEON
========================================================= */

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

      console.warn(
        "La API de reservas respondió:",
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
      Array.isArray(
        data.reservas
      )
    ) {

      return data.reservas;

    }


    if (
      Array.isArray(data)
    ) {

      return data;

    }


    return [];

  } catch (error) {

    console.warn(
      "No se pudieron obtener las reservas.",
      error
    );

    return [];

  }

}


/* =========================================================
   NORMALIZAR RESERVAS
========================================================= */

function isReservationCancelled(
  booking
) {

  const estado =
    String(
      booking.estado_de_reserva ??
      booking.estado ??
      ""
    )
      .trim()
      .toLowerCase();


  return (
    estado === "cancelada" ||
    estado === "cancelado" ||
    estado === "cancelled"
  );

}


/* =========================================================
   COMPROBAR SI UN HORARIO ESTÁ OCUPADO
========================================================= */

function isSlotOccupied(
  booking,
  selectedDate,
  slot
) {

  if (
    isReservationCancelled(
      booking
    )
  ) {

    return false;

  }


  const bookingDate =
    String(
      booking.fecha ??
      booking.date ??
      ""
    )
      .substring(
        0,
        10
      );


  const bookingTime =
    String(
      booking.horario ??
      booking.time ??
      ""
    )
      .substring(
        0,
        5
      );


  return (
    bookingDate ===
      selectedDate &&
    bookingTime ===
      slot
  );

}


/* =========================================================
   CARGAR HORARIOS DISPONIBLES
========================================================= */

async function loadAvailableSlots() {

  if (!timeSelect) {

    return;

  }


  const selectedDate =
    dateInput
      ? dateInput.value
      : "";


  /* =======================================================
     SIN FECHA
  ======================================================= */

  if (!selectedDate) {

    showAllSlots();

    return;

  }


  /* =======================================================
     MOSTRAR CARGANDO
  ======================================================= */

  timeSelect.innerHTML =
    "";


  const loadingOption =
    document.createElement(
      "option"
    );

  loadingOption.value =
    "";

  loadingOption.textContent =
    "Cargando horarios...";

  loadingOption.selected =
    true;

  timeSelect.appendChild(
    loadingOption
  );


  /* =======================================================
     OBTENER RESERVAS
  ======================================================= */

  const bookings =
    await getReservations();


  /* =======================================================
     LIMPIAR
  ======================================================= */

  timeSelect.innerHTML =
    "";


  /* =======================================================
     OPCIÓN INICIAL
  ======================================================= */

  const firstOption =
    document.createElement(
      "option"
    );

  firstOption.value =
    "";

  firstOption.textContent =
    "Elegí un horario";

  firstOption.selected =
    true;

  timeSelect.appendChild(
    firstOption
  );


  /* =======================================================
     HORARIOS
  ======================================================= */

  const slots =
    Array.isArray(cfg.slots)
      ? cfg.slots
      : DEFAULTS.slots;


  let availableCount =
    0;


  slots.forEach(
    function (slot) {

      const occupied =
        bookings.some(
          function (booking) {

            return isSlotOccupied(
              booking,
              selectedDate,
              slot
            );

          }
        );


      /* ===================================================
         SI ESTÁ LIBRE
      =================================================== */

      if (!occupied) {

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


  /* =======================================================
     NO HAY HORARIOS
  ======================================================= */

  if (
    availableCount === 0
  ) {

    timeSelect.innerHTML =
      "";


    const noSlots =
      document.createElement(
        "option"
      );

    noSlots.value =
      "";

    noSlots.textContent =
      "No hay horarios disponibles";

    noSlots.selected =
      true;

    timeSelect.appendChild(
      noSlots
    );

  }


  console.log(
    "Fecha seleccionada:",
    selectedDate
  );

  console.log(
    "Horarios disponibles:",
    availableCount
  );

}


/* =========================================================
   CAMBIO DE FECHA
========================================================= */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      loadAvailableSlots();

    }
  );

}


/* =========================================================
   INICIO DEL SELECTOR DE HORARIOS
========================================================= */

if (timeSelect) {

  timeSelect.innerHTML =
    '<option value="" selected>Elegí un horario</option>';

}


/* =========================================================
   CREAR RESERVA
========================================================= */

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
      ? Number(
          playersInput.value
        )
      : 0;


  const notes =
    notesInput
      ? notesInput.value.trim()
      : "";


  /* =======================================================
     VALIDACIONES
  ======================================================= */

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
    players <
      Number(
        cfg.minPlayers
      )
  ) {

    showBookingMessage(
      `La reserva requiere un mínimo de ${cfg.minPlayers} jugadores.`,
      "error"
    );

    return;

  }


  /* =======================================================
     PRECIO
  ======================================================= */

  const pricePerPlayer =
    Number(
      cfg.gamePrice
    ) || 0;


  const total =
    pricePerPlayer *
    players;


  const deposit =
    Number(
      cfg.deposit
    ) || 0;


  /* =======================================================
     BOTÓN
  ======================================================= */

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


  /* =======================================================
     ENVIAR A LA API
  ======================================================= */

  try {

    const response =
      await fetch(
        "/api/reservations",
        {

          method:
            "POST",

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


    let data =
      {};


    try {

      data =
        await response.json();

    } catch {

      data =
        {};

    }


    if (
      !response.ok ||
      data.ok === false
    ) {

      throw new Error(
        data.message ||
        "No se pudo guardar la reserva."
      );

    }


    /* =====================================================
       ÉXITO
    ===================================================== */

    showBookingMessage(
      `¡Reserva registrada correctamente! Fecha: ${date} — Horario: ${time}. Seña requerida: ${money(deposit)}.`,
      "success"
    );


    /* =====================================================
       LIMPIAR
    ===================================================== */

    if (nameInput) {

      nameInput.value =
        "";

    }


    if (phoneInput) {

      phoneInput.value =
        "";

    }


    if (dateInput) {

      dateInput.value =
        "";

    }


    if (timeSelect) {

      timeSelect.innerHTML =
        '<option value="" selected>Elegí un horario</option>';

    }


    if (playersInput) {

      playersInput.value =
        cfg.minPlayers;

    }


    if (notesInput) {

      notesInput.value =
        "";

    }


  } catch (error) {

    console.error(
      "Error creando reserva:",
      error
    );


    showBookingMessage(
      error.message ||
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


/* =========================================================
   FORMULARIO
========================================================= */

if (bookingForm) {

  bookingForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      createReservation();

    }
  );

}


/* =========================================================
   WHATSAPP
========================================================= */

const waNumber =
  cfg.whatsapp ||
  DEFAULTS.whatsapp;


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

  whatsappHero.rel =
    "noopener noreferrer";

}


if (whatsappBooking) {

  whatsappBooking.href =
    waUrl;

  whatsappBooking.target =
    "_blank";

  whatsappBooking.rel =
    "noopener noreferrer";

}


/* =========================================================
   FIN
========================================================= */

console.log(
  "A
```
