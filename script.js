```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT PRINCIPAL
===================================================== */

"use strict";

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
   CONFIGURACIÓN GUARDADA
===================================================== */

function getConfig() {

  try {

    const saved = JSON.parse(
      localStorage.getItem("aguaraConfig") || "{}"
    );

    return {
      ...DEFAULTS,
      ...saved,

      // Si la configuración guardada no tiene horarios,
      // usamos siempre los horarios predeterminados.
      slots:
        Array.isArray(saved.slots) &&
        saved.slots.length > 0
          ? saved.slots
          : DEFAULTS.slots
    };

  } catch (error) {

    console.warn(
      "No se pudo leer aguaraConfig:",
      error
    );

    return {
      ...DEFAULTS
    };
  }
}

const cfg = getConfig();


/* =====================================================
   DINERO
===================================================== */

function money(value) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(Number(value) || 0);

}


/* =====================================================
   FECHA
===================================================== */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const parts =
    String(dateString).split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =====================================================
   ELEMENTOS
===================================================== */

const yearElement =
  document.getElementById("year");

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


/* =====================================================
   AÑO
===================================================== */

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


/* =====================================================
   PRECIOS
===================================================== */

const gamePriceElement =
  document.getElementById("publicGamePrice");

if (gamePriceElement) {

  gamePriceElement.textContent =
    money(cfg.gamePrice);

}


const shotsTextElement =
  document.getElementById("publicShotsText");

if (shotsTextElement) {

  shotsTextElement.textContent =
    cfg.shotsText;

}


const hydrogelPriceElement =
  document.getElementById(
    "publicHydrogelPrice"
  );

if (hydrogelPriceElement) {

  hydrogelPriceElement.textContent =
    money(cfg.hydrogelPrice);

}


const hydrogelShotsTextElement =
  document.getElementById(
    "publicHydrogelShotsText"
  );

if (hydrogelShotsTextElement) {

  hydrogelShotsTextElement.textContent =
    cfg.hydrogelShotsText;

}


const publicDepositElement =
  document.getElementById(
    "publicDeposit"
  );

if (publicDepositElement) {

  publicDepositElement.textContent =
    money(cfg.deposit);

}


const depositInlineElement =
  document.getElementById(
    "depositInline"
  );

if (depositInlineElement) {

  depositInlineElement.textContent =
    money(cfg.deposit);

}


const publicMinPlayersElement =
  document.getElementById(
    "publicMinPlayers"
  );

if (publicMinPlayersElement) {

  publicMinPlayersElement.textContent =
    cfg.minPlayers;

}


/* =====================================================
   FECHA MÍNIMA
===================================================== */

if (dateInput) {

  const today = new Date();

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


/* =====================================================
   CARGAR HORARIOS
===================================================== */

function showSlots() {

  if (!timeSelect) {

    console.error(
      "Aguará Paintball: no existe #time"
    );

    return;

  }

  timeSelect.innerHTML = "";

  const firstOption =
    document.createElement("option");

  firstOption.value = "";

  firstOption.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    firstOption
  );


  // Siempre usar horarios válidos
  // aunque localStorage tenga una configuración vieja.

  const horarios =
    Array.isArray(cfg.slots) &&
    cfg.slots.length > 0
      ? cfg.slots
      : DEFAULTS.slots;


  horarios.forEach(
    function (horario) {

      const option =
        document.createElement("option");

      option.value =
        horario;

      option.textContent =
        horario;

      timeSelect.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   MOSTRAR HORARIOS AL CARGAR
===================================================== */

if (timeSelect) {

  showSlots();

}


/* =====================================================
   CAMBIO DE FECHA
===================================================== */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      if (!dateInput.value) {

        showSlots();

        return;

      }

      showSlots();

    }
  );

}


/* =====================================================
   MENSAJES
===================================================== */

function showMessage(
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
    `form-message ${type}`;

}


/* =====================================================
   CREAR RESERVA
===================================================== */

async function createReservation() {

  if (!bookingForm) {
    return;
  }


  const nombre =
    nameInput
      ? nameInput.value.trim()
      : "";


  const whatsapp =
    phoneInput
      ? phoneInput.value.trim()
      : "";


  const fecha =
    dateInput
      ? dateInput.value
      : "";


  const horario =
    timeSelect
      ? timeSelect.value
      : "";


  const jugadores =
    playersInput
      ? Number(playersInput.value)
      : 0;


  const observaciones =
    notesInput
      ? notesInput.value.trim()
      : "";


  /* ===================================================
     VALIDACIONES
  =================================================== */

  if (!nombre) {

    showMessage(
      "Ingresá tu nombre y apellido.",
      "error"
    );

    return;
  }


  if (!whatsapp) {

    showMessage(
      "Ingresá tu número de WhatsApp.",
      "error"
    );

    return;
  }


  if (!fecha) {

    showMessage(
      "Elegí una fecha.",
      "error"
    );

    return;
  }


  if (!horario) {

    showMessage(
      "Elegí un horario.",
      "error"
    );

    return;
  }


  if (
    !Number.isFinite(jugadores) ||
    jugadores < Number(cfg.minPlayers)
  ) {

    showMessage(
      `La reserva requiere un mínimo de ${cfg.minPlayers} jugadores.`,
      "error"
    );

    return;
  }


  /* ===================================================
     CÁLCULOS
  =================================================== */

  const precioPorJugador =
    Number(cfg.gamePrice) || 0;

  const total =
    precioPorJugador * jugadores;

  const senaRequerida =
    Number(cfg.deposit) || 0;


  /* ===================================================
     BOTÓN
  =================================================== */

  const submitButton =
    bookingForm.querySelector(
      'button[type="submit"]'
    );

  let originalButtonText =
    "Continuar con la reserva";


  if (submitButton) {

    originalButtonText =
      submitButton.innerHTML;

    submitButton.disabled =
      true;

    submitButton.innerHTML =
      "Guardando reserva...";

  }


  /* ===================================================
     ENVIAR A LA API
  =================================================== */

  try {

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

          body: JSON.stringify({

            nombre:
              nombre,

            whatsapp:
              whatsapp,

            fecha:
              fecha,

            horario:
              horario,

            jugadores:
              jugadores,

            tipo_de_juego:
              "Paintball",

            precio_por_jugador:
              precioPorJugador,

            total:
              total,

            sena_requerida:
              senaRequerida,

            monto_recibido:
              0,

            estado_de_pago:
              "pendiente",

            estado_de_reserva:
              "pendiente",

            fecha_de_transferencia:
              null,

            observaciones:
              observaciones

          })
        }
      );


    /* =================================================
       LEER RESPUESTA
    ================================================= */

    const responseText =
      await response.text();


    let data = {};

    try {

      data =
        responseText
          ? JSON.parse(responseText)
          : {};

    } catch {

      data = {
        message:
          responseText
      };

    }


    /* =================================================
       ERROR REAL
    ================================================= */

    if (
      !response.ok ||
      data.ok === false
    ) {

      console.error(
        "ERROR API /api/reservations:",
        {
          status:
            response.status,

          response:
            data
        }
      );


      const errorMessage =
        data?.message ||
        data?.error?.message ||
        data?.error ||
        `Error del servidor (${response.status})`;


      throw new Error(
        String(errorMessage)
      );

    }


    /* =================================================
       RESERVA CORRECTA
    ================================================= */

    showMessage(
      `¡Reserva registrada correctamente! Fecha: ${formatDate(fecha)} — Horario: ${horario}. Seña requerida: ${money(senaRequerida)}.`,
      "success"
    );


    /* =================================================
       LIMPIAR
    ================================================= */

    if (nameInput) {
      nameInput.value = "";
    }

    if (phoneInput) {
      phoneInput.value = "";
    }

    if (dateInput) {
      dateInput.value = "";
    }

    if (playersInput) {
      playersInput.value =
        cfg.minPlayers;
    }

    if (notesInput) {
      notesInput.value = "";
    }

    if (timeSelect) {
      showSlots();
    }


  } catch (error) {

    console.error(
      "ERROR CREANDO RESERVA:",
      error
    );


    // Mostrar el error verdadero.
    showMessage(
      error?.message ||
      "No se pudo guardar la reserva.",
      "error"
    );


  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        originalButtonText;

    }

  }

}


/* =====================================================
   FORMULARIO
===================================================== */

if (bookingForm) {

  bookingForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      createReservation();

    }
  );

}


/* =====================================================
   WHATSAPP
===================================================== */

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


/* =====================================================
   LIGHTBOX
===================================================== */

const lightbox =
  document.getElementById(
    "lightbox"
  );

const lightboxImg =
  document.getElementById(
    "lightboxImg"
  );

const closeLightbox =
  document.getElementById(
    "closeLightbox"
  );

const galleryItems =
  document.querySelectorAll(
    ".gallery-item"
  );


galleryItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const source =
          item.dataset.src;

        if (
          !source ||
          !lightbox ||
          !lightboxImg
        ) {

          return;

        }

        lightboxImg.src =
          source;

        lightbox.hidden =
          false;

      }
    );

  }
);


if (closeLightbox) {

  closeLightbox.addEventListener(
    "click",
    function () {

      if (lightbox) {

        lightbox.hidden =
          true;

      }

    }
  );

}


if (lightbox) {

  lightbox.addEventListener(
    "click",
    function (event) {

      if (
        event.target === lightbox
      ) {

        lightbox.hidden =
          true;

      }

    }
  );

}


/* =====================================================
   FINAL
===================================================== */

console.log(
  "Aguará Paintball — script.js cargado correctamente."
);

console.log(
  "Horarios disponibles:",
  cfg.slots
);
```
