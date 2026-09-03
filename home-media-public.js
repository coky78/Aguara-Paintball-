(() => {
  "use strict";
  function makeCard(item, compact=false){
    const card=document.createElement("article");
    card.className=compact?"experience-media-card":"home-media-card";
    const media=item.media_type==="video"?document.createElement("video"):document.createElement("img");
    media.src=item.public_url;
    media.alt=item.alt_text||item.title||"Aguará Paintball";
    if(item.media_type==="video"){
      media.autoplay=true;media.muted=true;media.loop=true;media.playsInline=true;
      media.setAttribute("aria-label",media.alt);
    }
    media.style.objectPosition=`${Number(item.position_x??50)}% ${Number(item.position_y??50)}%`;
    media.style.transform=`scale(${Number(item.zoom??1)})`;
    media.style.transformOrigin="center center";
    card.appendChild(media);
    if(item.title){
      const cap=document.createElement("div");
      cap.className=compact?"experience-media-caption":"home-media-caption";
      cap.textContent=item.title;
      card.appendChild(cap);
    }
    return card;
  }
  async function init(){
    const grid=document.getElementById("homeMediaGrid"),section=document.getElementById("homeMediaSection"),experienceSlot=document.getElementById("experienceMediaSlot");
    if(!grid||!section)return;
    try{
      const r=await fetch("/api/public-home-media",{cache:"no-store"}),d=await r.json();
      if(!d?.ok||!Array.isArray(d.media))return;
      const active=d.media.filter(x=>x.public_url&&x.enabled);

      if(experienceSlot){
        experienceSlot.innerHTML="";
        active.slice(0,2).forEach(item=>experienceSlot.appendChild(makeCard(item,true)));
        experienceSlot.hidden=experienceSlot.children.length===0;
      }

      grid.innerHTML="";
      active.slice(2).forEach(item=>grid.appendChild(makeCard(item,false)));
      section.hidden=grid.children.length===0;

      const gallery=document.querySelector("#galeria .gallery"),lightbox=document.getElementById("lightbox"),lightboxImg=document.getElementById("lightboxImg");
      if(gallery){
        active.filter(item=>item.media_type!=="video").forEach(item=>{
          const button=document.createElement("button");
          button.type="button";button.className="gallery-item";button.dataset.src=item.public_url;button.dataset.title=item.title||"Aguará Paintball";
          const image=document.createElement("img");image.src=item.public_url;image.alt=item.alt_text||item.title||"Aguará Paintball";button.appendChild(image);
          button.addEventListener("click",()=>{if(lightbox&&lightboxImg){lightboxImg.src=item.public_url;lightboxImg.alt=item.alt_text||item.title||"Aguará Paintball";lightbox.hidden=false;lightbox.classList.add("is-open");document.body.classList.add("lightbox-open");}});
          gallery.appendChild(button);
        });
      }
    }catch(error){
      console.warn("AGUARÁ HOME MEDIA:",error);
      if(experienceSlot)experienceSlot.hidden=true;
      section.hidden=true;
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
