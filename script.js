const DEFAULTS = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",

  hydrogelPrice: 0,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",

  deposit: 50000,
  minPlayers: 10,

  whatsapp: "5493790000000",

  slots: [
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00"
  ]
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

    // Horarios configurados desde Administración
    const slots = cfg.slots || [];

    if (!slots.length) {
      timeSelect.innerHTML =
        '<option value="">No hay horarios disponibles</option>';
      return;
    }

    // Reservas existentes
    const bookings = JSON.parse(
      localStorage.getItem("aguaraBookings") || "[]"
    );

    slots.forEach(slot => {

      const ocupado = bookings.some(
        booking =>
          booking.date === selectedDate &&
          booking.time === slot &&
          booking.status !== "cancelled"
      );

      if (!ocupado) {

        const option = document.createElement("option");

        option.value = slot;
        option.textContent = slot;

        timeSelect.appendChild(option);
      }

    });

    if (timeSelect.options.length === 0) {
      timeSelect.innerHTML =
        '<option value="">No hay horarios disponibles</option>';
    }

  });

}
/* WhatsApp */
const waMsg = encodeURIComponent(
  "Hola, quiero consultar por una reserva en Aguará Paintball."
);
