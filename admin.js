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

const cfg = {
  ...DEFAULTS,
  ...JSON.parse(localStorage.getItem("aguaraConfig") || "{}")
};

const $ = id => document.getElementById(id);

/* Cargar configuración */
$("gamePrice").value = cfg.gamePrice;
$("shotsText").value = cfg.shotsText;

$("hydrogelPrice").value = cfg.hydrogelPrice;
$("hydrogelShotsText").value = cfg.hydrogelShotsText;

$("deposit").value = cfg.deposit;
$("minPlayers").value = cfg.minPlayers;
$("whatsapp").value = cfg.whatsapp;
$("slots").value = cfg.slots.join(", ");


/* Guardar configuración */
$("configForm").addEventListener("submit", e => {
  e.preventDefault();

  const c = {
    gamePrice: Number($("gamePrice").value),

    shotsText: $("shotsText").value.trim(),

    hydrogelPrice: Number($("hydrogelPrice").value),

    hydrogelShotsText:
      $("hydrogelShotsText").value.trim(),

    deposit: Number($("deposit").value),

    minPlayers: Number($("minPlayers").value),

    whatsapp:
      $("whatsapp").value.replace(/\D/g, ""),

    slots: $("slots").value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean)
  };

  localStorage.setItem(
    "aguaraConfig",
    JSON.stringify(c)
  );

  $("saved").hidden = false;

  setTimeout(() => location.reload(), 700);
});


/* Formato de dinero */
function money(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(n);
}


/* Reservas */
function render() {

  const bs = JSON.parse(
    localStorage.getItem("aguaraBookings") || "[]"
  );

  $("bookings").innerHTML = bs.length
    ? bs
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.time.localeCompare(b.time)
        )
        .map(
          b => `
            <div style="border-top:1px solid #333;padding:15px 0">

              <strong>
                ${b.date} · ${b.time}
              </strong>

              <br>

              ${b.name} · ${b.players} jugadores

              <br>

              <small>
                ${b.phone} · ${b.id} · seña ${money(b.deposit)}
              </small>

              <br>

              <button
                class="btn btn-outline"
                onclick="setStatus('${b.id}','confirmed')">
                Confirmar
              </button>

              <button
                class="btn btn-outline"
                onclick="setStatus('${b.id}','cancelled')">
                Cancelar
              </button>

            </div>
          `
        )
        .join("")
    : "<p class='muted'>No hay reservas todavía.</p>";
}


/* Cambiar estado de reserva */
window.setStatus = (id, status) => {

  const bs = JSON.parse(
    localStorage.getItem("aguaraBookings") || "[]"
  );

  const b = bs.find(x => x.id === id);

  if (b) {
    b.status = status;
  }

  localStorage.setItem(
    "aguaraBookings",
    JSON.stringify(bs)
  );

  render();
};

render();
