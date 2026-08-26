const DEFAULTS={gamePrice:25000,deposit:50000,minPlayers:10,whatsapp:"5493790000000",slots:["10:00","12:00","14:00","16:00","18:00","20:00"]};
const getConfig=()=>({...DEFAULTS,...JSON.parse(localStorage.getItem("aguaraConfig")||"{}")});
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(n)||0);
const cfg=getConfig();
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("publicGamePrice").textContent=money(cfg.gamePrice);
document.getElementById("publicDeposit").textContent=money(cfg.deposit);
document.getElementById("depositInline").textContent=money(cfg.deposit);
document.getElementById("publicMinPlayers").textContent=cfg.minPlayers;
const waMsg=encodeURIComponent("Hola, quiero consultar por una reserva en Aguará Paintball.");
["whatsappHero","whatsappBooking"].forEach(id=>{const el=document.getElementById(id);if(el)el.href=`https://wa.me/${cfg.whatsapp}?text=${waMsg}`});
const date=document.getElementById("date"),time=document.getElementById("time"),form=document.getElementById("bookingForm"),msg=document.getElementById("bookingMessage");
const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());date.min=today.toISOString().slice(0,10);

async function refreshSlots(){
  if(!date.value){time.innerHTML='<option value="">Elegí una fecha</option>';return}
  try{
    const r=await fetch(`/api/availability?date=${encodeURIComponent(date.value)}`);
    const data=await r.json();
    time.innerHTML='<option value="">Elegí un horario</option>';
    (data.slots||cfg.slots).forEach(s=>{
      const o=document.createElement("option");o.value=s;o.textContent=s+(data.blocked?.includes(s)?" — NO DISPONIBLE":" — disponible");o.disabled=data.blocked?.includes(s);time.appendChild(o);
    });
  }catch{time.innerHTML='<option value="">No se pudo consultar disponibilidad</option>'}
}
date.addEventListener("change",refreshSlots);refreshSlots();

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const players=Number(document.getElementById("players").value);
  if(players<cfg.minPlayers){msg.hidden=false;msg.textContent=`La reserva mínima es de ${cfg.minPlayers} jugadores.`;return}
  msg.hidden=false;msg.textContent="Creando reserva y preparando el pago…";
  const payload={name:document.getElementById("name").value.trim(),phone:document.getElementById("phone").value.trim(),date:date.value,time:time.value,players,notes:document.getElementById("notes").value.trim()};
  try{
    const r=await fetch("/api/create-preference",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"No se pudo crear la reserva");
    msg.innerHTML=`Reserva <strong>${data.reservationId}</strong> creada como pendiente. <a href="${data.init_point}" target="_blank" rel="noopener" style="color:#ffad45">Pagar seña →</a>`;
    refreshSlots();
  }catch(err){msg.textContent=err.message}
});
document.querySelectorAll(".gallery-item").forEach(btn=>btn.addEventListener("click",()=>{const lb=document.getElementById("lightbox");document.getElementById("lightboxImg").src=btn.dataset.src;lb.hidden=false}));
document.getElementById("closeLightbox").onclick=()=>document.getElementById("lightbox").hidden=true;
document.getElementById("lightbox").onclick=e=>{if(e.target.id==="lightbox")e.currentTarget.hidden=true};
