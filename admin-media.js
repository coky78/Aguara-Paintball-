(() => {
  "use strict";

  const slots = {
    hero_video: { label: "Video principal", type: "video" },
    gallery_1: { label: "Galería 1", type: "image" },
    gallery_2: { label: "Galería 2", type: "image" },
    gallery_3: { label: "Galería 3", type: "image" },
    gallery_4: { label: "Galería 4", type: "image" },
    logo: { label: "Logo", type: "image" }
  };

  const status = (el, text, ok = false) => {
    el.textContent = text;
    el.style.color = ok ? "#22c55e" : "#aaa";
  };

  function styles() {
    if (document.getElementById("media-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "media-admin-styles";
    style.textContent = `
      .media-admin-box { margin-top: 24px; padding: 20px; border:1px solid rgba(255,255,255,.1); border-radius:16px; background:rgba(255,255,255,.025); }
      .media-admin-box h2 { margin:0 0 6px; }
      .media-admin-box > p { margin:0 0 18px; color:#aaa; }
      .media-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
      .media-card { padding:16px; border:1px solid #333; border-radius:14px; background:#101010; }
      .media-card h3 { margin:0 0 10px; font-size:17px; }
      .media-preview { width:100%; aspect-ratio:16/9; display:grid; place-items:center; overflow:hidden; border-radius:10px; background:#181818; border:1px solid #2e2e2e; margin-bottom:12px; color:#777; }
      .media-preview img, .media-preview video { width:100%; height:100%; object-fit:cover; display:block; }
      .media-fields { display:grid; gap:9px; }
      .media-fields label { display:grid; gap:5px; font-size:12px; color:#aaa; }
      .media-fields input[type=text] { width:100%; box-sizing:border-box; padding:10px; border:1px solid #444; border-radius:8px; background:#171717; color:#fff; }
      .media-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .media-actions .btn { flex:1 1 150px; }
      .media-upload { display:none; }
      .media-meta { font-size:12px; color:#777; margin-top:8px; min-height:16px; }
      .media-toggle { display:flex!important; align-items:center!important; grid-template-columns:none!important; gap:8px!important; }
      @media(max-width:800px){ .media-grid{grid-template-columns:1fr;} }
    `;
    document.head.appendChild(style);
  }

  function makeCard(item) {
    const spec = slots[item.slot_key];
    const card = document.createElement("article");
    card.className = "media-card";
    card.dataset.slot = item.slot_key;
    card.innerHTML = `
      <h3>${spec.label}</h3>
      <div class="media-preview"></div>
      <div class="media-fields">
        <label>Nombre / título<input class="media-title" type="text" maxlength="160" value="${escapeHtml(item.title || spec.label)}"></label>
        <label>Texto alternativo<input class="media-alt" type="text" maxlength="160" value="${escapeHtml(item.alt_text || "Aguará Paintball")}"></label>
        <label class="media-toggle"><input class="media-enabled" type="checkbox" ${item.enabled !== false ? "checked" : ""}> Mostrar en el sitio</label>
      </div>
      <div class="media-actions">
        <input class="media-upload" type="file" accept="${spec.type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime"}">
        <button class="btn btn-primary media-replace" type="button">${item.public_url ? "Reemplazar" : "Subir medio"}</button>
        <button class="btn btn-outline media-save" type="button">Guardar datos</button>
        <button class="btn btn-outline media-delete" type="button">Eliminar</button>
      </div>
      <div class="media-meta"></div>
    `;

    renderPreview(card, item);
    const fileInput = card.querySelector(".media-upload");
    card.querySelector(".media-replace").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => upload(card, fileInput.files?.[0]));
    card.querySelector(".media-save").addEventListener("click", () => saveMeta(card));
    card.querySelector(".media-delete").addEventListener("click", () => remove(card));
    return card;
  }

  function renderPreview(card, item) {
    const preview = card.querySelector(".media-preview");
    preview.innerHTML = "";
    const source = item.public_url || item.fallback_url;
    if (!source) { preview.textContent = "Sin archivo"; return; }
    if (item.media_type === "video") {
      const video = document.createElement("video");
      video.src = source;
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      preview.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = source;
      img.alt = item.alt_text || item.title || "Aguará Paintball";
      preview.appendChild(img);
    }
  }

  async function api(path = "", options = {}) {
    const response = await fetch(`/api/admin-media${path}`, {
      ...options,
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Error gestionando medios.");
    return data;
  }

  async function load() {
    const box = document.getElementById("mediaGrid");
    const state = document.getElementById("mediaStatus");
    if (!box || !state) return;
    status(state, "Cargando medios...");
    try {
      const data = await api();
      box.innerHTML = "";
      for (const item of data.media) box.appendChild(makeCard(item));
      status(state, "✓ Biblioteca cargada.", true);
    } catch (error) {
      status(state, error.message || "No se pudo cargar la biblioteca.");
    }
  }

  async function upload(card, file) {
    if (!file) return;
    const slotKey = card.dataset.slot;
    const meta = card.querySelector(".media-meta");
    status(meta, "Preparando subida...");
    try {
      const prepared = await api("", { method: "POST", body: JSON.stringify({ action: "prepare-upload", slotKey, fileName: file.name, contentType: file.type }) });
      const url = `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${prepared.path}?token=${encodeURIComponent(prepared.token)}`;
      const uploadResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type, "x-upsert": "false" },
        body: file
      });
      if (!uploadResponse.ok) throw new Error("No se pudo subir el archivo a Storage.");
      const title = card.querySelector(".media-title").value.trim();
      const altText = card.querySelector(".media-alt").value.trim();
      const enabled = card.querySelector(".media-enabled").checked;
      await api("", { method: "POST", body: JSON.stringify({ action: "finalize", slotKey, path: prepared.path, title, altText, enabled }) });
      status(meta, "✓ Medio actualizado.", true);
      await load();
    } catch (error) {
      status(meta, error.message || "Error subiendo el medio.");
    }
  }

  async function saveMeta(card) {
    const meta = card.querySelector(".media-meta");
    status(meta, "Guardando...");
    try {
      const data = await api("", {
        method: "PATCH",
        body: JSON.stringify({
          slotKey: card.dataset.slot,
          title: card.querySelector(".media-title").value,
          altText: card.querySelector(".media-alt").value,
          enabled: card.querySelector(".media-enabled").checked
        })
      });
      status(meta, "✓ Datos guardados.", true);
      if (data.media) renderPreview(card, { ...data.media, fallback_url: card.querySelector("img,video")?.src || "" });
    } catch (error) {
      status(meta, error.message || "No se pudo guardar.");
    }
  }

  async function remove(card) {
    if (!confirm("¿Eliminar este medio del sitio?")) return;
    const meta = card.querySelector(".media-meta");
    status(meta, "Eliminando...");
    try {
      await api("", { method: "DELETE", body: JSON.stringify({ slotKey: card.dataset.slot }) });
      status(meta, "✓ Medio eliminado. Se conservará el archivo original del sitio.", true);
      await load();
    } catch (error) {
      status(meta, error.message || "No se pudo eliminar.");
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  }

  const BUCKET = "site-media";
  const SUPABASE_URL = "https://tplnyjgexpfqkaevvflq.supabase.co";

  function loadCatalogAdmin() {
    if (document.querySelector('script[data-aguara-catalog-admin]')) return;
    const script = document.createElement("script");
    script.src = "admin-catalog.js";
    script.dataset.aguaraCatalogAdmin = "true";
    document.body.appendChild(script);
  }

  function init() {
    styles();
    const panel = document.getElementById("admin-panel");
    const root = document.getElementById("mediaAdmin");
    if (!panel || !root) return;
    load();
    loadCatalogAdmin();
  }

  const wait = () => {
    if (document.getElementById("admin-panel")?.style.display === "block") init();
    else setTimeout(wait, 150);
  };
  wait();
})();
