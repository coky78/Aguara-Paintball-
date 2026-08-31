/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT.JS
   RESERVAS + COMPROBANTE + GALERÍA + CONFIGURACIÓN
===================================================== */


/* =====================================================
   CONFIGURACIÓN POR DEFECTO
===================================================== */

const DEFAULT_CONFIG = {
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


/* =====================================================
   CONFIGURACIÓN ACTUAL
===================================================== */

let CONFIG = {
  ...DEFAULT_CONFIG,
  slots: [...DEFAULT_CONFIG.slots]
};


/* =====================================================
   HELPERS
===================================================== */

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}


function formatDate(date) {

  if (!date) {
    return "";
  }

  const parts = String(date).split("-");

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


function getTodayString() {

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
}


function horaYaPaso(hora) {

  const ahora = new Date();

  const partes =
    String(hora).split(":");

  if (partes.length !== 2) {
    return false;
  }

  const horaNumero =
    Number(partes[0]);

  const minutosNumero =
    Number(partes[1]);

  const horaDelTurno =
    new Date();

  horaDelTurno.setHours(
    horaNumero,
    minutosNumero,
    0,
    0
  );

  return ahora >= horaDelTurno;
}


/* =====================================================
   ELEMENTOS
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

const receiptUpload =
  document.getElementById("receiptUpload");

const receiptFile =
  document.getElementById("receiptFile");

const receiptButton =
  document.getElementById("receiptButton");

const receiptMessage =
  document.getElementById("receiptMessage");

const receiptAmount =
  document.getElementById("receiptAmount");


/* =====================================================
   VARIABLES DE RESERVA
===================================================== */

let currentReservationId = null;

let reservationCreated = false;


/* =====================================================
   ACTUALIZAR INFORMACIÓN PÚBLICA
===================================================== */

function actualizarPrecios() {

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


  if (receiptAmount) {
    receiptAmount.textContent =
      money(CONFIG.deposit);
  }


  if (
    playersInput &&
    (
      !playersInput.value ||
      Number(playersInput.value) < CONFIG.minPlayers
    )
  ) {
    playersInput.value =
      CONFIG.minPlayers;
  }
}


/* =====================================================
   CARGAR CONFIGURACIÓN DESDE /api/config
===================================================== */

async function loadPublicConfig() {

  try {

    const response =
      await fetch(
        "/api/config",
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json"
          },

          cache: "no-store"
        }
      );


    const text =
      await response.text();


    console.log(
      "RESPUESTA CONFIG:",
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
      !data.ok ||
      !data.config
    ) {

      throw new Error(
        data.message ||
        "No se pudo cargar la configuración."
      );
    }


    CONFIG = {
      ...DEFAULT_CONFIG,
      ...data.config,

      slots:
        Array.isArray(data.config.slots) &&
        data.config.slots.length
          ? data.config.slots
          : [...DEFAULT_CONFIG.slots]
    };


    actualizarPrecios();


    console.log(
      "CONFIGURACIÓN CARGADA:",
      CONFIG
    );


  } catch (error) {

    console.error(
      "ERROR CARGANDO CONFIGURACIÓN:",
      error
    );


    CONFIG = {
      ...DEFAULT_CONFIG,
      slots: [...DEFAULT_CONFIG.slots]
    };


    actualizarPrecios();
  }
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
   NO PERMITIR DÍAS ANTERIORES
===================================================== */

if (dateInput) {

  const todayString =
    getTodayString();

  dateInput.min =
    todayString;

  if (
    dateInput.value &&
    dateInput.value < todayString
  ) {
    dateInput.value = "";
  }
}


/* =====================================================
   HORARIOS
   NO MUESTRA HORARIOS PASADOS SI ES HOY
===================================================== */

function cargarHorarios() {

  if (!timeSelect) {
    return;
  }


  timeSelect.innerHTML = "";


  const primeraOpcion =
    document.createElement("option");

  primeraOpcion.value =
    "";

  primeraOpcion.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    primeraOpcion
  );


  const fechaSeleccionada =
    dateInput
      ? dateInput.value
      : "";


  const hoy =
    getTodayString();


  CONFIG.slots.forEach(
    function (hora) {

      /*
         Si es HOY y el horario ya pasó,
         no lo mostramos.
      */

      if (
        fechaSeleccionada === hoy &&
        horaYaPaso(hora)
      ) {
        return;
      }


      const opcion =
        document.createElement("option");

      opcion.value =
        hora;

      opcion.textContent =
        hora;

      timeSelect.appendChild(
        opcion
      );

    }
  );


  /*
     Si hoy ya no quedan horarios,
     mostramos un mensaje.
  */

  if (
    fechaSeleccionada === hoy &&
    timeSelect.options.length === 1
  ) {

    primeraOpcion.textContent =
      "No quedan horarios disponibles hoy";
  }


  console.log(
    "HORARIOS CARGADOS:",
    CONFIG.slots
  );
}


