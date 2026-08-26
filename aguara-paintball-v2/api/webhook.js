import { createClient } from "@supabase/supabase-js";
import { Payment, MercadoPagoConfig } from "mercadopago";
import crypto from "crypto";

const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const mp=new MercadoPagoConfig({accessToken:process.env.MP_ACCESS_TOKEN});

async function notifyWhatsApp(text){
  if(!process.env.WHATSAPP_TOKEN||!process.env.WHATSAPP_PHONE_NUMBER_ID||!process.env.ADMIN_WHATSAPP)return;
  await fetch(`https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,{
    method:"POST",headers:{"Authorization":`Bearer ${process.env.WHATSAPP_TOKEN}`,"Content-Type":"application/json"},
    body:JSON.stringify({messaging_product:"whatsapp",to:process.env.ADMIN_WHATSAPP,type:"text",text:{body:text}})
  });
}

export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).end();
  try{
    const id=req.body?.data?.id;
    if(!id)return res.status(200).json({ok:true});
    const payment=await new Payment(mp).get({id});
    const external=payment.external_reference;
    if(!external)return res.status(200).json({ok:true});
    const status=payment.status;
    const newStatus=status==="approved"?"confirmed":status==="cancelled"||status==="rejected"?"cancelled":"pending";
    const {data:b}=await supabase.from("reservations").select("*").eq("public_id",external).single();
    if(!b)return res.status(200).json({ok:true});
    await supabase.from("reservations").update({
      status:newStatus,payment_id:String(id),confirmed_at:newStatus==="confirmed"?new Date().toISOString():null
    }).eq("public_id",external);
    if(newStatus==="confirmed"){
      await notifyWhatsApp(`🟠 AGUARÁ PAINTBALL — RESERVA CONFIRMADA\n${b.public_id}\n${b.name}\n📅 ${b.booking_date}\n⏰ ${b.booking_time}\n👥 ${b.players} jugadores\n💰 Seña acreditada: $${Number(b.deposit_amount).toLocaleString("es-AR")}`);
    }
    return res.status(200).json({ok:true});
  }catch(e){console.error(e);return res.status(200).json({ok:true});}
}
