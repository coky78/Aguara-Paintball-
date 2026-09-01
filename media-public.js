(() => {
  "use strict";

  function applyMedia(media) {
    const bySlot = new Map((media || []).map(item => [item.slot_key, item]));

    const hero = bySlot.get("hero_video");
    if (hero?.public_url) {
      const video = document.querySelector(".hero-video");
      const source = video?.querySelector("source");
      if (video && source) {
        source.src = hero.public_url;
        video.load();
      }
    }

    const gallery = ["gallery_1", "gallery_2", "gallery_3", "gallery_4"];
    gallery.forEach((slotKey, index) => {
      const item = bySlot.get(slotKey);
      const button = document.querySelectorAll(".gallery-item")[index];
      const image = button?.querySelector("img");
      if (item?.public_url && image) {
        button.dataset.src = item.public_url;
        image.src = item.public_url;
        image.alt = item.alt_text || item.title || image.alt;
      }
    });

    const firstGallery = bySlot.get("gallery_1");
    if (firstGallery?.public_url) {
      const feature = document.querySelector(".feature-image");
      if (feature) feature.style.backgroundImage = `url('${firstGallery.public_url}')`;
    }

    const logo = bySlot.get("logo");
    if (logo?.public_url) {
      document.querySelectorAll("img[alt=\"Aguará Paintball\"]").forEach(image => {
        image.src = logo.public_url;
      });
    }
  }

  function injectCatalogStyles() {
    if (document.getElementById("equipment-catalog-styles")) return;
    const link = document.createElement("link");
    link.id = "equipment-catalog-styles";
    link.rel = "stylesheet";
    link.href = "catalogo-marcadoras.css";
    document.head.appendChild(link);
  }

  function ensureCatalogSection() {
    let section = document.getElementById("equipamiento");
    if (section) return section;
    const gallery = document.getElementById("galeria");
    if (!gallery) return null;

    section = document.createElement("section");
    section.id = "equipamiento";
    section.className = "section";
    section.innerHTML = `
      <div class="equipment-catalog-head">
        <div><p class="eyebrow">NUESTRO EQUIPAMIENTO</p><h2>Las marcadoras que vas a usar.</h2></div>
        <span class="muted">Conocé parte del equipamiento que proporcionamos a los jugadores durante la experiencia Aguará.</span>
      </div>
      <div id="equipmentCatalogGrid" class="equipment-catalog-grid"></div>
      <div id="equipmentCatalogEmpty" class="equipment-catalog-empty" hidden>Estamos preparando nuestro catálogo de marcadoras.</div>
    `;
    gallery.parentNode.insertBefore(section, gallery);
    injectCatalogStyles();

    const nav = document.querySelector("header.nav nav");
    if (nav && !nav.querySelector('a[href="#equipamiento"]')) {
      const link = document.createElement("a");
      link.href = "#equipamiento";
      link.textContent = "Equipamiento";
      nav.insertBefore(link, nav.querySelector('a[href="#galeria"]') || null);
    }
    return section;
  }

  async function loadCatalog() {
    const section = ensureCatalogSection();
    if (!section) return;
    try {
      const response = await fetch("/api/public-catalog", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok && Array.isArray(data.items)) {
        window.AguaraCatalog = data.items;
        const grid = document.getElementById("equipmentCatalogGrid");
        const empty = document.getElementById("equipmentCatalogEmpty");
        grid.innerHTML = "";
        empty.hidden = data.items.length > 0;
        data.items.forEach((item) => {
          const card = document.createElement("article");
          card.className = "equipment-card";
          card.innerHTML = `
            <div class="equipment-image-wrap"><img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>
            <div class="equipment-copy"><span class="equipment-label">EQUIPAMIENTO AGUARÁ</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p></div>
          `;
          grid.appendChild(card);
        });
      }
    } catch (error) {
      console.warn("AGUARÁ CATÁLOGO:", error);
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  }

  async function init() {
    try {
      const response = await fetch("/api/public-media", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) applyMedia(data.media);
    } catch (error) {
      console.warn("AGUARÁ MEDIA:", error);
    }
    loadCatalog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