/* =====================================================
   ESTADO INICIAL DE HORARIOS
===================================================== */

if (timeSelect) {

  timeSelect.innerHTML = "";

  const opcionInicial =
    document.createElement("option");

  opcionInicial.value =
    "";

  opcionInicial.textContent =
    "Elegí una fecha";

  timeSelect.appendChild(
    opcionInicial
  );
}


/* =====================================================
   AL ELEGIR FECHA
===================================================== */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      const todayString =
        getTodayString();


      /*
         Seguridad adicional:
         nunca aceptar una fecha anterior.
      */

      if (
        dateInput.value &&
        dateInput.value < todayString
      ) {

        dateInput.value = "";

        if (timeSelect) {

          timeSelect.innerHTML = "";

          const opcion =
            document.createElement("option");

          opcion.value =
            "";

          opcion.textContent =
            "Elegí una fecha";

          timeSelect.appendChild(
            opcion
          );
        }

        return;
      }


      if (!dateInput.value) {

        if (timeSelect) {

          timeSelect.innerHTML = "";

          const opcion =
            document.createElement("option");

          opcion.value =
            "";

          opcion.textContent =
            "Elegí una fecha";

          timeSelect.appendChild(
            opcion
          );
        }

        return;
      }


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
   MENSAJES COMPROBANTE
===================================================== */

function showReceiptMessage(
  message,
  type
) {

  if (!receiptMessage) {

    alert(message);

    return;
  }


  receiptMessage.hidden =
    false;

  receiptMessage.textContent =
    message;

  receiptMessage.className =
    "form-message " +
    (type || "success");
}


/* =====================================================
   BASE64
===================================================== */

function fileToBase64(file) {

  return new Promise(
    function (resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(
              reader.result || ""
            );

          const comma =
            result.indexOf(",");


          resolve(
            comma >= 0
              ? result.slice(comma + 1)
              : result
          );
        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "No se pudo leer el comprobante."
            )
          );

        };


      reader.readAsDataURL(file);

    }
  );
}


/* =====================================================
   SUBIR COMPROBANTE
===================================================== */

async function uploadReceipt() {

  if (!currentReservationId) {

    showReceiptMessage(
      "Primero tenés que realizar una reserva.",
      "error"
    );

    return;
  }


  if (
    !receiptFile ||
    !receiptFile.files ||
    !receiptFile.files.length
  ) {

    showReceiptMessage(
      "Seleccioná el comprobante de pago.",
      "error"
    );

    return;
  }


  const file =
    receiptFile.files[0];


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    showReceiptMessage(
      "Formato no permitido. Subí JPG, PNG, WEBP o PDF.",
      "error"
    );

    return;
  }


  if (
    file.size >
    3 * 1024 * 1024
  ) {

    showReceiptMessage(
      "El comprobante no puede superar los 3 MB.",
      "error"
    );

    return;
  }


  const textoOriginal =
    receiptButton
      ? receiptButton.innerHTML
      : "Enviar comprobante";


  if (receiptButton) {

    receiptButton.disabled =
      true;

    receiptButton.innerHTML =
      "Enviando comprobante...";
  }


  try {

    const base64 =
      await fileToBase64(file);


    const response =
      await fetch(
        "/api/upload-receipt",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body: JSON.stringify({

            public_id:
              currentReservationId,

            file_name:
              file.name,

            content_type:
              file.type,

            file_base64:
              base64

          })
        }
      );


    const text =
      await response.text();


    console.log(
      "RESPUESTA COMPROBANTE:",
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


    if (!response.ok) {

      throw new Error(
        data.message ||
        "No se pudo enviar el comprobante."
      );
    }


    showReceiptMessage(
      "¡Comprobante recibido correctamente! Aguará revisará el pago y confirmará tu turno.",
      "success"
    );


    if (receiptFile) {
      receiptFile.value = "";
    }


    if (receiptButton) {

      receiptButton.innerHTML =
        "Comprobante enviado ✓";

      receiptButton.disabled =
        true;
    }


  } catch (error) {

    console.error(
      "ERROR ENVIANDO COMPROBANTE:",
      error
    );


    showReceiptMessage(
      error.message ||
      "No se pudo enviar el comprobante.",
      "error"
    );


    if (receiptButton) {

      receiptButton.disabled =
        false;

      receiptButton.innerHTML =
        textoOriginal;
    }

  }
}


