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

/* =====================================================
   MEDIOS EDITABLES
===================================================== */

let mediaState = [];

function mediaStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `media-status ${type}`.trim();
}

function mediaAccept(type) {
  return type === "video"
    ? "video/mp4,video/webm"
    : "image/jpeg,image/png,image/webp,image/gif";
}

function maxMediaSize(type) {
  return type === "video" ? 80 * 1024 * 1024 : 12 * 1024 * 1024;
}

function renderMedia() {
  const grid = $("mediaGrid");
  if (!grid) return;

  if (!mediaState.length) {
    grid.innerHTML = "<p class='muted'>No hay contenido visual configurado.</p>";
    return;
  }

  grid.innerHTML = mediaState.map((item) => {
    const preview = item.type === "video"
      ? `<video src="${escapeHtml(item.url)}" controls muted playsinline preload="metadata"></video>`
      : `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt_text || "Aguará Paintball")}">`;

    return `
      <article class="media-card" data-slot="${escapeHtml(item.slot)}">
        <h3>${escapeHtml(item.label)}</h3>

        <div class="media-preview">
          ${preview}
        </div>

        <div class="media-meta">
          <span>${item.source === "supabase" ? "Editado desde administración" : "Archivo original del proyecto"}</span>
          <span>${escapeHtml(item.file_name || "")}</span>
        </div>

        <label>
          ${item.type === "video" ? "Reemplazar video" : "Reemplazar foto"}
          <input
            class="media-file"
            type="file"
            accept="${mediaAccept(item.type)}"
          >
        </label>

        <label>
          Texto / título
          <input class="media-title" type="text" value="${escapeHtml(item.title || item.label)}" maxlength="120">
        </label>

        ${item.type === "image" ? `
          <label>
            Texto alternativo
            <input class="media-alt" type="text" value="${escapeHtml(item.alt_text || "Aguará Paintball")}" maxlength="180">
          </label>
        ` : ""}

        <div class="media-actions">
          <button type="button" class="btn btn-primary media-save">
            Guardar cambio
          </button>
          ${item.source === "supabase" ? `
            <button type="button" class="btn btn-outline media-delete">
              Volver al original
            </button>
          ` : ""}
        </div>

        <div class="media-status" aria-live="polite"></div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".media-save").forEach((button) => {
    button.addEventListener("click", () => saveMedia(button.closest(".media-card")));
  });

  grid.querySelectorAll(".media-delete").forEach((button) => {
    button.addEventListener("click", () => deleteMedia(button.closest(".media-card")));
  });
}

async function loadMedia() {
  const status = $("mediaGlobalStatus");
  if (status) mediaStatus(status, "Cargando contenido visual...");

  try {
    const response = await fetch("/api/media", {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "No se pudo cargar el contenido visual.");
    }

    mediaState = Array.isArray(data.media) ? data.media : [];
    renderMedia();

    if (status) mediaStatus(status, "Contenido visual cargado.");
  } catch (error) {
    console.error("Error cargando medios:", error);
    if (status) mediaStatus(status, error.message || "No se pudo cargar el contenido visual.", "error");
  }
}

async function saveMedia(card) {
  if (!card) return;

  const item = mediaState.find((x) => x.slot === card.dataset.slot);
  const fileInput = card.querySelector(".media-file");
  const titleInput = card.querySelector(".media-title");
  const altInput = card.querySelector(".media-alt");
  const status = card.querySelector(".media-status");
  const button = card.querySelector(".media-save");
  const file = fileInput?.files?.[0];

  if (!item) return;

  if (!file) {
    mediaStatus(status, "Seleccioná primero el archivo que querés subir.", "error");
    return;
  }

  if (file.size > maxMediaSize(item.type)) {
    mediaStatus(
      status,
      item.type === "video"
        ? "El video no puede superar los 80 MB."
        : "La foto no puede superar los 12 MB.",
      "error"
    );
    return;
  }

  if (!mediaAccept(item.type).split(",").includes(file.type)) {
    mediaStatus(status, "El formato del archivo no es válido para esta sección.", "error");
    return;
  }

  button.disabled = true;
  mediaStatus(status, "Preparando carga...");

  try {
    const signResponse = await fetch("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "sign",
        slot: item.slot,
        file_name: file.name,
        mime_type: file.type
      })
    });

    const signData = await signResponse.json();

    if (!signResponse.ok || !signData.ok) {
      throw new Error(signData.message || "No se pudo preparar la carga.");
    }

    mediaStatus(status, "Subiendo archivo...");

    const uploadResponse = await fetch(signData.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "x-upsert": "true"
      },
      body: file
    });

    if (!uploadResponse.ok) {
      const uploadText = await uploadResponse.text();
      throw new Error(uploadText || "Supabase rechazó el archivo.");
    }

    mediaStatus(status, "Guardando cambios...");

    const saveResponse = await fetch("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save",
        slot: item.slot,
        storage_path: signData.path,
        file_name: file.name,
        mime_type: file.type,
        title: titleInput?.value || item.label,
        alt_text: altInput?.value || "Aguará Paintball"
      })
    });

    const saveData = await saveResponse.json();

    if (!saveResponse.ok || !saveData.ok) {
      throw new Error(saveData.message || "El archivo se subió, pero no se pudo guardar la configuración.");
    }

    mediaStatus(status, "✓ Cambio guardado. Actualizando vista...", "success");
    await loadMedia();
  } catch (error) {
    console.error("Error guardando medio:", error);
    mediaStatus(status, error.message || "No se pudo guardar el archivo.", "error");
  } finally {
    button.disabled = false;
  }
}

async function deleteMedia(card) {
  if (!card) return;

  const item = mediaState.find((x) => x.slot === card.dataset.slot);
  const status = card.querySelector(".media-status");
  const button = card.querySelector(".media-delete");

  if (!item) return;

  if (!confirm(`¿Volver a mostrar el ${item.type === "video" ? "video" : "archivo original"} del proyecto en "${item.label}"?`)) {
    return;
  }

  button.disabled = true;
  mediaStatus(status, "Restaurando archivo original...");

  try {
    const response = await fetch("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "delete",
        slot: item.slot
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "No se pudo restaurar el original.");
    }

    await loadMedia();
  } catch (error) {
    console.error("Error restaurando medio:", error);
    mediaStatus(status, error.message || "No se pudo restaurar el original.", "error");
    button.disabled = false;
  }
}

/* =====================================================
   CERRAR SESIÓN
===================================================== */

const logoutButton = $("logout-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await fetch("/api/admin-logout", {
        method: "POST",
        headers: { Accept: "application/json" }
      });
    } finally {
      window.location.reload();
    }
  });
}

render();
loadMedia();
