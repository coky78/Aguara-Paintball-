/* Aguará Paintball — información editable junto al calendario */
import { parseBookingInfo } from "./booking-info-utils.js";

(() => {
  "use strict";
  const DEFAULT_TEXT = "Elegí primero la fecha y después uno de los horarios disponibles. La seña es necesaria para confirmar la reserva.";

  function addStyles() {
    if (document.getElementById("booking-info-public-styles")) return;
    const style = document.createElement("style");
    style.id = "booking-info-public-styles";
    style.textContent = `
      .booking-info-editable {
        position: relative;
        padding: 24px 24px 22px;
        border: 1px solid rgba(255, 140, 0, .35);
        border-radius: 18px;
        background: linear-gradient(145deg, rgba(255,140,0,.10), rgba(255,255,255,.035));
        box-shadow: 0 14px 34px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06);
        color: #f5f5f5;
        font-family: "Trebuchet MS", "Segoe UI", sans-serif;
        font-size: 16px;
        line-height: 1.7;
        letter-spacing: .15px;
      }
      .booking-info-editable::before {
        content: "INFORMACIÓN DE RESERVA";
        display: block;
        margin-bottom: 10px;
        color: #ff9d22;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 1.8px;
      }
      .booking-info-line { margin: 0 0 7px; white-space: pre-wrap; }
      .booking-info-line:last-child { margin-bottom: 0; }
      .booking-info-alias {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin: 12px 0;
        padding: 12px 13px;
        border: 1px solid rgba(255,157,34,.42);
        border-radius: 12px;
        background: rgba(0,0,0,.28);
      }
      .booking-info-alias-label {
        color: #ffb14e;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .8px;
      }
      .booking-info-alias-value {
        color: #fff;
        font-weight: 900;
        word-break: break-word;
        flex: 1 1 150px;
      }
      .booking-info-copy {
        appearance: none;
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 9px;
        padding: 8px 11px;
        background: #ff8c00;
        color: #111;
        font: inherit;
        font-size: 12px;
        font-weight: 900;
        cursor: pointer;
        transition: transform .15s ease, filter .15s ease;
      }
      .booking-info-copy:hover { transform: translateY(-1px); filter: brightness(1.08); }
      .booking-info-copy:active { transform: translateY(0); }
      .booking-info-copy:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
      @media (max-width: 640px) {
        .booking-info-editable { padding: 20px 18px; font-size: 15px; }
        .booking-info-copy { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  async function copyAlias(alias, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(alias);
      } else {
        const helper = document.createElement("textarea");
        helper.value = alias;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      const original = button.textContent;
      button.textContent = "✓ Copiado";
      setTimeout(() => { button.textContent = original; }, 1800);
    } catch (error) {
      console.warn("AGUARÁ: no se pudo copiar el alias", error);
      button.textContent = "Seleccioná y copiá";
      setTimeout(() => { button.textContent = "Copiar alias"; }, 1800);
    }
  }

  function render(box, text) {
    const parsed = parseBookingInfo(text || DEFAULT_TEXT);
    box.replaceChildren();

    parsed.lines.forEach((line) => {
      if (line.type === "alias") {
        const row = document.createElement("div");
        row.className = "booking-info-alias";

        const label = document.createElement("span");
        label.className = "booking-info-alias-label";
        label.textContent = line.label;

        const value = document.createElement("span");
        value.className = "booking-info-alias-value";
        value.textContent = line.value;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "booking-info-copy";
        button.textContent = "Copiar alias";
        button.addEventListener("click", () => copyAlias(line.value, button));

        row.append(label, value, button);
        box.appendChild(row);
        return;
      }

      const paragraph = document.createElement("p");
      paragraph.className = "booking-info-line";
      paragraph.textContent = line.value;
      box.appendChild(paragraph);
    });
  }

  async function init() {
    const box = document.getElementById("bookingInfoPublic");
    if (!box) return;
    addStyles();
    try {
      const response = await fetch("/api/booking-info?t=" + Date.now(), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "No se pudo cargar la información.");
      render(box, data.text || DEFAULT_TEXT);
    } catch (error) {
      console.warn("AGUARÁ BOOKING INFO:", error);
      render(box, DEFAULT_TEXT);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
