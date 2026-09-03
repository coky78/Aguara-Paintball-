import { createClient } from "@supabase/supabase-js";

function json(res, status, payload) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json")
    .setHeader("Cache-Control", "no-store")
    .json(payload);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, {
      ok: false,
      message: "Método no permitido."
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return json(res, 500, {
      ok: false,
      message: "Faltan variables de Supabase en Vercel."
    });
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const [
      { data: media, error: mediaError },
      { data: items, error: catalogError },
      { data: reservations, error: reservationsError }
    ] = await Promise.all([
      supabase
        .from("media_library")
        .select("slot_key,media_type,public_url,title,alt_text,enabled,sort_order,position_x,position_y,zoom")
        .eq("enabled", true)
        .not("public_url", "is", null)
        .order("sort_order", { ascending: true }),
      supabase
        .from("equipment_catalog")
        .select("id,name,description,public_url,sort_order,enabled")
        .eq("enabled", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("reservations")
        .select("booking_date,booking_time,status")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true })
    ]);

    if (mediaError) throw mediaError;
    if (catalogError) throw catalogError;
    if (reservationsError) throw reservationsError;

    const reservas = (Array.isArray(reservations) ? reservations : [])
      .filter((row) => String(row.status || "pending").toLowerCase() !== "cancelled")
      .map((row) => ({
        booking_date: String(row.booking_date || "").slice(0, 10),
        booking_time: String(row.booking_time || "").slice(0, 5),
        status: String(row.status || "pending").toLowerCase()
      }))
      .filter((row) => row.booking_date && row.booking_time);

    return json(res, 200, {
      ok: true,
      media: media || [],
      items: items || [],
      reservas
    });
  } catch (error) {
    console.error("PUBLIC MEDIA ERROR:", error);
    return json(res, 500, {
      ok: false,
      message: error.message || "No se pudo cargar la biblioteca pública."
    });
  }
}