/* =====================================================
   BOTÓN COMPROBANTE
===================================================== */

if (receiptButton) {

  receiptButton.addEventListener(
    "click",
    uploadReceipt
  );
}


/* =====================================================
   CREAR RESERVA
===================================================== */

async function createReservation() {

  if (!bookingForm) {
    return;
  }


  if (reservationCreated) {
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


  /* =================================================
     VALIDACIONES
  ================================================= */

  if (!name) {

    showMessage(
      "Ingresá tu nombre y apellido.",
      "error"
    );

    return;
  }


  if (!phone) {

    showMessage(
      "Ingresá tu número de WhatsApp.",
      "error"
    );

    return;
  }


  if (!date) {

    showMessage(
      "Elegí una fecha.",
      "error"
    );

    return;
  }


  /*
     No permitir fechas anteriores.
  */

  if (date < getTodayString()) {

    showMessage(
      "No se pueden reservar días anteriores.",
      "error"
    );

    return;
  }


  if (!time) {

    showMessage(
      "Elegí un horario.",
      "error"
    );

    return;
  }


  /*
     Si es hoy, verificar nuevamente
     que el horario no haya pasado.
  */

  if (
    date === getTodayString() &&
    horaYaPaso(time)
  ) {

    showMessage(
      "Ese horario ya pasó. Elegí otro horario.",
      "error"
    );

    cargarHorarios();

    return;
  }


  if (
    !Number.isInteger(players) ||
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


  /* =================================================
     PRECIOS
  ================================================= */

  const precioPorJugador =
    Number(CONFIG.gamePrice);

  const total =
    precioPorJugador *
    players;

  const senaRequerida =
    Number(CONFIG.deposit);


  /* =================================================
     BOTÓN CONTINUAR
  ================================================= */

  const submitButton =
    bookingForm.querySelector(
      'button[type="submit"]'
    );


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.innerHTML =
      "Guardando reserva...";
  }


  /* =================================================
     API
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

    } catch {

      data = {};

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "No se pudo guardar la reserva."
      );
    }


    /* =================================================
       RESERVA CREADA
    ================================================= */

    const reservaCreada =
      data.reserva || {};


    currentReservationId =
      reservaCreada.public_id ||
      data.public_id ||
      null;


    console.log(
      "RESERVA CREADA:",
      reservaCreada
    );


    if (!currentReservationId) {

      throw new Error(
        "La reserva se guardó, pero no recibimos el identificador de la reserva."
      );
    }


    reservationCreated =
      true;


    /* =================================================
       MENSAJE
    ================================================= */

    showMessage(

      "¡Reserva registrada correctamente! " +
      "Fecha: " +
      formatDate(date) +
      " — Horario: " +
      time +
      ". Seña requerida: " +
      money(senaRequerida) +
      ". Ahora podés enviar el comprobante.",

      "success"
    );


    /* =================================================
       OCULTAR BOTÓN CONTINUAR
    ================================================= */

    if (submitButton) {

      submitButton.style.display =
        "none";
    }


    /* =================================================
       MOSTRAR COMPROBANTE
    ================================================= */

    if (receiptUpload) {

      receiptUpload.hidden =
        false;

      receiptUpload.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }


    /*
       NO BORRAMOS:
       dateInput
       timeSelect

       Así no desaparecen los horarios.
    */


    if (nameInput) {
      nameInput.value = "";
    }


    if (phoneInput) {
      phoneInput.value = "";
    }


    if (playersInput) {
      playersInput.value =
        CONFIG.minPlayers;
    }


    if (notesInput) {
      notesInput.value = "";
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


    reservationCreated =
      false;


    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        "Continuar con la reserva <span>→</span>";

      submitButton.style.display =
        "";
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

function configurarWhatsApp() {

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
   INICIO
===================================================== */

actualizarPrecios();

configurarWhatsApp();

console.log(
  "Aguará Paintball — script.js cargado correctamente."
);

console.log(
  "Configuración inicial:",
  CONFIG
);


/* =====================================================
   CARGAR CONFIGURACIÓN REAL
===================================================== */

loadPublicConfig();
