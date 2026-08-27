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
   RESERVAS
========================= */

const dateInput =
  document.getElementById("date");

const timeSelect =
  document.getElementById("time");


if (dateInput && timeSelect) {


  /* Fecha mínima: hoy */

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


  /* Mensaje inicial */

  timeSelect.innerHTML =
    '<option value="">Elegí una fecha</option>';


  /* =========================
     CAMBIO DE FECHA
  ========================== */

  dateInput.addEventListener(
    "change",
    function () {

      const selectedDate =
        dateInput.value;


      /* Limpiar */

      timeSelect.innerHTML =
        '<option value="">Elegí un horario</option>';


      if (!selectedDate) {

        timeSelect.innerHTML =
          '<option value="">Elegí una fecha</option>';

        return;

      }


      /* =========================
         HORARIOS
      ========================== */

      const slots = [
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
      ];


      /* =========================
         RESERVAS EXISTENTES
      ========================== */

      let bookings = [];


      try {

        bookings = JSON.parse(
          localStorage.getItem(
            "aguaraBookings"
          ) || "[]"
        );

      } catch (error) {

        bookings = [];

      }


      let availableCount = 0;


      /* =========================
         CREAR HORARIOS
      ========================== */

      slots.forEach(
        function (slot) {

          const ocupado =
            bookings.some(
              function (booking) {

                return (
                  booking.date === selectedDate &&
                  booking.time === slot &&
                  booking.status !== "cancelled"
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
         SI NO HAY HORARIOS
      ========================== */

      if (
        availableCount === 0
      ) {

        timeSelect.innerHTML =
          '<option value="">No hay horarios disponibles</option>';

      }

    }
  );

}


/* =========================
   WHATSAPP
========================= */

const waNumber =
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
