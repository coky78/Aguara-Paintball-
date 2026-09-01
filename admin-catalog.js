(() => {
  "use strict";

  const MAX_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = /image\/(jpeg|png|webp)$/;
  const BUCKET = "site-media";
  const SUPABASE_URL = "https://tplnyjgexpfqkaevvflq.supabase.co";
  let initialized = false;

  const escapeHtml = (value) => String(value || "").replace(/[&<>\"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[char]));

  function styles() {
    if (document.getElementById("catalog-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "catalog-admin-styles";
    style.textContent = `
      .catalog-admin-box{margin-top:24px}.catalog-admin-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:16px}.catalog-admin-head p{margin:5px 0 0;color:#aaa}.catalog-admin-add{display:grid;grid-template-columns:1fr 1.4fr 180px auto;gap:10px;align-items:end;margin-bottom:18px}.catalog-admin-add label,.catalog-item-fields label{display:grid;gap:5px;color:#aaa;font-size:12px}.catalog-admin-add input,.catalog-admin-add textarea,.catalog-item-fields input,.catalog-item-fields textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid #444;border-radius:8px;background:#171717;color:#fff}.catalog-admin-add textarea{min-height:42px;resize:vertical}.catalog-admin-list{display:grid;gap:12px}.catalog-admin-item{display:grid;grid-template-columns:150px 1fr;gap:14px;padding:14px;border:1px solid #333;border-radius:14px;background:#101010}.catalog-admin-preview{aspect-ratio:4/3;overflow:hidden;border-radius:10px;background:#181818;border:1px solid #2e2e2e}.catalog-admin-preview img{width:100%;height:100%;object-fit:cover;display:block}.catalog-item-fields{display:grid;grid-template-columns:1fr 110px;gap:9px;align-items:end}.catalog-item-fields .wide{grid-column:1/-1}.catalog-item-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.catalog-item-actions .btn{flex:1 1 130px}.catalog-admin-status{min-height:18px;margin-top:8px;font-size:13px;color:#aaa}.catalog-empty{padding:20px;border:1px dashed #333;border-radius:12px;color:#888;text-align:center}@media(max-width:700px){.catalog-admin-add{grid-template-columns:1fr}.catalog-admin-item{grid-template-columns:1fr}.catalog-item-fields{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  async function api(options = {}) {
    const response = await fetch("/api/admin-catalog", { ...options, credentials:"same-origin", headers:{Accept:"application/json","Content-Type":"application/json",...(options.headers||{})} });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Error gestionando catálogo.");
    return data;
  }

  async function uploadImage(file) {
    if (!file) throw new Error("Seleccioná una imagen.");
    if (!ALLOWED_TYPES.test(file.type)) throw new Error("Usá JPG, PNG o WEBP.");
    if (file.size > MAX_BYTES) throw new Error("La imagen debe pesar como máximo 5 MB.");
    const prepared = await api({method:"POST",body:JSON.stringify({action:"prepare-upload",fileName:file.name,contentType:file.type,fileSize:file.size})});
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${prepared.path}?token=${encodeURIComponent(prepared.token)}`;
    const uploadResponse = await fetch(uploadUrl,{method:"POST",headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});
    if (!uploadResponse.ok) throw new Error("No se pudo subir la imagen.");
    return prepared.path;
  }

  function buildBox() {
    if (document.getElementById("catalogAdmin")) return document.getElementById("catalogAdmin");
    const media = document.getElementById("mediaAdmin");
    if (!media) return null;
    const box = document.createElement("section");
    box.id = "catalogAdmin";
    box.className = "catalog-admin-box booking-card";
    box.innerHTML = `<div class="catalog-admin-head"><div><h2>Catálogo de marcadoras</h2><p>Agregá, editá, cambiá la foto, ocultá, ordená o eliminá las marcadoras. Este bloque es informativo y no afecta reservas ni precios.</p></div></div><div class="catalog-admin-add"><label>Nombre / modelo<input id="catalogNewName" type="text" maxlength="120" placeholder="Ej.: Tippmann Cronus"></label><label>Descripción<textarea id="catalogNewDescription" maxlength="1000" placeholder="Descripción breve para los jugadores..."></textarea></label><label>Orden<input id="catalogNewOrder" type="number" value="0" min="0"></label><div><input id="catalogNewFile" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="catalogNewButton" class="btn btn-primary" type="button">+ Agregar marcadora</button></div></div><div id="catalogAdminStatus" class="catalog-admin-status"></div><div id="catalogAdminList" class="catalog-admin-list"></div>`;
    media.parentNode.insertBefore(box,media);
    box.querySelector("#catalogNewButton").addEventListener("click",()=>box.querySelector("#catalogNewFile").click());
    box.querySelector("#catalogNewFile").addEventListener("change",()=>createItem(box));
    return box;
  }

  async function createItem(box) {
    const file=box.querySelector("#catalogNewFile").files?.[0];
    const name=box.querySelector("#catalogNewName").value.trim();
    const description=box.querySelector("#catalogNewDescription").value.trim();
    const sortOrder=Number(box.querySelector("#catalogNewOrder").value||0);
    const status=box.querySelector("#catalogAdminStatus");
    if(!file)return;
    if(!name){status.textContent="Ingresá el nombre o modelo.";return;}
    status.textContent="Subiendo imagen...";
    try{const imagePath=await uploadImage(file);await api({method:"POST",body:JSON.stringify({action:"create",name,description,sortOrder,imagePath})});box.querySelector("#catalogNewName").value="";box.querySelector("#catalogNewDescription").value="";box.querySelector("#catalogNewOrder").value="0";box.querySelector("#catalogNewFile").value="";status.textContent="✓ Marcadora agregada.";await load();}catch(error){status.textContent=error.message||"No se pudo agregar la marcadora.";}
  }

  function render(items){
    const list=document.getElementById("catalogAdminList");if(!list)return;list.innerHTML="";
    if(!items.length){list.innerHTML='<div class="catalog-empty">Todavía no hay marcadoras cargadas.</div>';return;}
    items.forEach(item=>{
      const card=document.createElement("article");card.className="catalog-admin-item";card.dataset.id=item.id;card.dataset.imagePath=item.image_path||"";
      card.innerHTML=`<div class="catalog-admin-preview"><img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.name)}"></div><div><div class="catalog-item-fields"><label>Nombre / modelo<input class="catalog-name" maxlength="120" value="${escapeHtml(item.name)}"></label><label>Orden<input class="catalog-order" type="number" min="0" value="${Number(item.sort_order)||0}"></label><label class="wide">Descripción<textarea class="catalog-description" maxlength="1000">${escapeHtml(item.description)}</textarea></label><label class="wide"><span><input class="catalog-enabled" type="checkbox" ${item.enabled?"checked":""}> Mostrar en la portada</span></label></div><div class="catalog-item-actions"><input class="catalog-replace-file" type="file" accept="image/jpeg,image/png,image/webp" hidden><button class="btn btn-outline catalog-replace" type="button">Cambiar foto</button><button class="btn btn-outline catalog-save" type="button">Guardar cambios</button><button class="btn btn-outline catalog-delete" type="button">Eliminar</button></div><div class="catalog-admin-status catalog-item-status"></div></div>`;
      const replaceInput=card.querySelector(".catalog-replace-file");
      card.querySelector(".catalog-replace").addEventListener("click",()=>replaceInput.click());
      replaceInput.addEventListener("change",()=>replaceImage(card,replaceInput.files?.[0]));
      card.querySelector(".catalog-save").addEventListener("click",()=>save(card));
      card.querySelector(".catalog-delete").addEventListener("click",()=>remove(card));
      list.appendChild(card);
    });
  }

  async function load(){const box=document.getElementById("catalogAdmin");if(!box)return;try{const data=await api();render(data.items||[]);}catch(error){document.getElementById("catalogAdminStatus").textContent=error.message||"No se pudo cargar el catálogo.";}}

  async function replaceImage(card,file){if(!file)return;const status=card.querySelector(".catalog-item-status");status.textContent="Subiendo nueva foto...";try{const oldPath=card.dataset.imagePath||"";const imagePath=await uploadImage(file);await api({method:"PATCH",body:JSON.stringify({id:card.dataset.id,imagePath,oldImagePath:oldPath})});status.textContent="✓ Foto reemplazada.";await load();}catch(error){status.textContent=error.message||"No se pudo reemplazar la foto.";}}

  async function save(card){const status=card.querySelector(".catalog-item-status");status.textContent="Guardando...";try{await api({method:"PATCH",body:JSON.stringify({id:card.dataset.id,name:card.querySelector(".catalog-name").value,description:card.querySelector(".catalog-description").value,sortOrder:Number(card.querySelector(".catalog-order").value||0),enabled:card.querySelector(".catalog-enabled").checked})});status.textContent="✓ Guardado.";}catch(error){status.textContent=error.message||"No se pudo guardar.";}}

  async function remove(card){if(!confirm("¿Eliminar esta marcadora del catálogo?"))return;const status=card.querySelector(".catalog-item-status");status.textContent="Eliminando...";try{await api({method:"DELETE",body:JSON.stringify({id:card.dataset.id})});await load();}catch(error){status.textContent=error.message||"No se pudo eliminar.";}}

  function init(){if(initialized)return;initialized=true;styles();buildBox();load();}
  const wait=()=>{if(document.getElementById("admin-panel")?.style.display==="block")init();else setTimeout(wait,200)};wait();
})();