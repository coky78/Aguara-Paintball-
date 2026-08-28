const DEFAULTS = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",
  hydrogelPrice: 0,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",
  deposit: 50000,
  minPlayers: 10,
  whatsapp: "5493794250285",
  slots: [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ]
};

const $ = (id) => document.getElementById(id);

function loadConfig() {
  try {
    return {
      ...DEFAULTS,
      ...JSON.parse(localStorage.getItem("aguaraConfig") || "{}")
    };
  } catch {
    return { ...DEFAULTS };
  }
}

const cfg = loadConfig();

$("gamePrice").value = cfg.gamePrice;
$("shotsText").value = cfg.shotsText;
$("hydrogelPrice").value = cfg.hydrogelPrice;
$("hydrogelShotsText").value = cfg.hydrogelShotsText;
$("deposit").value = cfg.deposit;
$("minPlayers").value = cfg.minPlayers;
$("whatsapp").value = cfg.whatsapp;
$("slots").value = cfg.slots.join(", ");

$("configForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const next = {
    gamePrice: Number($("gamePrice").value),
    shotsText: $("shotsText").value.trim(),
    hydrogelPrice: Number($("hydrogelPrice").value),
    hydrogelShotsText: $("hydrogelShotsText").value.trim(),
    deposit: Number($("deposit").value),
    minPlayers: Number($("minPlayers").value),
    whatsapp: $("whatsapp").value.replace(/\D/g, ""),
    slots: $("slots").value.split(",").map((x) => x.trim()).filter(Boolean)
  };

  localStorage.setItem("aguaraConfig", JSON.stringify(next));
  $("saved").hidden = false;
});

function money(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function render() {
  const container = $("bookings");
  container.innerHTML = "<p class='muted'>Cargando reservas...</p>";

  try {
    const response = await fetch("/api/reservations", {
      headers: { Accept: "application/json" }
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "No se pudieron cargar las reservas.");
    }

    const bookings = Array.isArray(data.reservas) ? data.reservas : [];

    if (!bookings.length) {
      container.innerHTML = "<p class='muted'>No hay reservas todavía.</p>";
      return;
    }

    container.innerHTML = bookings
      .map((b) => `
        <div style="border-top:1px solid #333;padding:15px 0">
          <strong>${escapeHtml(b.booking_date)} · ${escapeHtml(b.booking_time)}</strong>
          <br>
          ${escapeHtml(b.name)} · ${escapeHtml(b.players)} jugadores
          <br>
          <small>${escapeHtml(b.phone)} · ${escapeHtml(b.public_id)} · seña ${money(b.deposit_amount)}</small>
          <br>
          <small>Estado: ${escapeHtml(b.status)}</small>
        </div>
      `)
      .join("");
  } catch (error) {
    console.error("Error cargando reservas:", error);
    container.innerHTML = `<p class="muted">${escapeHtml(error.message || "Error cargando reservas.")}</p>`;
  }
}

render();
