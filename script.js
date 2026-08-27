const DEFAULTS = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",

  hydrogelPrice: 0,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",

  deposit: 50000,
  minPlayers: 10,

  whatsapp: "5493790000000",

  slots = [
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
};

const getConfig = () => ({
  ...DEFAULTS,
  ...JSON.parse(
    localStorage.getItem("aguaraConfig") || "{}"
  )
});

const money = n =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const cfg = getConfig();

/* Año */
document.getElementById("year").textContent =
  new Date().getFullYear();

/* PAINTBALL */
document.getElementById("publicGamePrice").textContent =
  money(cfg.gamePrice);

document.getElementById("publicShotsText").textContent =
  cfg.shotsText || "100 TIROS INCLUIDOS";

/* HIDROGEL */
document.getElementById("publicHydrogelPrice").textContent =
  money(cfg.hydrogelPrice);

document.getElementById("publicHydrogelShotsText").textContent =
  cfg.hydrogelShotsText || "MUNICIÓN INCLUIDA";

/* SEÑA */
document.getElementById("publicDeposit").textContent =
  money(cfg.deposit);

const depositInline =
  document.getElementById("depositInline");

if (depositInline) {
  depositInline.textContent =
    money(cfg.deposit);
}

/* MÍNIMO */
document.getElementById("publicMinPlayers").textContent =
  cfg.minPlayers;
/* =========================
   RESERVAS - FECHA Y HORARIOS
========================= */

const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");

if (dateInput && timeSelect) {

  // No permitir fechas anteriores a hoy
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.min = `${year}-${month}-${day}`;

  dateInput.addEventListener("change", () => {

    const selectedDate = dateInput.value;

    // Limpiar horarios
    timeSelect.innerHTML = "";

    if (!selectedDate) {
      timeSelect.innerHTML =
        '<option value="">Elegí una fecha</option>';
      return;
    }
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
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00"
  ]
};

const getConfig = () => {
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
};

const money = n =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const cfg = getConfig();

/* =========================
   AÑO
========================= */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}

/* =========================
   PAINTBALL
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
    cfg.shotsText || "100 TIROS INCLUIDOS";
}

/* =========================
   HIDROGEL
========================= */

const publicHydrogelPrice =
  document.getElementById("publicHydrogelPrice");

if (publicHydrogelPrice) {
  publicHydrogelPrice.textContent =
    money(cfg.hydrogelPrice);
}

const publicHydrogelShotsText =
  document.getElementById("publicHydrogelShotsText");

if (publicHydrogelShotsText) {
  publicHydrogelShotsText.textContent =
    cfg.hydrogelShotsText || "MUNICIÓN INCLUIDA";
}

/* =========================
   SEÑA
========================= */

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

/* =========================
   MÍNIMO DE JUGADORES
========================= */

const publicMinPlayers =
  document.getElementById("publicMinPlayers");

if (publicMinPlayers) {
  publicMinPlayers.textContent =
    cfg.minPlayers;
}

/* =========================
   RESERVAS - FECHA Y HORARIOS
========================= */

const dateInput =
  document.getElementById("date");

const timeSelect =
  document.getElementById("time");

if (dateInput && timeSelect) {

  /* No permitir fechas anteriores a hoy */

  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  dateInput.min =
    `${year}-${month}-${day}`;

  /* Estado inicial */

  timeSelect.innerHTML =
    '<option value="">Primero elegí una fecha</option>';

  /* Cuando el usuario elige una fecha */

  dateInput.addEventListener(
    "change",
    () => {

      const selectedDate =
        dateInput.value;

      /* Limpiar horarios */

      timeSelect.innerHTML =
        '<option value="">Elegí un horario</option>';

      /* Si no hay fecha */

      if (!selectedDate) {

        timeSelect.innerHTML =
          '<option value="">Primero elegí una fecha</option>';

        return;
      }

      /* =========================
         HORARIOS
      ========================= */

      let slots = [];

      if (
        Array.isArray(cfg.slots) &&
        cfg.slots.length > 0
      ) {

        slots = cfg.slots;

      } else {

        slots = [
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00",
          "20:00"
        ];

      }

      /* =========================
         RESERVAS EXISTENTES
      ========================= */

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

      let horariosDisponibles = 0;

      /* =========================
         CREAR HORARIOS
      ========================= */

      slots.forEach(slot => {

        const ocupado =
          bookings.some(
            booking =>
              booking.date === selectedDate &&
              booking.time === slot &&
              booking.status !== "cancelled"
          );

        if (!ocupado) {

          const option =
            document.createElement(
              "option"
            );

          option.value = slot;

          option.textContent = slot;

          timeSelect.appendChild(
            option
          );

          horariosDisponibles++;

        }

      });

      /* =========================
         SIN HORARIOS DISPONIBLES
      ========================= */

      if (
        horariosDisponibles === 0
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

const waMsg =
  encodeURIComponent(
    "Hola, quiero consultar por una reserva en Aguará Paintball."
  );

const waUrl =
  `https://wa.me/${waNumber}?text=${waMsg}`;

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

}

if (whatsappBooking) {

  whatsappBooking.href =
    waUrl;

}
}
