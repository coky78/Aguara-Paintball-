(() => {
  "use strict";

  const root = document.getElementById("homePromotion");
  if (!root) return;

  const RESERVATION_URL = "#reservas";
  const RESERVATION_TEXT = "RESERVAR AHORA";

  const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[char]));

  function addPromotion3DStyle() {
    if (document.getElementById("aguaraPromotion3DStyle")) return;
    const style = document.createElement("style");
    style.id = "aguaraPromotion3DStyle";
    style.textContent = `
      .home-promotion-card{
        width:min(560px,90vw) !important;
        min-height:240px !important;
        padding:30px !important;
      }
      .home-promotion-card h2{
        position:relative;
        top:10px;
      }
      .home-promotion-animated-text{
        display:block;width:100%;box-sizing:border-box;text-align:center;
        color:#fff;font-weight:1000;letter-spacing:.02em;
        font-size:1.65em !important;
        line-height:1.12;
        transform-origin:center;position:relative;
        top:10px;
        text-shadow:0 2px 0 #b85c0a,0 4px 0 #7d3200,0 7px 12px rgba(0,0,0,.7);
        animation:aguaraPromotion3D 2.2s ease-in-out infinite;
        filter:drop-shadow(0 8px 7px rgba(0,0,0,.55));
      }
      @keyframes aguaraPromotion3D{
        0%,100%{transform:perspective(500px) rotateX(0deg) translateY(0) scale(1);text-shadow:0 2px 0 #b85c0a,0 4px 0 #7d3200,0 7px 12px rgba(0,0,0,.7);}
        50%{transform:perspective(500px) rotateX(8deg) translateY(-3px) scale(1.06);text-shadow:0 3px 0 #d66a0b,0 7px 0 #7d3200,0 0 18px rgba(242,139,36,.9),0 10px 18px rgba(0,0,0,.75);}
      }
      @media(max-width:640px){
        .home-promotion-card{width:92vw !important;min-height:220px !important;padding:24px !important;}
        .home-promotion-animated-text{font-size:1.35em !important;}
      }
    `;
    document.head.appendChild(style);
  }

  async function loadPromotion() {
    try {
      const response = await fetch("/api/home-promotion", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.visible || !data.promotion) return;

      const promo = data.promotion;
      addPromotion3DStyle();

      root.innerHTML = `
        <div class="home-promotion-card">
          <div class="home-promotion-tag">PROMOCIÓN / EVENTO ESPECIAL</div>
          ${promo.title ? `<h2>${escapeHtml(promo.title)}</h2>` : ""}
          ${promo.text ? `<p class="home-promotion-animated-text">${escapeHtml(promo.text).replace(/\n/g, "<br>")}</p>` : ""}
          ${promo.date ? `<div class="home-promotion-date">${escapeHtml(promo.date)}</div>` : ""}
          <a class="home-promotion-cta" href="${RESERVATION_URL}">${RESERVATION_TEXT} ↗</a>
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
