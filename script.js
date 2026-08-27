/* =====================================================
   AGUARÁ PAINTBALL
   SCRIPT PRINCIPAL
===================================================== */

(function () {

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
     OBTENER CONFIGURACIÓN
  ===================================================== */

  function getConfig() {

    let saved = {};

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


    const config = {
      ...DEFAULTS,
      ...saved
    };


    /*
     * IMPORTANTE:
     * Si slots viene guardado como texto,
     * lo convertimos automáticamente en array.
     */

    if (typeof config.slots === "string") {

      config.slots = config.slots
        .split(",")
        .map(function (slot) {
          return slot.trim();
        })
        .filter(Boolean);

    }


    /*
     * Si por algún motivo slots no es un array,
     * usamos los horarios originales.
     */

    if (!Array.isArray(config.slots)) {

      config.slots = [
        ...DEFAULTS.slots
      ];

    }


    return config;

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
     ELEMENTOS
  ===================================================== */

  const yearElement =
    document.getElementById("year");

  const publicGamePrice =
    document.getElementById("publicGamePrice");

  const publicShotsText =
    document.getElementById("publicShotsText");

  const publicHydrogelPrice =
    document.getElementById("publicHydrogelPrice");

  const publicHydrogelShotsText =
    document.getElementById("publicHydrogelShotsText");

  const publicDeposit =
    document.getElementById("publicDeposit");

  const depositInline =
    document.getElementById("depositInline");

  const publicMinPlayers =
    document.getElementById("publicMinPlayers");


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

  if (publicGamePrice) {

    publicGamePrice.textContent =
      money(cfg.gamePrice);

  }


  if (publicShotsText) {

    publicShotsText.textContent =
      cfg.shotsText;

  }


  if (publicHydrogelPrice) {

    publicHydrogelPrice.textContent =
      money(cfg.hydrogelPrice);

  }


  if (publicHydrogelShotsText) {

    publicHydrogelShotsText.textContent =
      cfg.hydrogelShotsText;

  }


  if (publicDeposit) {

    publicDeposit.textContent =
      money(cfg.deposit);

  }


  if (depositInline) {

    depositInline.textContent =
      money(cfg.deposit);

  }


  if (publicMinPlayers) {

    publicMinPlayers.textContent =
      cfg.minPlayers;

  }


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
        "ERROR: no existe #time en index.html"
      );

      return;

    }


    /*
     * Limpiamos completamente el select.
     */

    timeSelect.innerHTML = "";


    /*
     * Primera opción.
     */

    const firstOption =
      document.createElement("option");

    firstOption.value = "";

    firstOption.textContent =
      "Elegí un horario";

    timeSelect.appendChild(
      firstOption
    );


    /*
     * Crear horarios.
     */

    cfg.slots.forEach(
      function (slot) {

        const option =
          document.createElement("option");

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
      cfg.slots
    );

  }


  /* =====================================================
     ESTADO INICIAL
  ===================================================== */

  if (timeSelect) {

    timeSelect.innerHTML =
      '<option value="">Elegí un horario</option>';

  }


  /* =====================================================
     CAMBIO DE FECHA
  ===================================================== */

  if (dateInput) {

    dateInput.addEventListener(
      "change",
      function () {

        console.log(
          "Fecha seleccionada:",
          dateInput.value
        );

        showSlots();

      }
    );


    /*
     * También usamos input por compatibilidad
     * con algunos navegadores.
     */

    dateInput.addEventListener(
      "input",
      function () {

        if (dateInput.value) {

          showSlots();

        }

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

    const pricePerPlayer =
      Number(cfg.gamePrice) || 0;

    const total =
      pricePerPlayer * players;

    const deposit =
      Number(cfg.deposit) || 0;


    /* =================================================
       BOTÓN
    ================================================= */

    const submitButton =
      bookingForm.querySelector(
        'button[type="submit"]'
      );


    let originalButtonText = "";


    if (submitButton) {

      originalButtonText =
        submitButton.innerHTML;

      submitButton.disabled =
        true;

      submitButton.innerHTML =
        "Guardando reserva...";

    }


    /* =================================================
       GUARDAR RESERVA
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


      let data = {};

      try {

        data =
          await response.json();

      } catch (error) {

        data = {};

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


      /* =================================================
         RESERVA EXITOSA
      ================================================= */

      showMessage(
        "¡Reserva registrada correctamente! " +
        "Fecha: " +
        date +
        " — Horario: " +
        time +
        ". Seña requerida: " +
        money(deposit) +
        ".",
        "success"
      );


      /* Limpiar */

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
          '<option value="">Elegí un horario</option>';

      }


    } catch (error) {

      console.error(
        "Error creando reserva:",
        error
      );


      showMessage(
        "No se pudo guardar la reserva. " +
        "Intentá nuevamente.",
        "error"
      );

    } finally {

      if (submitButton) {

        submitButton.disabled =
          false;

        submitButton.innerHTML =
          originalButtonText ||
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
    "https://wa.me/" +
    waNumber +
    "?text=" +
    waMessage;


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
     PRUEBA
  ===================================================== */

  console.log(
    "AGUARÁ PAINTBALL - script.js cargado."
  );

  console.log(
    "Elemento fecha:",
    dateInput
  );

  console.log(
    "Elemento horario:",
    timeSelect
  );

  console.log(
    "Horarios configurados:",
    cfg.slots
  );


})();
