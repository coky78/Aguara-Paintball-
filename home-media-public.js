(() => {
  "use strict";
  function applyPriceFallback(){
    const game=document.getElementById("publicGamePrice");
    const hydrogel=document.getElementById("publicHydrogelPrice");
    if(game&&game.textContent.trim()==="$0")game.textContent="$29.000";
    if(hydrogel&&hydrogel.textContent.trim()==="$0")hydrogel.textContent="$25.000";
  }
  function makeCard(item, compact=false){
    const card=document.createElement("article");
    card.className=compact?"experience-media-card":"home-media-card";
    const media=item.media_type==="video"?document.createElement("video"):document.createElement("img");
    media.src=item.public_url;
    media.alt=item.alt_text||"Aguará Paintball";
    if(item.media_type==="video"){
      media.autoplay=true;media.muted=true;media.loop=true;media.playsInline=true;media.preload="metadata";
      media.setAttribute("playsinline","");media.setAttribute("webkit-playsinline","");media.setAttribute("aria-label",media.alt);
      media.addEventListener("loadedmetadata",()=>{const p=media.play();if(p&&typeof p.catch==="function")p.catch(()=>{media.controls=true;});},{once:true});
      media.addEventListener("error",()=>{media.controls=true;}, {once:true});
    }
    media.style.objectPosition=`${Number(item.position_x??50)}% ${Number(item.position_y??50)}%`;
    media.style.transform=`scale(${Number(item.zoom??1)})`;
    media.style.transformOrigin="center center";
    card.appendChild(media);
    return card;
  }
  async function init(){
    applyPriceFallback();
    const grid=document.getElementById("homeMediaGrid"),section=document.getElementById("homeMediaSection"),experienceSlot=document.getElementById("experienceMediaSlot");
    if(!grid||!section)return;
    try{
      const r=await fetch("/api/public-media",{cache:"no-store"}),d=await r.json();
      if(!d?.ok||!Array.isArray(d.media))return;
      const active=d.media.filter(x=>x.public_url&&x.enabled&&String(x.slot_key||"").startsWith("home_media_"));
      if(experienceSlot){
        experienceSlot.innerHTML="";
        active.slice(0,2).forEach(item=>experienceSlot.appendChild(makeCard(item,true)));
        experienceSlot.hidden=experienceSlot.children.length===0;
      }
      grid.innerHTML="";
      active.slice(2).forEach(item=>grid.appendChild(makeCard(item,false)));
      section.hidden=grid.children.length===0;
    }catch(error){
      console.warn("AGUARÁ HOME MEDIA:",error);
      if(experienceSlot)experienceSlot.hidden=true;
      section.hidden=true;
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
