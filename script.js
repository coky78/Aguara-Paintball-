```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT PRINCIPAL
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
   CONFIGURACIÓN GUARDADA
===================================================== */

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
  ).format(
    Number(value) || 0
  );

}


/* =====================================================
   FORMATO DE FECHA
===================================================== */

function formatDate(dateValue) {

  if (!dateValue) {
    return "";
  }

  const text =
    String(dateValue).trim();

  /*
   * Si viene como:
   * 2026-09-29
   */

  const isoMatch =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (isoMatch) {

    return (
      isoMatch[3] +
      "/" +
      isoMatch[2] +
      "/" +
      isoMatch[1]
    );

  }


  /*
   * Si por algún motivo ya viene
   * como 29/09/2026
   */

  const slashMatch =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

  if (slashMatch) {

    return text;

  }


  /*
   * Último intento
   */

  const date =
    new Date(text);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const year =
      date.getFullYear();

    return (
      day +
      "/" +
      month +
      "/" +
      year
    );

  }


  return text;

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
   PRECIOS
===================================================== */

const gamePrice =
  document.getElementById(
    "publicGamePrice"
  );

if (gamePrice) {

  gamePrice.textContent =
    money(cfg.gamePrice);

}


const shotsText =
  document.getElementById(
    "publicShotsText"
  );

if (shotsText) {

  shotsText.textContent =
    cfg.shotsText;

}


const hydrogelPrice =
  document.getElementById(
    "publicHydrogelPrice"
  );

if (hydrogelPrice) {

  hydrogelPrice.textContent =
    money(cfg.hydrogelPrice);

}


const hydrogelShotsText =
  document.getElementById(
    "publicHydrogelShotsText"
  );

if (hydrogelShotsText) {

  hydrogelShotsText.textContent =
    cfg.hydrogelShotsText;

}


const publicDeposit =
  document.getElementById(
    "publicDeposit"
  );

if (publicDeposit) {

  publicDeposit.textContent =
    money(cfg.deposit);

}


const depositInline =
  document.getElementById(
    "depositInline"
  );

if (depositInline) {

  depositInline.textContent =
    money(cfg.deposit);

}


const publicMinPlayers =
  document.getElementById(
    "publicMinPlayers"
  );

if (publicMinPlayers) {

  publicMinPlayers.textContent =
    cfg.minPlayers;

}


/* =====================================================
   ELEMENTOS DEL FORMULARIO
===================================================== */

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


/* =====================================================
   FECHA MÍNIMA
===================================================== */

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


/* =====================================================
   MOSTRAR HORARIOS
===================================================== */

function showSlots() {

  if (!timeSelect) {

    console.error(
      "No se encontró #time"
    );

    return;

  }


  timeSelect.innerHTML =
    "";


  const firstOption =
    document.createElement(
      "option"
    );

  firstOption.value =
    "";

  firstOption.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    firstOption
  );


  /*
   * Mostrar todos los horarios.
   * No depende de ninguna API.
   */

  cfg.slots.forEach(
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

}


/* =====================================================
   CAMBIO DE FECHA
===================================================== */

if (dateInput) {

  dateInput.addEventListener(
    "change",
    function () {

      showSlots();

    }
  );

}


/* =====================================================
   ESTADO INICIAL
===================================================== */

if (timeSelect) {

  timeSelect.innerHTML =
    "";

  const initialOption =
    document.createElement(
      "option"
    );

  initialOption.value =
    "";

  initialOption.textContent =
    "Elegí un horario";

  timeSelect.appendChild(
    initialOption
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
    "form-message " + type;

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


  if (!time) {

    showMessage(
      "Elegí un horario.",
      "error"
    );

    return;

  }


  if (
    !Number.isFinite(players) ||
    players < Number(
      cfg.minPlayers
    )
  ) {

    showMessage(
      `La reserva requiere un mínimo de ${cfg.minPlayers} jugadores.`,
      "error"
    );

    return;

  }


  /* =================================================
     PRECIO
  ================================================= */

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


  /* =================================================
     FECHA PARA MOSTRAR
  ================================================= */

  const formattedDate =
    formatDate(date);


  /* =================================================
     BOTÓN
  ================================================= */

  const submitButton =
    bookingForm.querySelector(
      'button[type="submit"]'
    );


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.dataset.original =
      submitButton.innerHTML;

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


    /* =================================================
       ÉXITO
    ================================================= */

    showMessage(
      "¡Reserva registrada correctamente! " +
      "Fecha: " +
      formattedDate +
      " — Horario: " +
      time +
      ". Seña requerida: " +
      money(deposit) +
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
        cfg.minPlayers;
    }

    if (notesInput) {
      notesInput.value = "";
    }

    if (timeSelect) {

      timeSelect.innerHTML =
        "";

      const option =
        document.createElement(
          "option"
        );

      option.value =
        "";

      option.textContent =
        "Elegí un horario";

      timeSelect.appendChild(
        option
      );

    }


  } catch (error) {

    console.error(
      "Error creando reserva:",
      error
    );

    showMessage(
      "No se pudo guardar la reserva. Intentá nuevamente.",
      "error"
    );


  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        submitButton.dataset.original ||
        "Continuar con la reserva";

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
   COMPROBACIÓN
===================================================== */

console.log(
  "Aguará Paintball: script.js cargado correctamente."
);

console.log(
  "Formato de fecha activo."
);
```
