(() => {
  "use strict";
  if (document.getElementById("aguara-admin-reservations-square-styles")) return;
  const style = document.createElement("style");
  style.id = "aguara-admin-reservations-square-styles";
  style.textContent = `
    #bookings { display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:10px !important; align-items:stretch !important; }
    #bookings .admin-reservation { width:100% !important; aspect-ratio:1 / 1 !important; box-sizing:border-box !important; margin:0 !important; padding:10px !important; overflow:auto !important; display:flex !important; flex-direction:column !important; }
    #bookings .admin-reservation-header { flex:0 0 auto !important; margin-bottom:7px !important; padding-bottom:7px !important; gap:5px !important; }
    #bookings .admin-reservation-date { font-size:12px !important; }
    #bookings .admin-reservation-time { font-size:10px !important; margin-top:2px !important; }
    #bookings .admin-status-badge { padding:4px 6px !important; font-size:8px !important; }
    #bookings .admin-reservation-info { font-size:10px !important; line-height:1.25 !important; flex:1 1 auto !important; min-height:0 !important; overflow:auto !important; }
    #bookings .admin-reservation-name { font-size:12px !important; margin-bottom:4px !important; }
    #bookings .admin-reservation-row { gap:4px !important; font-size:10px !important; }
    #bookings .admin-reservation-id { margin-top:4px !important; font-size:7px !important; }
    #bookings .admin-reservation-notes { gap:4px !important; margin-top:4px !important; padding-top:4px !important; font-size:9px !important; }
    #bookings .booking-warning { padding:5px 6px !important; border-radius:6px !important; font-size:9px !important; }
    #bookings .booking-actions { flex:0 0 auto !important; display:grid !important; grid-template-columns:1fr 1fr !important; gap:4px !important; margin-top:6px !important; padding-top:6px !important; }
    #bookings .admin-action-btn { min-height:29px !important; padding:6px 5px !important; border-radius:6px !important; font-size:9px !important; gap:3px !important; }
    #bookings .admin-action-icon { width:13px !important; height:13px !important; font-size:10px !important; }
    @media(max-width:700px){ #bookings{grid-template-columns:repeat(2,minmax(0,1fr)) !important;} }
    @media(max-width:430px){ #bookings{grid-template-columns:1fr !important;} #bookings .admin-reservation{aspect-ratio:1 / 1 !important;} }
  `;
  document.head.appendChild(style);
})();
