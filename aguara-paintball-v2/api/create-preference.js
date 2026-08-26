import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import crypto from "crypto";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

function cfg(){
  return {
    deposit:Number(process.env.DEPOSIT_AMOUNT||50000),
    gamePrice:Number(process.env.GAME_PRICE||25000),
    minPlayers:Number(process.env.MIN_PLAYERS||10)
  };
}
function slots(){return (process.env.SLOTS||"10:00,12:00,14:00,16:00,18:00,20:00").split(",").map(s=>s.trim()).filter(Boolean)}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Método no permitido"});
  try{
    const {name,phone,date,time,players,notes}=req.body||{};
    const c=cfg();
    if(!name||!phone||!date||!time||!players) return res.status(400).json({error:"Completá todos los datos obligatorios."});
    if(Number(players)<c.minPlayers) return res.status(400).json({error:`La reserva mínima es de ${c.minPlayers} jugadores.`});
    if(!slots().includes(time)) return res.status(400).json({error:"Horario no válido."});

    const publicId=`AG-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const {data: reservation,error}=await supabase.from("reservations").insert({
      public_id:publicId,name,phone,booking_date:date,booking_time:time,players:Number(players),
      notes:notes||null,deposit_amount:c.deposit,game_price:c.gamePrice,status:"pending"
    }).select("id,public_id").single();

    if(error){
      if(error.code==="23505") return res.status(409).json({error:"Ese horario ya está reservado o pendiente. Elegí otro."});
      throw error;
    }

    const preference=await new Preference(mp).create({body:{
      items:[{id:publicId,title:`Aguará Paintball — seña ${date} ${time}`,quantity:1,currency_id:"ARS",unit_price:c.deposit}],
      external_reference:publicId,
      notification_url:`${process.env.PUBLIC_BASE_URL}/api/webhook`,
      back_urls:{
        success:`${process.env.PUBLIC_BASE_URL}/?reserva=${publicId}&pago=ok`,
        failure:`${process.env.PUBLIC_BASE_URL}/?reserva=${publicId}&pago=error`,
        pending:`${process.env.PUBLIC_BASE_URL}/?reserva=${publicId}&pago=pendiente`
      },
      auto_return:"approved"
    }});

    return res.status(200).json({reservationId:reservation.public_id,init_point:preference.init_point});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:"No se pudo crear la reserva."});
  }
}
