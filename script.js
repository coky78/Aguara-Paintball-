/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT.JS — VERSIÓN CORREGIDA
===================================================== */


/* =====================================================
   CONFIGURACIÓN FIJA
===================================================== */

const CONFIG = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",

  hydrogelPrice: 0,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",

  deposit: 50000,
  minPlayers: 10,

  whatsapp: "5493794250285",

  /* HORARIOS */
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
   DINERO
===================================================== */

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}


/* =====================================================
   FECHA
===================================================== */

function formatDate(date) {

  if (!date) {
    return "";
  }

  const parts = String(date).split("-");

  if (parts.length !== 3) {
    return date;
  }

  return parts[2] + "/" + parts[1] + "/" + parts[0];
}


/* =====================================================
   ELEMENTOS DEL HTML
===================================================== */

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
   PRECIOS
===================================================== */

const publicGamePrice =
  document.getElementById("publicGamePrice");

if (publicGamePrice) {
  publicGamePrice.textContent =
    money(CONFIG.gamePrice);
}


const publicShotsText =
  document.getElementById("publicShotsText");

if (publicShotsText) {
  publicShotsText.textContent =
    CONFIG.shotsText;
}


const publicHydrogelPrice =
  document.getElementById("publicHydrogelPrice");

if (publicHydrogelPrice) {
  publicHydrogelPrice.textContent =
    money(CONFIG.hydrogelPrice);
}


const publicHydrogelShotsText =
  document.getElementById("publicHydrogelShotsText");

if (publicHydrogelShotsText) {
  publicHydrogelShotsText.textContent =
    CONFIG.hydrogelShotsText;
}


const publicDeposit =
  document.getElementById("publicDeposit");

if (publicDeposit) {
  publicDeposit.textContent =
    money(CONFIG.deposit);
}


const depositInline =
  document.getElementById("depositInline");

if (depositInline) {
  depositInline.textContent =
    money(CONFIG.deposit);
}


const publicMinPlayers =
  document.getElementById("publicMinPlayers");

if (publicMinPlayers) {
  publicMinPlayers.textContent =
    CONFIG.minPlayers;
}


/* =====================================================
   AÑO
===================================================== */

const yearElement =
  document.getElementById("year");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}


/* =====================================================
   FECHA MÍNIMA
===================================================== */

if (dateInput) {

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  dateInput.min =
    year + "-" + month + "-" + day;
}


/* =====================================================
   CARGAR HORARIOS
===================================================== */

function cargarHorarios() {

  if (!timeSelect) {

    console.error(
      "ERROR: No existe el elemento #time"
    );

    return;
  }


  /* Limpiar horarios anteriores */

  timeSelect.innerHTML = "";


  /* Opción inicial */

  const primeraOpcion =
    document.createElement("option");

  primeraOpcion.value = "";

  primeraOpcion.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    primeraOpcion
  );


  /* Agregar horarios */

  CONFIG.slots.forEach(function (hora) {

    const opcion =
      document.createElement("option");

    opcion.value = hora;

    opcion.textContent = hora;

    timeSelect.appendChild(
      opcion
    );

  });


  console.log(
    "HORARIOS CARGADOS:",
    CONFIG.slots
  );
}


/* =====================================================
   ESTADO INICIAL
===================================================== */

if (timeSelect) {

  timeSelect.innerHTML = "";

  const opcionInicial =
    document.createElement("option");

  opcionInicial.value = "";

  opcionInicial.textContent =
    "Elegí una fecha";

  timeSelect.appendChild(
    opcionInicial
  );
}


/* =====================================================
   CUANDO SE ELIGE UNA FECHA
===================================================== */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      if (!dateInput.value) {

        if (timeSelect) {

          timeSelect.innerHTML = "";

          const opcion =
            document.createElement("option");

          opcion.value = "";

          opcion.textContent =
            "Elegí una fecha";

          timeSelect.appendChild(
            opcion
          );
        }

        return;
      }


      /* Cargar horarios */

      cargarHorarios();

    }
  );
}


/* =====================================================
   MENSAJES
===================================================== */

function showMessage(
  message,
  type
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
    "form-message " +
    (type || "success");
}


/* =====================================================
   CREAR RESERVA
===================================================== */

