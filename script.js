```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT.JS — RESERVAS + COMPROBANTE
===================================================== */

const CONFIG = {
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
  if (!date) return "";

  const parts = String(date).split("-");

  if (parts.length !== 3) {
    return date;
  }

  return parts[2] + "/" + parts[1] + "/" + parts[0];
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


/* =====================================================
   COMPROBANTE
===================================================== */

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
   BOTÓN CONTINUAR
===================================================== */

const continueReservationButton =
  document.getElementById(
    "continueReservationButton"
  );


/* =====================================================
   ID DE RESERVA
===================================================== */

let currentReservationId = null;


/* =====================================================
   ESTADO DE RESERVA
===================================================== */

let reservationCreated = false;

let receiptConfirmed = false;


/* =====================================================
   FUNCIONES VISUALES
===================================================== */

/*
   COLOR VERDE OFICIAL
*/

const GREEN = "#25a244";
const GREEN_DARK = "#1b7f35";
const GREEN_LIGHT = "#dff6e5";
const GREEN_BORDER = "#25a244";


/* =====================================================
   MARCAR BOTÓN CONTINUAR EN VERDE
===================================================== */

function marcarReservaCreada() {

  const button =
    continueReservationButton ||
    (
      bookingForm
        ? bookingForm.querySelector(
            'button[type="submit"]'
          )
        : null
    );

  if (!button) {
    console.error(
      "No se encontró el botón Continuar con la reserva."
    );
    return;
  }


  reservationCreated = true;


  /*
     Clases
  */

  button.classList.add("btn-success");
  button.classList.add("reservation-created");
  button.classList.add("reservation-confirmed");
  button.classList.add("confirmed");


  /*
     ESTILOS DIRECTOS
     !important para evitar que
     style.css los pise.
  */

  button.style.setProperty(
    "background-color",
    GREEN,
    "important"
  );

  button.style.setProperty(
    "border-color",
    GREEN,
    "important"
  );

  button.style.setProperty(
    "color",
    "#ffffff",
    "important"
  );

  button.style.setProperty(
    "box-shadow",
    "0 6px 18px rgba(37,162,68,0.30)",
    "important"
  );


  button.innerHTML =
    "RESERVA REGISTRADA ✓";


  /*
     IMPORTANTE:
     No lo dejamos deshabilitado.
     Solo queda visualmente confirmado.
  */

  button.disabled = true;


  console.log(
    "BOTÓN CONTINUAR MARCADO EN VERDE"
  );
}


/* =====================================================
   MARCAR COMPROBANTE CONFIRMADO
===================================================== */

function marcarComprobanteConfirmado() {

  receiptConfirmed = true;


  /* -----------------------------------------------
     CAJA COMPLETA
  ------------------------------------------------ */

  if (receiptUpload) {

    receiptUpload.hidden = false;

    receiptUpload.classList.add(
      "receipt-confirmed"
    );

    receiptUpload.classList.add(
      "reservation-confirmed"
    );

    receiptUpload.classList.add(
      "confirmed"
    );


    receiptUpload.style.setProperty(
      "background-color",
      GREEN_LIGHT,
      "important"
    );

    receiptUpload.style.setProperty(
      "border",
      "3px solid " + GREEN_BORDER,
      "important"
    );

    receiptUpload.style.setProperty(
      "border-radius",
      "14px",
      "important"
    );

    receiptUpload.style.setProperty(
      "box-shadow",
      "0 8px 25px rgba(37,162,68,0.25)",
      "important"
    );

    receiptUpload.style.setProperty(
      "padding",
      "25px",
      "important"
    );

    receiptUpload.style.setProperty(
      "margin-top",
      "50px",
      "important"
    );
  }


  /* -----------------------------------------------
     BOTÓN COMPROBANTE
  ------------------------------------------------ */

  if (receiptButton) {

    receiptButton.classList.add(
      "btn-success"
    );

    receiptButton.classList.add(
      "receipt-confirmed"
    );

    receiptButton.classList.add(
      "reservation-confirmed"
    );

    receiptButton.classList.add(
      "confirmed"
    );


    receiptButton.style.setProperty(
      "background-color",
      GREEN,
      "important"
    );

    receiptButton.style.setProperty(
      "border-color",
      GREEN,
      "important"
    );

    receiptButton.style.setProperty(
      "color",
      "#ffffff",
      "important"
    );

    receiptButton.style.setProperty(
      "box-shadow",
      "0 6px 18px rgba(37,162,68,0.30)",
      "important"
    );

    receiptButton.style.setProperty(
      "margin-bottom",
      "30px",
      "important"
    );


    receiptButton.innerHTML =
      "RESERVA CONFIRMADA ✓";


    receiptButton.disabled = true;
  }


  /* -----------------------------------------------
     MENSAJE
  ------------------------------------------------ */

  if (receiptMessage) {

    receiptMessage.hidden = false;

    receiptMessage.style.setProperty(
      "background-color",
      "#bdecc8",
      "important"
    );

    receiptMessage.style.setProperty(
      "border",
      "2px solid " + GREEN_BORDER,
      "important"
    );

    receiptMessage.style.setProperty(
      "color",
      "#155d27",
      "important"
    );

    receiptMessage.style.setProperty(
      "font-weight",
      "800",
      "important"
    );

    receiptMessage.innerHTML =
      "🟢 RESERVA CONFIRMADA<br>" +
      "¡Comprobante recibido correctamente! " +
      "Aguará revisará el pago.";
  }


  /*
     BODY
  */

  document.body.classList.add(
    "reservation-confirmed"
  );


  console.log(
    "COMPROBANTE MARCADO EN VERDE"
  );
}


/* =====================================================
   SEPARACIÓN ENTRE BOTONES
===================================================== */

function aplicarSeparacionBotones() {

  const continueButton =
    continueReservationButton ||
    (
      bookingForm
        ? bookingForm.querySelector(
            'button[type="submit"]'
          )
        : null
    );


  if (continueButton) {

    continueButton.style.setProperty(
      "margin-top",
      "30px",
      "important"
    );

    continueButton.style.setProperty(
      "margin-bottom",
      "30px",
      "important"
    );

    continueButton.style.setProperty(
      "display",
      "block",
      "important"
    );

    continueButton.style.setProperty(
      "width",
      "100%",
      "important"
    );
  }


  if (receiptButton) {

    receiptButton.style.setProperty(
      "margin-top",
      "20px",
      "important"
    );

    receiptButton.style.setProperty(
      "margin-bottom",
      "30px",
      "important"
    );

    receiptButton.style.setProperty(
      "display",
      "block",
      "important"
    );

    receiptButton.style.setProperty(
      "width",
      "100%",
      "important"
    );
  }


  if (receiptUpload) {

    receiptUpload.style.setProperty(
      "margin-top",
      "40px",
      "important"
    );

    receiptUpload.style.setProperty(
      "margin-bottom",
      "30px",
      "important"
    );
  }
}


/* =====================================================
   PRECIOS
===================================================== */

const publicGamePrice =
  document.getElementById(
    "publicGamePrice"
  );

if (publicGamePrice) {
  publicGamePrice.textContent =
    money(CONFIG.gamePrice);
}


const publicShotsText =
  document.getElementById(
    "publicShotsText"
  );

if (publicShotsText) {
  publicShotsText.textContent =
    CONFIG.shotsText;
}


const publicHydrogelPrice =
  document.getElementById(
    "publicHydrogelPrice"
  );

if (publicHydrogelPrice) {
  publicHydrogelPrice.textContent =
    money(CONFIG.hydrogelPrice);
}


const publicHydrogelShotsText =
  document.getElementById(
    "publicHydrogelShotsText"
  );

if (publicHydrogelShotsText) {
  publicHydrogelShotsText.textContent =
    CONFIG.hydrogelShotsText;
}


const publicDeposit =
  document.getElementById(
    "publicDeposit"
  );

if (publicDeposit) {
  publicDeposit.textContent =
    money(CONFIG.deposit);
}


const depositInline =
  document.getElementById(
    "depositInline"
  );

if (depositInline) {
  depositInline.textContent =
    money(CONFIG.deposit);
}


const publicMinPlayers =
  document.getElementById(
    "publicMinPlayers"
  );

if (publicMinPlayers) {
  publicMinPlayers.textContent =
    CONFIG.minPlayers;
}


if (receiptAmount) {
  receiptAmount.textContent =
    money(CONFIG.deposit);
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
    year + "-" +
    month + "-" +
    day;
}


/* =====================================================
   HORARIOS
===================================================== */

function cargarHorarios() {

  if (!timeSelect) {
    return;
  }


  timeSelect.innerHTML = "";


  const primeraOpcion =
    document.createElement("option");

  primeraOpcion.value = "";

  primeraOpcion.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    primeraOpcion
  );


  CONFIG.slots.forEach(
    function (hora) {

      const opcion =
        document.createElement("option");

      opcion.value = hora;

      opcion.textContent = hora;

      timeSelect.appendChild(
        opcion
      );
    }
  );


  console.log(
    "HORARIOS CARGADOS:",
    CONFIG.slots
  );
}


/* =====================================================
   ESTADO INICIAL HORARIO
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
   CAMBIO DE FECHA
===================================================== */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      if (!dateInput.value) {

        if (timeSelect) {

          timeSelect.innerHTML = "";


          const opcion =
            document.createElement(
              "option"
            );

          opcion.value = "";

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
   MENSAJE RESERVA
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
   MENSAJE COMPROBANTE
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
   ARCHIVO BASE64
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
              ? result.slice(
                  comma + 1
                )
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
    !allowedTypes.includes(file.type)
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


  const originalText =
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


    /*
       ÉXITO
    */

    marcarComprobanteConfirmado();


    if (receiptFile) {
      receiptFile.value = "";
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
        originalText;
    }
  }
}


/* =====================================================
   BOTÓN COMPROBANTE
===================================================== */

if (receiptButton) {

  receiptButton.addEventListener(
    "click",
    function () {

      uploadReceipt();

    }
  );
}


/* =====================================================
   CREAR RESERVA
===================================================== */

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


  /* -----------------------------------------------
     VALIDACIONES
  ------------------------------------------------ */

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


  if (!time) {

    showMessage(
      "Elegí un horario.",
      "error"
    );

    return;
  }


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


  /* -----------------------------------------------
     PRECIOS
  ------------------------------------------------ */

  const precioPorJugador =
    CONFIG.gamePrice;

  const total =
    precioPorJugador * players;

  const senaRequerida =
    CONFIG.deposit;


  /* -----------------------------------------------
     BOTÓN
  ------------------------------------------------ */

  const submitButton =
    continueReservationButton ||
    bookingForm.querySelector(
      'button[type="submit"]'
    );


  let textoOriginal =
    submitButton
      ? submitButton.innerHTML
      : "Continuar con la reserva";


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.innerHTML =
      "Guardando reserva...";
  }


  try {

    /* ---------------------------------------------
       API
    --------------------------------------------- */

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


    /* ---------------------------------------------
       OBTENER ID
    --------------------------------------------- */

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


    /* ---------------------------------------------
       ÉXITO
    --------------------------------------------- */

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


    /*
       MARCAR BOTÓN VERDE
    */

    marcarReservaCreada();


    /*
       MOSTRAR COMPROBANTE
    */

    if (receiptUpload) {

      receiptUpload.hidden =
        false;


      receiptUpload.style.setProperty(
        "margin-top",
        "50px",
        "important"
      );


      receiptUpload.style.setProperty(
        "margin-bottom",
        "30px",
        "important"
      );


      receiptUpload.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }


    /* ---------------------------------------------
       LIMPIAR CAMPOS
    --------------------------------------------- */

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
        document.createElement(
          "option"
        );


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


    /*
       SOLO SI FALLÓ
    */

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        textoOriginal;


      submitButton.classList.remove(
        "btn-success"
      );

      submitButton.classList.remove(
        "reservation-created"
      );

      submitButton.classList.remove(
        "reservation-confirmed"
      );

      submitButton.classList.remove(
        "confirmed"
      );


      submitButton.style.removeProperty(
        "background-color"
      );

      submitButton.style.removeProperty(
        "border-color"
      );

      submitButton.style.removeProperty(
        "box-shadow"
      );

      submitButton.style.removeProperty(
        "color"
      );
    }


    currentReservationId =
      null;

    reservationCreated =
      false;


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
        lightbox.hidden = true;
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

        lightbox.hidden = true;
      }
    }
  );
}


/* =====================================================
   INICIALIZACIÓN VISUAL
===================================================== */

aplicarSeparacionBotones();


console.log(
  "Aguará Paintball — script.js cargado correctamente."
);

console.log(
  "Horarios disponibles:",
  CONFIG.slots
);
```
