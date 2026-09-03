(function () {
  "use strict";

  function normalizeWhatsApp(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length === 10) digits = "549" + digits;
    return digits;
  }

  function addStyles() {
    if (document.getElementById("admin-mobile-reservations-styles")) return;

    const style = document.createElement("style");
    style.id = "admin-mobile-reservations-styles";
    style.textContent = `
      .admin-whatsapp {
        text-decoration: none !important;
      }

      @media (max-width: 640px) {
        #bookings {
          width: 100% !important;
        }

        .admin-reservation {
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 24px !important;
          margin-bottom: 20px !important;
          border-radius: 18px !important;
        }

        .admin-reservation-header {
          gap: 12px !important;
          margin-bottom: 20px !important;
          padding-bottom: 16px !important;
        }

        .admin-reservation-date {
          font-size: 20px !important;
          line-height: 1.25 !important;
        }

        .admin-reservation-time {
          font-size: 17px !important;
          margin-top: 7px !important;
        }

        .admin-status-badge {
          min-height: 38px !important;
          box-sizing: border-box !important;
          padding: 9px 13px !important;
          font-size: 12px !important;
        }

        .admin-reservation-info {
          font-size: 16px !important;
          line-height: 1.85 !important;
        }

        .admin-reservation-name {
          margin-bottom: 12px !important;
          font-size: 21px !important;
          line-height: 1.3 !important;
        }

        .admin-reservation-row {
          gap: 10px !important;
          align-items: flex-start !important;
          margin: 5px 0 !important;
          font-size: 16px !important;
        }

        .admin-reservation-id {
          margin-top: 13px !important;
          font-size: 13px !important;
        }

        .admin-reservation-notes {
          gap: 9px !important;
          margin-top: 12px !important;
          padding-top: 12px !important;
          font-size: 15px !important;
          line-height: 1.55 !important;
        }

        .booking-actions {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12px !important;
          margin-top: 22px !important;
          padding-top: 18px !important;
        }

        .admin-action-btn {
          width: 100% !important;
          min-width: 0 !important;
          min-height: 56px !important;
          box-sizing: border-box !important;
          padding: 14px 12px !important;
          border-radius: 13px !important;
          font-size: 15px !important;
        }

        .admin-action-icon {
          width: 24px !important;
          height: 24px !important;
          font-size: 19px !important;
        }

        .admin-whatsapp {
          background: linear-gradient(180deg, #25d366 0%, #128c4a 100%) !important;
          border-color: #43e483 !important;
        }
      }

      @media (max-width: 420px) {
        .admin-reservation {
          padding: 22px !important;
        }

        .booking-actions {
          grid-template-columns: 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getPhone(card) {
    const rows = card.querySelectorAll(".admin-reservation-row");
    for (const row of rows) {
      const text = row.textContent.replace(/\s+/g, " ").trim();
      if (text.includes("📱")) {
        return text.replace("📱", "").trim();
      }
    }
    return "";
  }

  function decorateReservation(card) {
    if (!card || card.dataset.mobileReservationReady === "1") return;

    const actions = card.querySelector(".booking-actions");
    if (!actions) return;

    const phone = normalizeWhatsApp(getPhone(card));
    if (phone && !/^Sin teléfono$/i.test(getPhone(card))) {
      const button = document.createElement("a");
      button.className = "admin-action-btn admin-whatsapp";
      button.href = "https://wa.me/" + phone;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.setAttribute("aria-label", "Abrir WhatsApp del cliente");
      button.innerHTML = '<span class="admin-action-icon">💬</span><span>WhatsApp cliente</span>';
      actions.prepend(button);
    }

    card.dataset.mobileReservationReady = "1";
  }

  function decorateAll() {
    document.querySelectorAll("#bookings .admin-reservation").forEach(decorateReservation);
  }

  function init() {
    addStyles();
    decorateAll();

    const container = document.getElementById("bookings");
    if (!container || container.dataset.mobileReservationObserver === "1") return;

    const observer = new MutationObserver(function () {
      decorateAll();
    });

    observer.observe(container, { childList: true, subtree: true });
    container.dataset.mobileReservationObserver = "1";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
