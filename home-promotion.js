(() => {
  "use strict";

  const root = document.getElementById("homePromotion");
  if (!root) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[char]));

  async function loadPromotion() {
    try {
      const response = await fetch("/api/home-promotion", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.visible || !data.promotion) return;

      const promo = data.promotion;
      const hasCta = promo.ctaText && promo.ctaUrl;
      root.innerHTML = `
        <div class="home-promotion-card">
          <div class="home-promotion-tag">PROMOCIÓN / EVENTO ESPECIAL</div>
          ${promo.title ? `<h2>${escapeHtml(promo.title)}</h2>` : ""}
          ${promo.text ? `<p>${escapeHtml(promo.text).replace(/\n/g, "<br>")}</p>` : ""}
          ${promo.date ? `<div class="home-promotion-date">${escapeHtml(promo.date)}</div>` : ""}
          ${hasCta ? `<a class="home-promotion-cta" href="${escapeHtml(promo.ctaUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(promo.ctaText)} ↗</a>` : ""}
        </div>
      `;
      root.hidden = false;
    } catch (error) {
      console.warn("AGUARÁ PROMOCIÓN:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPromotion, { once: true });
  } else {
    loadPromotion();
  }
})();
