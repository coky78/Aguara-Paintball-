const DEFAULTS={
  gamePrice:29000,
  shotsText:"100 TIROS INCLUIDOS",
  deposit:50000,
  minPlayers:10,
  whatsapp:"5493790000000",
  slots:["10:00","12:00","14:00","16:00","18:00","20:00"]
};

const getConfig=()=>({
  ...DEFAULTS,
  ...JSON.parse(localStorage.getItem("aguaraConfig")||"{}")
});

const money=n=>new Intl.NumberFormat("es-AR",{
  style:"currency",
  currency:"ARS",
  maximumFractionDigits:0
}).format(Number(n)||0);

const cfg=getConfig();

document.getElementById("year").textContent=
  new Date().getFullYear();

document.getElementById("publicGamePrice").textContent=
  money(cfg.gamePrice);

document.getElementById("publicDeposit").textContent=
  money(cfg.deposit);

document.getElementById("depositInline").textContent=
  money(cfg.deposit);

document.getElementById("publicMinPlayers").textContent=
  cfg.minPlayers;

const publicShotsText=
  document.getElementById("publicShotsText");

if(publicShotsText){
  publicShotsText.textContent=
    cfg.shotsText || "100 TIROS INCLUIDOS";
}

const waMsg=encodeURIComponent(
  "Hola, quiero consultar por una reserva en Aguará Paintball."
);
