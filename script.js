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

/* WhatsApp */
const waMsg = encodeURIComponent(
  "Hola, quiero consultar por una reserva en Aguará Paintball."
);
