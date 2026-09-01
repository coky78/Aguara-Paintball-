(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  }

  function render(items) {
    const grid = document.getElementById("equipmentCatalogGrid");
    const empty = document.getElementById("equipmentCatalogEmpty");
    if (!grid || !empty) return;

    grid.innerHTML = "";
    if (!items.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "equipment-card";
      card.innerHTML = `
        <div class="equipment-image-wrap">
          <img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.closest('.equipment-card').classList.add('equipment-image-error')">
        </div>
        <div class="equipment-copy">
          <span class="equipment-label">EQUIPAMIENTO AGUARÁ</span>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  async function init() {
    try {
      const response = await fetch("/api/public-catalog", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) render(data.items || []);
    } catch (error) {
      console.warn("AGUARÁ CATÁLOGO:", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
