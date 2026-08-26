import { createClient } from "@supabase/supabase-js";
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const slots=()=> (process.env.SLOTS||"10:00,12:00,14:00,16:00,18:00,20:00").split(",").map(x=>x.trim()).filter(Boolean);
export default async function handler(req,res){
  const date=req.query?.date;
  if(!date)return res.status(400).json({error:"Falta la fecha"});
  const {data,error}=await supabase.from("reservations").select("booking_time,status").eq("booking_date",date).in("status",["pending","confirmed"]);
  if(error)return res.status(500).json({error:"No se pudo consultar disponibilidad"});
  res.status(200).json({slots:slots(),blocked:(data||[]).map(x=>x.booking_time)});
}
