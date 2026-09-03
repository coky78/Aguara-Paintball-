(() => {
  "use strict";

  const API = "/api/admin-media";
  const heroSlot = "hero_video";

  function injectStyles() {
    if (document.getElementById("video-editor-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "video-editor-admin-styles";
    style.textContent = `
      .media-edit-video{border-color:#f28b24!important;color:#f28b24!important}
      .video-editor-overlay{position:fixed;inset:0;z-index:100001;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.84)}
      .video-editor{width:min(900px,100%);max-height:94vh;overflow:auto;padding:18px;border:1px solid #444;border-radius:18px;background:#101010;box-shadow:0 30px 90px rgba(0,0,0,.7)}
      .video-editor h3{margin:0 0 5px}.video-editor p{margin:0 0 14px;color:#999;font-size:13px}
      .video-editor-preview{width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:12px;background:#050505;border:1px solid #333}
      .video-editor-preview video{width:100%;height:100%;display:block;object-fit:cover}
      .video-editor-controls{display:grid;grid-template-columns:110px 1fr 54px;gap:10px 14px;align-items:center;margin-top:16px}
      .video-editor-controls label{color:#aaa;font-size:13px}.video-editor-controls input[type=range]{width:100%;accent-color:#f28b24}
      .video-editor-value{color:#fff;text-align:right;font-variant-numeric:tabular-nums;font-size:12px}
      .video-editor-buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.video-editor-buttons .btn{flex:1 1 150px}
      @media(max-width:640px){.video-editor{padding:13px}.video-editor-controls{grid-template-columns:1fr 54px;gap:7px 12px}.video-editor-controls label{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  async function api(options = {}) {
    const response = await fetch(API, { ...options, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) } });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo guardar el encuadre del video.");
    return data;
  }

  function addButton(card) {
    if (!card || card.dataset.slot !== heroSlot || card.querySelector(".media-edit-video")) return;
    const actions = card.querySelector(".media-actions");
    if (!actions) return;
    const button = document.createElement("button");
    button.className = "btn btn-outline media-edit-video";
    button.type = "button";
    button.textContent = "Editar encuadre";
    button.addEventListener("click", () => openEditor(card));
    actions.insertBefore(button, actions.firstChild);
  }

  function watchCards() {
    document.querySelectorAll('.media-card[data-slot="hero_video"]').forEach(addButton);
    const grid = document.getElementById("mediaGrid");
    if (!grid || grid.dataset.videoEditorObserved === "1") return;
    grid.dataset.videoEditorObserved = "1";
    new MutationObserver(() => document.querySelectorAll('.media-card[data-slot="hero_video"]').forEach(addButton)).observe(grid, { childList: true });
  }

  async function getHero() {
    const data = await api();
    return (data.media || []).find(item => item.slot_key === heroSlot) || null;
  }

  function openEditor(card) {
    const video = card.querySelector(".media-preview video");
    if (!video) return;
    getHero().then(item => {
      if (!item) throw new Error("No se encontró la configuración del video principal.");
      const overlay = document.createElement("div");
      overlay.className = "video-editor-overlay";
      overlay.innerHTML = `
        <div class="video-editor" role="dialog" aria-modal="true" aria-label="Editor de encuadre del video">
          <h3>Editar encuadre del video principal</h3>
          <p>Ajustá cómo se ve el video dentro del bloque del index. No se modifica ni se recorta el archivo original.</p>
          <div class="video-editor-preview"><video src="${escapeHtml(item.public_url || video.src)}" autoplay muted loop playsinline></video></div>
          <div class="video-editor-controls">
            <label for="videoPositionY">Vertical</label><input id="videoPositionY" type="range" min="0" max="100" step="1" value="${Number(item.position_y ?? 50)}"><span class="video-editor-value" data-for="videoPositionY"></span>
            <label for="videoPositionX">Horizontal</label><input id="videoPositionX" type="range" min="0" max="100" step="1" value="${Number(item.position_x ?? 50)}"><span class="video-editor-value" data-for="videoPositionX"></span>
            <label for="videoZoom">Zoom</label><input id="videoZoom" type="range" min="0.5" max="2.5" step="0.01" value="${Number(item.zoom ?? 1)}"><span class="video-editor-value" data-for="videoZoom"></span>
          </div>
          <div class="video-editor-buttons"><button class="btn btn-outline video-reset" type="button">Restablecer</button><button class="btn btn-outline video-cancel" type="button">Cancelar</button><button class="btn btn-primary video-save" type="button">Guardar encuadre</button></div>
        </div>`;
      document.body.appendChild(overlay);
      const preview = overlay.querySelector("video");
      const x = overlay.querySelector("#videoPositionX");
      const y = overlay.querySelector("#videoPositionY");
      const zoom = overlay.querySelector("#videoZoom");
      const values = () => { overlay.querySelector('[data-for="videoPositionX"]').textContent = `${x.value}%`; overlay.querySelector('[data-for="videoPositionY"]').textContent = `${y.value}%`; overlay.querySelector('[data-for="videoZoom"]').textContent = `${Number(zoom.value).toFixed(2)}×`; };
      const draw = () => { preview.style.objectPosition = `${x.value}% ${y.value}%`; preview.style.transform = `scale(${zoom.value})`; values(); };
      [x,y,zoom].forEach(input => input.addEventListener("input", draw)); draw();
      overlay.querySelector(".video-reset").addEventListener("click", () => { x.value="50"; y.value="50"; zoom.value="1"; draw(); });
      const close = () => overlay.remove();
      overlay.querySelector(".video-cancel").addEventListener("click", close);
      overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
      overlay.querySelector(".video-save").addEventListener("click", async event => {
        const button = event.currentTarget; button.disabled = true; button.textContent = "GUARDANDO...";
        try {
          await api({ method:"PATCH", body:JSON.stringify({ slotKey:heroSlot, title:card.querySelector(".media-title")?.value || item.title || "Video principal", altText:card.querySelector(".media-alt")?.value || item.alt_text || "Aguará Paintball", enabled:card.querySelector(".media-enabled")?.checked ?? true, positionX:Number(x.value), positionY:Number(y.value), zoom:Number(zoom.value) }) });
          const currentVideo = card.querySelector(".media-preview video");
          if (currentVideo) { currentVideo.style.objectPosition = `${x.value}% ${y.value}%`; currentVideo.style.transform = `scale(${zoom.value})`; currentVideo.style.transformOrigin = "center center"; }
          const meta = card.querySelector(".media-meta"); if (meta) { meta.textContent = "✓ Encuadre del video guardado."; meta.style.color = "#22c55e"; }
          close();
        } catch (error) { button.disabled = false; button.textContent = "Guardar encuadre"; alert(error.message || "No se pudo guardar el encuadre."); }
      });
    }).catch(error => alert(error.message || "No se pudo abrir el editor de video."));
  }

  function escapeHtml(value) { return String(value || "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char])); }

  function init() { injectStyles(); watchCards(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
})();
