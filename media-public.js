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

  async function init() {
    try {
      const response = await fetch("/api/public-media", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) applyMedia(data.media);
    } catch (error) {
      console.warn("AGUARÁ MEDIA:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
