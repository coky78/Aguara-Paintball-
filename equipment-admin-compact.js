(() => {
  "use strict";
  if (document.getElementById("aguara-equipment-compact-styles")) return;
  const style = document.createElement("style");
  style.id = "aguara-equipment-compact-styles";
  style.textContent = `
    #catalogAdmin { padding: 12px !important; margin-top: 12px !important; }
    #catalogAdmin .catalog-admin-head { gap: 7px !important; margin-bottom: 10px !important; }
    #catalogAdmin .catalog-admin-head label,
    #catalogAdmin .catalog-admin-add label,
    #catalogAdmin .catalog-item-fields label { font-size: 10px !important; gap: 3px !important; }
    #catalogAdmin .catalog-admin-title { padding: 8px 10px !important; font-size: 15px !important; }
    #catalogAdmin .catalog-admin-subtitle { min-height: 42px !important; padding: 8px 10px !important; font-size: 12px !important; }
    #catalogAdmin .catalog-admin-add { gap: 7px !important; margin-bottom: 10px !important; padding: 9px !important; border-radius: 10px !important; }
    #catalogAdmin .catalog-admin-add input,
    #catalogAdmin .catalog-admin-add textarea,
    #catalogAdmin .catalog-item-fields input,
    #catalogAdmin .catalog-item-fields textarea { padding: 7px !important; font-size: 11px !important; border-radius: 7px !important; }
    #catalogAdmin .catalog-admin-add textarea { min-height: 34px !important; }
    #catalogAdmin .catalog-admin-list { grid-template-columns: repeat(3,minmax(0,1fr)) !important; gap: 8px !important; }
    #catalogAdmin .catalog-admin-item { display:block !important; padding: 8px !important; border-radius: 10px !important; }
    #catalogAdmin .catalog-admin-preview { aspect-ratio: 4/3 !important; border-radius: 7px !important; margin-bottom: 7px !important; }
    #catalogAdmin .catalog-item-fields { grid-template-columns: 1fr 55px !important; gap: 6px !important; }
    #catalogAdmin .catalog-item-actions { display:grid !important; grid-template-columns: 1fr 1fr !important; gap: 5px !important; margin-top: 7px !important; }
    #catalogAdmin .catalog-item-actions .btn { min-height: 29px !important; padding: 5px 6px !important; font-size: 9px !important; border-radius: 6px !important; }
    #catalogAdmin .catalog-admin-status { min-height: 13px !important; margin-top: 5px !important; font-size: 9px !important; }
    .catalog-photo-editor { padding: 8px !important; }
    .catalog-photo-editor-card { width:min(680px,96vw) !important; padding:10px !important; border-radius:12px !important; }
    .catalog-photo-editor-card h3 { margin:0 !important; font-size:16px !important; }
    .catalog-photo-editor-card p { font-size:11px !important; margin:4px 0 !important; }
    .catalog-photo-editor-canvas-wrap { min-height:180px !important; border-radius:8px !important; }
    .catalog-photo-editor-controls { grid-template-columns:1fr 1fr !important; gap:8px !important; margin-top:8px !important; }
    .catalog-photo-editor-controls label { font-size:11px !important; font-weight:800 !important; }
    .catalog-photo-editor-controls input[type=range] { display:block !important; width:100% !important; min-height:30px !important; cursor:pointer !important; accent-color:#f28b24 !important; }
    .catalog-editor-zoom { opacity:1 !important; visibility:visible !important; }
    .catalog-photo-editor-actions { gap:5px !important; margin-top:8px !important; }
    .catalog-photo-editor-actions .btn { min-height:32px !important; padding:6px 8px !important; font-size:10px !important; border-radius:7px !important; }
    @media(max-width:900px){ #catalogAdmin .catalog-admin-list{grid-template-columns:repeat(2,minmax(0,1fr)) !important;} }
    @media(max-width:560px){ #catalogAdmin .catalog-admin-list{grid-template-columns:1fr !important;} #catalogAdmin .catalog-admin-item{max-width:100% !important;} .catalog-photo-editor-controls{grid-template-columns:1fr !important;} }
  `;
  document.head.appendChild(style);
})();
