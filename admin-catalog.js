(() => {
  "use strict";

  const MAX_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = /image\/(jpeg|png|webp)$/;
  const BUCKET = "site-media";
  const SUPABASE_URL = "https://tplnyjgexpfqkaevvflq.supabase.co";
  let initialized = false;
  let editor = null;

  const escapeHtml = (value) => String(value || "").replace(/[&<>\"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[char]));

  function styles() {
    if (document.getElementById("catalog-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "catalog-admin-styles";
    style.textContent = `
      .catalog-admin-box{margin-top:24px}.catalog-admin-head{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:18px}.catalog-admin-head label{display:grid;gap:6px;color:#aaa;font-size:12px}.catalog-admin-title,.catalog-admin-subtitle{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #444;border-radius:9px;background:#171717;color:#fff;font-size:18px;font-weight:700}.catalog-admin-subtitle{font-size:14px;font-weight:400;min-height:48px;resize:vertical}.catalog-admin-save-head{justify-self:start}.catalog-admin-add{display:grid;grid-template-columns:1fr 1.4fr 180px 190px;gap:10px;align-items:end;margin-bottom:18px;padding:16px;border:1px dashed #444;border-radius:14px;background:#141414}.catalog-admin-add label,.catalog-item-fields label{display:grid;gap:5px;color:#aaa;font-size:12px}.catalog-admin-add input,.catalog-admin-add textarea,.catalog-item-fields input,.catalog-item-fields textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid #444;border-radius:8px;background:#171717;color:#fff}.catalog-admin-add textarea{min-height:42px;resize:vertical}.catalog-admin-add-photo{display:grid;gap:6px}.catalog-admin-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.catalog-admin-item{display:grid;grid-template-columns:180px 1fr;gap:14px;padding:14px;border:1px solid #333;border-radius:14px;background:#101010}.catalog-admin-preview{aspect-ratio:4/3;overflow:hidden;border-radius:10px;background:#181818;border:1px solid #2e2e2e}.catalog-admin-preview img{width:100%;height:100%;object-fit:cover;display:block}.catalog-item-fields{display:grid;grid-template-columns:1fr 90px;gap:9px;align-items:end}.catalog-item-fields .wide{grid-column:1/-1}.catalog-item-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.catalog-item-actions .btn{flex:1 1 120px}.catalog-admin-status{min-height:18px;margin-top:8px;font-size:13px;color:#aaa}.catalog-empty{padding:20px;border:1px dashed #333;border-radius:12px;color:#888;text-align:center;grid-column:1/-1}.catalog-photo-editor{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.82)}.catalog-photo-editor-card{width:min(760px,96vw);max-height:94vh;overflow:auto;background:#111;border:1px solid #444;border-radius:18px;padding:18px;box-shadow:0 20px 70px rgba(0,0,0,.7)}.catalog-photo-editor-canvas-wrap{display:grid;place-items:center;min-height:300px;background:#050505;border-radius:12px;overflow:hidden}.catalog-photo-editor canvas{display:block;width:min(100%,720px);height:auto;cursor:grab}.catalog-photo-editor canvas:active{cursor:grabbing}.catalog-photo-editor-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.catalog-photo-editor-controls label{display:grid;gap:6px;color:#bbb;font-size:13px}.catalog-photo-editor-controls input{width:100%}.catalog-photo-editor-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.catalog-photo-editor-actions .btn{flex:1 1 150px}@media(max-width:900px){.catalog-admin-list{grid-template-columns:1fr}}@media(max-width:700px){.catalog-admin-add{grid-template-columns:1fr}.catalog-admin-item{grid-template-columns:1fr}.catalog-item-fields{grid-template-columns:1fr}.catalog-photo-editor{padding:8px}.catalog-photo-editor-card{padding:12px}.catalog-photo-editor-controls{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  async function api(options = {}) {
    const response = await fetch("/api/admin-catalog", { ...options, credentials:"same-origin", headers:{Accept:"application/json","Content-Type":"application/json",...(options.headers||{})} });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Error gestionando equipamiento.");
    return data;
  }

  async function uploadImage(file) {
    if (!file) throw new Error("Seleccioná una imagen.");
    if (!ALLOWED_TYPES.test(file.type)) throw new Error("Usá JPG, PNG o WEBP.");
    if (file.size > MAX_BYTES) throw new Error("La imagen debe pesar como máximo 5 MB.");
    const prepared = await api({method:"POST",body:JSON.stringify({action:"prepare-upload",fileName:file.name,contentType:file.type,fileSize:file.size})});
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${prepared.path}?token=${encodeURIComponent(prepared.token)}`;
    const uploadResponse = await fetch(uploadUrl,{method:"PUT",headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});
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
    box.innerHTML = `<div class="catalog-admin-head"><label>Título de la sección<input id="catalogSectionTitle" class="catalog-admin-title" maxlength="120" value="Nuestro equipamiento"></label><label>Texto de la sección<textarea id="catalogSectionSubtitle" class="catalog-admin-subtitle" maxlength="500">Conocé el equipamiento que proporcionamos a los jugadores durante la experiencia Aguará.</textarea></label><button id="catalogSaveHead" class="btn btn-primary catalog-admin-save-head" type="button">Guardar título y texto</button></div><div class="catalog-admin-add"><label>Nombre / modelo<input id="catalogNewName" type="text" maxlength="120" placeholder="Ej.: Tippmann Cronus"></label><label>Descripción<textarea id="catalogNewDescription" maxlength="1000" placeholder="Descripción breve para los jugadores..."></textarea></label><label>Orden<input id="catalogNewOrder" type="number" value="0" min="0"></label><div class="catalog-admin-add-photo"><input id="catalogNewFile" type="file" accept="image/jpeg,image/png,image/webp"><button id="catalogNewButton" class="btn btn-primary" type="button">+ Agregar equipo con esta foto</button></div></div><div id="catalogAdminStatus" class="catalog-admin-status"></div><div id="catalogAdminList" class="catalog-admin-list"></div>`;
    media.parentNode.insertBefore(box,media);
    box.querySelector("#catalogNewButton").addEventListener("click",()=>createItem(box));
    box.querySelector("#catalogSaveHead").addEventListener("click",saveSectionText);
    return box;
  }

  async function saveSectionText(){
    const status=document.getElementById("catalogAdminStatus");
    status.textContent="Guardando título y texto...";
    try{localStorage.setItem("aguaraCatalogTitle",document.getElementById("catalogSectionTitle").value.trim());localStorage.setItem("aguaraCatalogSubtitle",document.getElementById("catalogSectionSubtitle").value.trim());status.textContent="✓ Título y texto guardados.";}catch(error){status.textContent=error.message||"No se pudo guardar.";}
  }

  async function createItem(box) {
    const file=box.querySelector("#catalogNewFile").files?.[0];
    const name=box.querySelector("#catalogNewName").value.trim();
    const description=box.querySelector("#catalogNewDescription").value.trim();
    const sortOrder=Number(box.querySelector("#catalogNewOrder").value||0);
    const status=box.querySelector("#catalogAdminStatus");
    if(!file){status.textContent="Elegí una foto para crear el bloque.";return;}
    if(!name){status.textContent="Ingresá el nombre o modelo.";return;}
    status.textContent="Subiendo foto...";
    try{const imagePath=await uploadImage(file);await api({method:"POST",body:JSON.stringify({action:"create",name,description,sortOrder,imagePath})});box.querySelector("#catalogNewName").value="";box.querySelector("#catalogNewDescription").value="";box.querySelector("#catalogNewOrder").value="0";box.querySelector("#catalogNewFile").value="";status.textContent="✓ Bloque de equipo agregado.";await load();}catch(error){status.textContent=error.message||"No se pudo agregar el equipo.";}
  }

  function render(items){
    const list=document.getElementById("catalogAdminList");if(!list)return;list.innerHTML="";
    if(!items.length){list.innerHTML='<div class="catalog-empty"><strong>Agregá el primer equipo</strong><br>Elegí una foto arriba, escribí el nombre y la descripción y presioná “+ Agregar equipo con esta foto”.</div>';return;}
    items.forEach(item=>{
      const card=document.createElement("article");card.className="catalog-admin-item";card.dataset.id=item.id;card.dataset.imagePath=item.image_path||"";
      card.innerHTML=`<div class="catalog-admin-preview"><img src="${escapeHtml(item.public_url)}" alt="${escapeHtml(item.name)}"></div><div><div class="catalog-item-fields"><label>Nombre / modelo<input class="catalog-name" maxlength="120" value="${escapeHtml(item.name)}"></label><label>Orden<input class="catalog-order" type="number" min="0" value="${Number(item.sort_order)||0}"></label><label class="wide">Descripción<textarea class="catalog-description" maxlength="1000">${escapeHtml(item.description)}</textarea></label><label class="wide"><span><input class="catalog-enabled" type="checkbox" ${item.enabled?"checked":""}> Mostrar en la portada</span></label></div><div class="catalog-item-actions"><input class="catalog-replace-file" type="file" accept="image/jpeg,image/png,image/webp" hidden><button class="btn btn-outline catalog-edit-photo" type="button">Editar foto</button><button class="btn btn-outline catalog-replace" type="button">Cambiar foto</button><button class="btn btn-outline catalog-save" type="button">Guardar cambios</button><button class="btn btn-outline catalog-delete" type="button">Eliminar</button></div><div class="catalog-admin-status catalog-item-status"></div></div>`;
      const replaceInput=card.querySelector(".catalog-replace-file");
      card.querySelector(".catalog-edit-photo").addEventListener("click",()=>openEditor(card));
      card.querySelector(".catalog-replace").addEventListener("click",()=>replaceInput.click());
      replaceInput.addEventListener("change",()=>replaceImage(card,replaceInput.files?.[0]));
      card.querySelector(".catalog-save").addEventListener("click",()=>save(card));
      card.querySelector(".catalog-delete").addEventListener("click",()=>remove(card));
      list.appendChild(card);
    });
  }

  async function load(){const box=document.getElementById("catalogAdmin");if(!box)return;const title=localStorage.getItem("aguaraCatalogTitle");const subtitle=localStorage.getItem("aguaraCatalogSubtitle");if(title)document.getElementById("catalogSectionTitle").value=title;if(subtitle)document.getElementById("catalogSectionSubtitle").value=subtitle;try{const data=await api();render(data.items||[]);}catch(error){document.getElementById("catalogAdminStatus").textContent=error.message||"No se pudo cargar el equipamiento.";}}

  async function replaceImage(card,file){if(!file)return;const status=card.querySelector(".catalog-item-status");status.textContent="Subiendo nueva foto...";try{const oldPath=card.dataset.imagePath||"";const imagePath=await uploadImage(file);await api({method:"PATCH",body:JSON.stringify({id:card.dataset.id,imagePath,oldImagePath:oldPath})});status.textContent="✓ Foto reemplazada.";await load();}catch(error){status.textContent=error.message||"No se pudo reemplazar la foto.";}}
  async function save(card){const status=card.querySelector(".catalog-item-status");status.textContent="Guardando...";try{await api({method:"PATCH",body:JSON.stringify({id:card.dataset.id,name:card.querySelector(".catalog-name").value,description:card.querySelector(".catalog-description").value,sortOrder:Number(card.querySelector(".catalog-order").value||0),enabled:card.querySelector(".catalog-enabled").checked})});status.textContent="✓ Guardado.";}catch(error){status.textContent=error.message||"No se pudo guardar.";}}
  async function remove(card){if(!confirm("¿Eliminar este equipo del sitio?"))return;const status=card.querySelector(".catalog-item-status");status.textContent="Eliminando...";try{await api({method:"DELETE",body:JSON.stringify({id:card.dataset.id})});await load();}catch(error){status.textContent=error.message||"No se pudo eliminar.";}}

  function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();image.crossOrigin="anonymous";image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("No se pudo cargar la foto para editarla."));image.src=url;});}
  function openEditor(card){closeEditor();const img=card.querySelector(".catalog-admin-preview img");if(!img?.src)return;editor={card,zoom:1,rotation:0,x:0,y:0,dragging:false,lastX:0,lastY:0,image:null};const modal=document.createElement("div");modal.className="catalog-photo-editor";modal.innerHTML=`<div class="catalog-photo-editor-card"><h3>Editar foto del equipo</h3><p style="color:#aaa;margin-top:4px">Arrastrá la foto para encuadrarla. Podés hacer zoom y rotarla.</p><div class="catalog-photo-editor-canvas-wrap"><canvas width="720" height="405"></canvas></div><div class="catalog-photo-editor-controls"><label>Zoom <input class="catalog-editor-zoom" type="range" min="1" max="3" step="0.01" value="1"></label><label>Rotación <input class="catalog-editor-rotation" type="range" min="-180" max="180" step="1" value="0"></label></div><div class="catalog-photo-editor-actions"><button class="btn btn-outline catalog-editor-reset" type="button">Restablecer</button><button class="btn btn-outline catalog-editor-cancel" type="button">Cancelar</button><button class="btn btn-primary catalog-editor-save" type="button">Guardar foto editada</button></div><div class="catalog-editor-status" style="color:#aaa;margin-top:8px;min-height:18px"></div></div>`;document.body.appendChild(modal);editor.modal=modal;editor.canvas=modal.querySelector("canvas");editor.ctx=editor.canvas.getContext("2d");modal.querySelector(".catalog-editor-zoom").addEventListener("input",e=>{editor.zoom=Number(e.target.value);drawEditor();});modal.querySelector(".catalog-editor-rotation").addEventListener("input",e=>{editor.rotation=Number(e.target.value);drawEditor();});modal.querySelector(".catalog-editor-reset").addEventListener("click",()=>{editor.zoom=1;editor.rotation=0;editor.x=0;editor.y=0;modal.querySelector(".catalog-editor-zoom").value="1";modal.querySelector(".catalog-editor-rotation").value="0";drawEditor();});modal.querySelector(".catalog-editor-cancel").addEventListener("click",closeEditor);modal.querySelector(".catalog-editor-save").addEventListener("click",saveEditedPhoto);const canvas=editor.canvas;canvas.addEventListener("pointerdown",e=>{editor.dragging=true;editor.lastX=e.clientX;editor.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(!editor.dragging)return;editor.x+=e.clientX-editor.lastX;editor.y+=e.clientY-editor.lastY;editor.lastX=e.clientX;editor.lastY=e.clientY;drawEditor();});canvas.addEventListener("pointerup",()=>{editor.dragging=false;});loadImage(img.src).then(image=>{if(!editor)return;editor.image=image;drawEditor();}).catch(error=>{if(editor)modal.querySelector(".catalog-editor-status").textContent=error.message;});}
  function drawEditor(){if(!editor?.image)return;const {ctx,canvas,image}=editor;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(canvas.width/2+editor.x,canvas.height/2+editor.y);ctx.rotate(editor.rotation*Math.PI/180);const scale=Math.max(canvas.width/image.width,canvas.height/image.height)*editor.zoom;ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);ctx.restore();}
  function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("No se pudo generar la foto editada.")),"image/jpeg",0.92));}
  async function saveEditedPhoto(){if(!editor?.image)return;const current=editor;const status=current.modal.querySelector(".catalog-editor-status");const button=current.modal.querySelector(".catalog-editor-save");button.disabled=true;status.textContent="Procesando y subiendo foto...";try{const blob=await canvasBlob(current.canvas);const file=new File([blob],`equipamiento-${current.card.dataset.id}.jpg`,{type:"image/jpeg"});const oldPath=current.card.dataset.imagePath||"";const imagePath=await uploadImage(file);await api({method:"PATCH",body:JSON.stringify({id:current.card.dataset.id,imagePath,oldImagePath:oldPath})});closeEditor();await load();}catch(error){button.disabled=false;status.textContent=error.message||"No se pudo guardar la foto editada.";}}
  function closeEditor(){if(editor?.modal)editor.modal.remove();editor=null;}
  function init(){if(initialized)return;initialized=true;styles();buildBox();load();}
  const wait=()=>{if(document.getElementById("admin-panel")?.style.display==="block")init();else setTimeout(wait,200)};wait();
})();