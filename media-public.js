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
        video.play().catch(() => {});
      }

      // El video principal también se muestra dentro de "La experiencia Aguará".
      const featureImage = document.querySelector(".feature-image");
      if (featureImage) {
        const experienceVideo = document.createElement("video");
        experienceVideo.className = "experience-video";
        experienceVideo.src = hero.public_url;
        experienceVideo.autoplay = true;
        experienceVideo.muted = true;
        experienceVideo.loop = true;
        experienceVideo.playsInline = true;
        experienceVideo.setAttribute("aria-label", "Video de la experiencia Aguará");
        featureImage.replaceWith(experienceVideo);
        experienceVideo.play().catch(() => {});
      }
    }

    ["gallery_1", "gallery_2", "gallery_3", "gallery_4"].forEach((slotKey, index) => {
      const item = bySlot.get(slotKey);
      const button = document.querySelectorAll(".gallery-item")[index];
      const image = button?.querySelector("img");
      if (item?.public_url && button && image) {
        button.dataset.src = item.public_url;
        button.dataset.title = item.title || "Aguará Paintball";
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
      document.querySelectorAll('img[alt="Aguará Paintball"]').forEach(image => image.src = logo.public_url);
    }
  }

  function initGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightboxImg");
    const close = document.getElementById("closeLightbox");
    const items = Array.from(document.querySelectorAll(".gallery-item"));
    if (!lightbox || !image || !items.length || lightbox.dataset.ready === "1") return;

    lightbox.dataset.ready = "1";
    let current = 0;

    const show = index => {
      const valid = items.filter(item => item.dataset.src || item.querySelector("img")?.src);
      if (!valid.length) return;
      current = (index + valid.length) % valid.length;
      const item = valid[current];
      const src = item.dataset.src || item.querySelector("img")?.src;
      image.src = src;
      image.alt = item.dataset.title || item.querySelector("img")?.alt || "Aguará Paintball";
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
    };

    const hide = () => {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      setTimeout(() => { lightbox.hidden = true; }, 180);
    };

    items.forEach((item, index) => {
      item.addEventListener("click", event => {
        event.preventDefault();
        show(index);
      });
      if (!item.querySelector(".gallery-hover-label")) {
        const label = document.createElement("span");
        label.className = "gallery-hover-label";
        label.textContent = "VER EN GRANDE  ↗";
        item.appendChild(label);
      }
    });

    close?.addEventListener("click", hide);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) hide();
    });
    document.addEventListener("keydown", event => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") hide();
      if (event.key === "ArrowRight") show(current + 1);
      if (event.key === "ArrowLeft") show(current - 1);
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
    }, { passive: true });
    lightbox.addEventListener("touchend", event => {
      const endX = event.changedTouches[0]?.clientX || 0;
      const delta = endX - touchStartX;
      if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
    }, { passive: true });
  }

  function injectCatalogStyles() {
    if (document.getElementById("equipment-catalog-styles")) return;
    const link = document.createElement("link");
    link.id = "equipment-catalog-styles";
    link.rel = "stylesheet";
    link.href = "catalogo-marcadoras.css";
    document.head.appendChild(link);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char]));
  }

  function ensureCatalogSection() {
    let section = document.getElementById("equipamiento");
    if (section) return section;
    const gallery = document.getElementById("galeria");
    if (!gallery) return null;
    section = document.createElement("section");
    section.id = "equipamiento";
    section.className = "section";
    section.innerHTML = `<div class="equipment-catalog-head"><div><p class="eyebrow" id="equipmentCatalogEyebrow">NUESTRO EQUIPAMIENTO</p><h2 id="equipmentCatalogTitle">Nuestro equipamiento.</h2></div><span class="muted" id="equipmentCatalogSubtitle">Conocé el equipamiento que proporcionamos a los jugadores durante la experiencia Aguará.</span></div><div id="equipmentCatalogGrid" class="equipment-catalog-grid"></div><div id="equipmentCatalogEmpty" class="equipment-catalog-empty" hidden>Estamos preparando nuestro equipamiento.</div>`;
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

  function applyCatalogText() {
    const title = localStorage.getItem("aguaraCatalogTitle");
    const subtitle = localStorage.getItem("aguaraCatalogSubtitle");
    if (title) {
      const el = document.getElementById("equipmentCatalogTitle");
      if (el) el.textContent = title;
    }
    if (subtitle) {
      const el = document.getElementById("equipmentCatalogSubtitle");
      if (el) el.textContent = subtitle;
    }
  }

  async function loadCatalog() {
    const section = ensureCatalogSection();
    if (!section) return;
    applyCatalogText();
    try {
      const response = await fetch("/api/public-catalog", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok && Array.isArray(data.items)) {
        window.AguaraCatalog = data.items;
        const grid = document.getElementById("equipmentCatalogGrid");
        const empty = document.getElementById("equipmentCatalogEmpty");
        grid.innerHTML = "";
        empty.hidden = data.items.length > 0;
        data.items.forEach(item => {
          const card = document.createElement("article");
          card.className = "equipment-card";
          card.innerHTML = `<div class="equipment-image-wrap"><img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.name)}" loading="lazy"></div><div class="equipment-copy"><span class="equipment-label">EQUIPAMIENTO AGUARÁ</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p></div>`;
          grid.appendChild(card);
        });
      }
    } catch (error) {
      console.warn("AGUARÁ EQUIPAMIENTO:", error);
    }
  }

  async function init() {
    initGalleryLightbox();
    try {
      const response = await fetch("/api/public-media", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) applyMedia(data.media);
    } catch (error) {
      console.warn("AGUARÁ MEDIA:", error);
    }
    initGalleryLightbox();
    loadCatalog();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