async function createReservation() {

  if (!bookingForm) {
    return;
  }


  /* -------------------------------------------------
     OBTENER DATOS
  ------------------------------------------------- */

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


  /* -------------------------------------------------
     VALIDAR NOMBRE
  ------------------------------------------------- */

  if (!name) {

    showMessage(
      "Ingresá tu nombre y apellido.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------
     VALIDAR WHATSAPP
  ------------------------------------------------- */

  if (!phone) {

    showMessage(
      "Ingresá tu número de WhatsApp.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------
     VALIDAR FECHA
  ------------------------------------------------- */

  if (!date) {

    showMessage(
      "Elegí una fecha.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------
     VALIDAR HORARIO
  ------------------------------------------------- */

  if (!time) {

    showMessage(
      "Elegí un horario.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------
     VALIDAR JUGADORES
  ------------------------------------------------- */

  if (
    !Number.isFinite(players) ||
    players < CONFIG.minPlayers
  ) {

    showMessage(
      "La reserva requiere un mínimo de " +
      CONFIG.minPlayers +
      " jugadores.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------
     CALCULAR PRECIO
  ------------------------------------------------- */

  const precioPorJugador =
    CONFIG.gamePrice;

  const total =
    precioPorJugador * players;

  const senaRequerida =
    CONFIG.deposit;


  /* -------------------------------------------------
     BOTÓN
  ------------------------------------------------- */

  const submitButton =
    bookingForm.querySelector(
      'button[type="submit"]'
    );


  let textoOriginal =
    "Continuar con la reserva";


  if (submitButton) {

    textoOriginal =
      submitButton.innerHTML;

    submitButton.disabled =
      true;

    submitButton.innerHTML =
      "Guardando reserva...";
  }


  /* =================================================
     ENVIAR A LA API
  ================================================= */

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
              notes

          })
        }
      );


    /* =================================================
       LEER RESPUESTA
    ================================================= */

    const texto =
      await response.text();


    console.log(
      "RESPUESTA DE API:",
      response.status,
      texto
    );


    let data = {};

    try {

      data =
        JSON.parse(texto);

    } catch (error) {

      data = {};

    }


    /* =================================================
       ERROR
    ================================================= */

    if (!response.ok) {

      throw new Error(
        data.message ||
        "No se pudo guardar la reserva."
      );
    }


    /* =================================================
       RESERVA CORRECTA
    ================================================= */

    showMessage(

      "¡Reserva registrada correctamente! " +
      "Fecha: " +
      formatDate(date) +
      " — Horario: " +
      time +
      ". Seña requerida: " +
      money(senaRequerida) +
      ".",

      "success"
    );


    /* =================================================
       LIMPIAR FORMULARIO
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
        CONFIG.minPlayers;
    }


    if (notesInput) {
      notesInput.value = "";
    }


    if (timeSelect) {

      timeSelect.innerHTML = "";

      const opcion =
        document.createElement("option");

      opcion.value = "";

      opcion.textContent =
        "Elegí una fecha";

      timeSelect.appendChild(
        opcion
      );
    }


  } catch (error) {

    console.error(
      "ERROR CREANDO RESERVA:",
      error
    );


    showMessage(
      error.message ||
      "No se pudo guardar la reserva. Intentá nuevamente.",
      "error"
    );


  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        textoOriginal;
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

const whatsappNumber =
  CONFIG.whatsapp;


const whatsappMessage =
  encodeURIComponent(
    "Hola, quiero consultar por una reserva en Aguará Paintball."
  );


const whatsappUrl =
  "https://wa.me/" +
  whatsappNumber +
  "?text=" +
  whatsappMessage;


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
    whatsappUrl;

  whatsappHero.target =
    "_blank";

  whatsappHero.rel =
    "noopener noreferrer";
}


if (whatsappBooking) {

  whatsappBooking.href =
    whatsappUrl;

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
        event.target ===
        lightbox
      ) {

        lightbox.hidden =
          true;
      }
    }
  );
}


/* =====================================================
   CONFIRMACIÓN
===================================================== */

console.log(
  "Aguará Paintball — script.js cargado correctamente."
);

console.log(
  "Horarios disponibles:",
  CONFIG.slots
);
