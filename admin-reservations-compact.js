/* =====================================================
   AGUARÁ PAINTBALL — RESERVAS COMPACTAS
   Solo presentación. No modifica datos ni lógica.
   Se carga después de admin.js para ajustar únicamente
   la apariencia de las tarjetas de reserva.
===================================================== */
(function () {
  if (document.getElementById("aguara-admin-reservations-compact-styles")) return;

  const style = document.createElement("style");
  style.id = "aguara-admin-reservations-compact-styles";
  style.textContent = `
    /* Contenedor de reservas: más aire entre tarjetas, sin exceso de altura. */
    #bookings {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
    }

    /* Tarjeta compacta y profesional. */
    #bookings .admin-reservation {
      margin: 0 !important;
      padding: 12px 14px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(255,255,255,.10) !important;
      background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.018)) !important;
      box-shadow: 0 6px 18px rgba(0,0,0,.16) !important;
    }

    /* IMPORTANTE: conservar los colores de estado definidos por admin.js. */
    #bookings .admin-reservation.booking-status-confirmed {
      border-color: #22c55e !important;
      background: rgba(34,197,94,0.10) !important;
    }

    #bookings .admin-reservation.booking-status-cancelled {
      border-color: #ef4444 !important;
      background: rgba(239,68,68,0.08) !important;
    }

    #bookings .admin-reservation.booking-status-pending {
      border-color: #444 !important;
      background: #111 !important;
    }

    #bookings .admin-reservation-header {
      margin: 0 0 9px !important;
      padding: 0 0 9px !important;
      gap: 8px !important;
      align-items: center !important;
    }

    #bookings .admin-reservation-date {
      font-size: 14px !important;
      line-height: 1.15 !important;
    }

    #bookings .admin-reservation-time {
      margin-top: 2px !important;
      font-size: 12px !important;
      line-height: 1.15 !important;
    }

    #bookings .admin-status-badge {
      padding: 5px 8px !important;
      font-size: 9px !important;
      letter-spacing: .45px !important;
      white-space: nowrap !important;
    }

    #bookings .admin-reservation-info {
      line-height: 1.35 !important;
    }

    #bookings .admin-reservation-name {
      margin: 0 0 6px !important;
      font-size: 14px !important;
      line-height: 1.2 !important;
    }

    #bookings .admin-reservation-row {
      min-width: 0 !important;
      gap: 6px !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
    }

    #bookings .admin-reservation-id {
      margin-top: 6px !important;
      font-size: 9px !important;
      line-height: 1.2 !important;
      opacity: .62 !important;
    }

    #bookings .admin-reservation-notes {
      gap: 5px !important;
      margin-top: 6px !important;
      padding-top: 6px !important;
      font-size: 11px !important;
      line-height: 1.3 !important;
    }

    #bookings .booking-actions {
      gap: 6px !important;
      margin-top: 10px !important;
      padding-top: 9px !important;
    }

    #bookings .admin-action-btn {
      min-height: 36px !important;
      padding: 8px 10px !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      gap: 5px !important;
      box-shadow: 0 4px 10px rgba(0,0,0,.20) !important;
    }

    #bookings .admin-action-icon {
      width: 17px !important;
      height: 17px !important;
      font-size: 13px !important;
    }

    #bookings .booking-warning {
      padding: 7px 9px !important;
      border-radius: 7px !important;
      font-size: 11px !important;
    }

    @media (max-width: 640px) {
      #bookings .admin-reservation {
        padding: 12px !important;
      }

      #bookings .admin-reservation-header {
        flex-wrap: nowrap !important;
      }

      #bookings .booking-actions {
        gap: 6px !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
