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
      .media-edit { border-color:#f28b24!important; color:#f28b24!important; }
      .photo-editor-overlay { position:fixed; inset:0; z-index:100000; display:grid; place-items:center; padding:18px; background:rgba(0,0,0,.82); }
      .photo-editor { width:min(900px,100%); max-height:94vh; overflow:auto; padding:18px; border:1px solid #444; border-radius:18px; background:#101010; box-shadow:0 30px 90px rgba(0,0,0,.7); }
      .photo-editor h3 { margin:0 0 5px; }
      .photo-editor p { margin:0 0 14px; color:#999; font-size:13px; }
      .photo-editor-canvas-wrap { width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:12px; background:#050505; border:1px solid #333; cursor:grab; touch-action:none; }
      .photo-editor-canvas-wrap:active { cursor:grabbing; }
      .photo-editor canvas { width:100%; height:100%; display:block; }
      .photo-editor-controls { display:grid; grid-template-columns:1fr auto; gap:10px 14px; align-items:center; margin-top:15px; }
      .photo-editor-controls label { color:#aaa; font-size:13px; }
      .photo-editor-controls input[type=range] { width:100%; accent-color:#f28b24; }
      .photo-editor-buttons { display:flex; flex-wrap:wrap; gap:8px; margin-top:15px; }
      .photo-editor-buttons .btn { flex:1 1 150px; }
      @media(max-width:800px){ .media-grid{grid-template-columns:1fr;} }
      @media(max-width:640px){ .photo-editor{padding:13px;} .photo-editor-controls{grid-template-columns:1fr;} }
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
        ${spec.type === "image" ? '<button class="btn btn-outline media-edit" type="button">Editar foto</button>' : ""}
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
    const editButton = card.querySelector(".media-edit");
    if (editButton) editButton.addEventListener("click", () => openPhotoEditor(card));
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

  async function uploadBlob(card, blob, filename = "foto-editada.jpg") {
    const slotKey = card.dataset.slot;
    const meta = card.querySelector(".media-meta");
    status(meta, "Subiendo foto editada...");
    try {
      const prepared = await api("", { method: "POST", body: JSON.stringify({ action: "prepare-upload", slotKey, fileName: filename, contentType: blob.type }) });
      const url = `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${prepared.path}?token=${encodeURIComponent(prepared.token)}`;
      const uploadResponse = await fetch(url, { method: "POST", headers: { "Content-Type": blob.type, "x-upsert": "false" }, body: blob });
      if (!uploadResponse.ok) throw new Error("No se pudo subir la foto editada a Storage.");
      await api("", { method: "POST", body: JSON.stringify({ action: "finalize", slotKey, path: prepared.path, title: card.querySelector(".media-title").value.trim(), altText: card.querySelector(".media-alt").value.trim(), enabled: card.querySelector(".media-enabled").checked }) });
      status(meta, "✓ Foto editada y aplicada a la portada.", true);
      await load();
    } catch (error) {
      status(meta, error.message || "Error guardando la foto editada.");
    }
  }

  function openPhotoEditor(card) {
    const image = card.querySelector(".media-preview img");
    if (!image || !image.src) return;
    const overlay = document.createElement("div");
    overlay.className = "photo-editor-overlay";
    overlay.innerHTML = `
      <div class="photo-editor" role="dialog" aria-modal="true" aria-label="Editor de foto">
        <h3>Editar foto de ${escapeHtml(slots[card.dataset.slot].label)}</h3>
        <p>Arrastrá la imagen para encuadrarla. Usá el zoom y la rotación y luego guardá el resultado.</p>
        <div class="photo-editor-canvas-wrap"><canvas></canvas></div>
        <div class="photo-editor-controls">
          <label for="photoZoom">Zoom</label>
          <input id="photoZoom" type="range" min="1" max="3" step="0.01" value="1">
          <label for="photoRotate">Rotación</label>
          <input id="photoRotate" type="range" min="-180" max="180" step="1" value="0">
        </div>
        <div class="photo-editor-buttons">
          <button class="btn btn-outline photo-reset" type="button">Restablecer</button>
          <button class="btn btn-outline photo-cancel" type="button">Cancelar</button>
          <button class="btn btn-primary photo-save" type="button">Guardar foto editada</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("canvas");
    const wrap = overlay.querySelector(".photo-editor-canvas-wrap");
    const zoomInput = overlay.querySelector("#photoZoom");
    const rotateInput = overlay.querySelector("#photoRotate");
    const editorImage = new Image();
    editorImage.crossOrigin = "anonymous";
    let zoom = 1;
    let rotation = 0;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(640, Math.round(rect.width * 1.5));
      const height = Math.round(width * 9 / 16);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);
      if (!editorImage.complete || !editorImage.naturalWidth) return;
      const baseScale = Math.max(width / editorImage.naturalWidth, height / editorImage.naturalHeight);
      const scale = baseScale * zoom;
      const drawW = editorImage.naturalWidth * scale;
      const drawH = editorImage.naturalHeight * scale;
      ctx.save();
      ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(editorImage, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };

    editorImage.onload = draw;
    editorImage.src = image.src;
    zoomInput.addEventListener("input", () => { zoom = Number(zoomInput.value); draw(); });
    rotateInput.addEventListener("input", () => { rotation = Number(rotateInput.value); draw(); });
    overlay.querySelector(".photo-reset").addEventListener("click", () => {
      zoom = 1; rotation = 0; offsetX = 0; offsetY = 0;
      zoomInput.value = "1"; rotateInput.value = "0"; draw();
    });
    const close = () => overlay.remove();
    overlay.querySelector(".photo-cancel").addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    window.addEventListener("resize", draw);

    const pointerDown = (event) => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startOffsetX = offsetX;
      startOffsetY = offsetY;
      wrap.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = (event) => {
      if (!dragging) return;
      offsetX = startOffsetX + event.clientX - startX;
      offsetY = startOffsetY + event.clientY - startY;
      draw();
    };
    const pointerUp = () => { dragging = false; };
    wrap.addEventListener("pointerdown", pointerDown);
    wrap.addEventListener("pointermove", pointerMove);
    wrap.addEventListener("pointerup", pointerUp);
    wrap.addEventListener("pointercancel", pointerUp);

    overlay.querySelector(".photo-save").addEventListener("click", () => {
      const saveButton = overlay.querySelector(".photo-save");
      saveButton.disabled = true;
      saveButton.textContent = "PROCESANDO...";
      canvas.toBlob(async (blob) => {
        if (!blob) { saveButton.disabled = false; saveButton.textContent = "Guardar foto editada"; return; }
        await uploadBlob(card, blob, `${card.dataset.slot}-editada.jpg`);
        close();
      }, "image/jpeg", 0.92);
    });
  }

  async function saveMeta(card) {
    const meta = card.querySelector(".media-meta");
    status(meta, "Guardando...");
    try {
      const data = await api("", {
        method: "PATCH",
        body: JSON.stringify({ slotKey: card.dataset.slot, title: card.querySelector(".media-title").value, altText: card.querySelector(".media-alt").value, enabled: card.querySelector(".media-enabled").checked })
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