```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT PRINCIPAL — VERSIÓN CORREGIDA
===================================================== */

(function () {

  "use strict";


  /* =====================================================
     CONFIGURACIÓN
  ===================================================== */

  var DEFAULTS = {

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

    var saved = {};

    try {

      saved = JSON.parse(
        localStorage.getItem("aguaraConfig") || "{}"
      );

    } catch (error) {

      console.warn(
        "No se pudo leer aguaraConfig."
      );

      saved = {};

    }

    var config = {};

    Object.assign(
      config,
      DEFAULTS,
      saved
    );

    /*
      Si por algún motivo la configuración guardada
      tiene slots vacíos o dañados, usamos los horarios
      originales.
    */

    if (
      !Array.isArray(config.slots) ||
      config.slots.length === 0
    ) {

      config.slots = DEFAULTS.slots.slice();

    }

    return config;

  }


  var cfg = getConfig();


  /* =====================================================
     DINERO
  ===================================================== */

  function money(value) {

    var number = Number(value) || 0;

    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }
    ).format(number);

  }


  /* =====================================================
     FECHA
  ===================================================== */

  function formatDate(date) {

    if (!date) {
      return "";
    }

    var parts = String(date).split("-");

    if (parts.length !== 3) {
      return String(date);
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
     ELEMENTOS
  ===================================================== */

  var bookingForm =
    document.getElementById("bookingForm");

  var dateInput =
    document.getElementById("date");

  var timeSelect =
    document.getElementById("time");

  var nameInput =
    document.getElementById("name");

  var phoneInput =
    document.getElementById("phone");

  var playersInput =
    document.getElementById("players");

  var notesInput =
    document.getElementById("notes");

  var bookingMessage =
    document.getElementById("bookingMessage");


  /* =====================================================
     PRECIOS
  ===================================================== */

  var publicGamePrice =
    document.getElementById("publicGamePrice");

  if (publicGamePrice) {

    publicGamePrice.textContent =
      money(cfg.gamePrice);

  }


  var publicShotsText =
    document.getElementById("publicShotsText");

  if (publicShotsText) {

    publicShotsText.textContent =
      cfg.shotsText;

  }


  var publicHydrogelPrice =
    document.getElementById("publicHydrogelPrice");

  if (publicHydrogelPrice) {

    publicHydrogelPrice.textContent =
      money(cfg.hydrogelPrice);

  }


  var publicHydrogelShotsText =
    document.getElementById(
      "publicHydrogelShotsText"
    );

  if (publicHydrogelShotsText) {

    publicHydrogelShotsText.textContent =
      cfg.hydrogelShotsText;

  }


  var publicDeposit =
    document.getElementById("publicDeposit");

  if (publicDeposit) {

    publicDeposit.textContent =
      money(cfg.deposit);

  }


  var depositInline =
    document.getElementById("depositInline");

  if (depositInline) {

    depositInline.textContent =
      money(cfg.deposit);

  }


  var publicMinPlayers =
    document.getElementById("publicMinPlayers");

  if (publicMinPlayers) {

    publicMinPlayers.textContent =
      cfg.minPlayers;

  }


  /* =====================================================
     AÑO
  ===================================================== */

  var yearElement =
    document.getElementById("year");

  if (yearElement) {

    yearElement.textContent =
      new Date().getFullYear();

  }


  /* =====================================================
     FECHA MÍNIMA
  ===================================================== */

  if (dateInput) {

    var today = new Date();

    var currentYear =
      today.getFullYear();

    var currentMonth =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    var currentDay =
      String(
        today.getDate()
      ).padStart(2, "0");

    dateInput.min =
      currentYear +
      "-" +
      currentMonth +
      "-" +
      currentDay;

  }


  /* =====================================================
     CARGAR HORARIOS
  ===================================================== */

  function loadSlots() {

    if (!timeSelect) {

      console.error(
        "Aguará: no existe el elemento #time."
      );

      return;

    }


    timeSelect.innerHTML = "";


    var firstOption =
      document.createElement("option");

    firstOption.value = "";

    firstOption.textContent =
      "Elegí un horario";

    timeSelect.appendChild(
      firstOption
    );


    for (
      var i = 0;
      i < cfg.slots.length;
      i++
    ) {

      var slot =
        cfg.slots[i];

      var option =
        document.createElement("option");

      option.value =
        slot;

      option.textContent =
        slot;

      timeSelect.appendChild(
        option
      );

    }


    console.log(
      "Aguará: horarios cargados correctamente.",
      cfg.slots
    );

  }


  /* =====================================================
     ESTADO INICIAL DEL SELECTOR
  ===================================================== */

  function resetTimeSelect() {

    if (!timeSelect) {
      return;
    }

    timeSelect.innerHTML = "";


    var option =
      document.createElement("option");

    option.value = "";

    option.textContent =
      "Elegí una fecha";

    timeSelect.appendChild(
      option
    );

  }


  resetTimeSelect();


  /* =====================================================
     AL ELEGIR FECHA
  ===================================================== */

  if (dateInput) {

    dateInput.addEventListener(
      "change",
      function () {

        if (!dateInput.value) {

          resetTimeSelect();

          return;

        }

        /*
          Al seleccionar una fecha,
          aparecen inmediatamente todos
          los horarios disponibles configurados.
        */

        loadSlots();

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


    bookingMessage.hidden = false;

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

    var name =
      nameInput
        ? nameInput.value.trim()
        : "";

    var phone =
      phoneInput
        ? phoneInput.value.trim()
        : "";

    var date =
      dateInput
        ? dateInput.value
        : "";

    var time =
      timeSelect
        ? timeSelect.value
        : "";

    var players =
      playersInput
        ? Number(playersInput.value)
        : 0;

    var notes =
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
      players < Number(cfg.minPlayers)
    ) {

      showMessage(
        "La reserva requiere un mínimo de " +
        cfg.minPlayers +
        " jugadores.",
        "error"
      );

      return;

    }


    /* =================================================
       PRECIO
    ================================================= */

    var pricePerPlayer =
      Number(cfg.gamePrice) || 0;

    var total =
      pricePerPlayer * players;

    var deposit =
      Number(cfg.deposit) || 0;


    /* =================================================
       BOTÓN
    ================================================= */

    var submitButton = null;

    if (bookingForm) {

      submitButton =
        bookingForm.querySelector(
          'button[type="submit"]'
        );

    }


    var originalText =
      "Continuar con la reserva";


    if (submitButton) {

      originalText =
        submitButton.innerHTML;

      submitButton.disabled = true;

      submitButton.innerHTML =
        "Guardando reserva...";

    }


    /* =================================================
       ENVIAR A API
    ================================================= */

    try {

      var response =
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


      /* =================================================
         LEER RESPUESTA
      ================================================= */

      var text =
        await response.text();

      console.log(
        "Aguará API:",
        response.status,
        text
      );


      var data = {};

      try {

        data =
          JSON.parse(text);

      } catch (error) {

        data = {};

      }


      if (!response.ok) {

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
        formatDate(date) +
        " — Horario: " +
        time +
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

      resetTimeSelect();


    } catch (error) {

      console.error(
        "Aguará — ERROR CREANDO RESERVA:",
        error
      );

      showMessage(
        error.message ||
        "No se pudo guardar la reserva. Intentá nuevamente.",
        "error"
      );


    } finally {

      if (submitButton) {

        submitButton.disabled = false;

        submitButton.innerHTML =
          originalText;

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

  var waNumber =
    cfg.whatsapp ||
    "5493794250285";

  var waMessage =
    encodeURIComponent(
      "Hola, quiero consultar por una reserva en Aguará Paintball."
    );

  var waUrl =
    "https://wa.me/" +
    waNumber +
    "?text=" +
    waMessage;


  var whatsappHero =
    document.getElementById(
      "whatsappHero"
    );

  var whatsappBooking =
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

  var lightbox =
    document.getElementById(
      "lightbox"
    );

  var lightboxImg =
    document.getElementById(
      "lightboxImg"
    );

  var closeLightbox =
    document.getElementById(
      "closeLightbox"
    );

  var galleryItems =
    document.querySelectorAll(
      ".gallery-item"
    );


  galleryItems.forEach(
    function (item) {

      item.addEventListener(
        "click",
        function () {

          var source =
            item.getAttribute(
              "data-src"
            );

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
    "Horarios configurados:",
    cfg.slots
  );

})();
```
