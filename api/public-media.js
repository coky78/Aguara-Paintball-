import { createClient } from "@supabase/supabase-js";

function json(res, status, payload) {
  return res.status(status).setHeader("Content-Type", "application/json").json(payload);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, message: "Método no permitido." });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase
      .from("media_library")
      .select("slot_key,media_type,public_url,title,alt_text,enabled,sort_order")
      .eq("enabled", true)
      .not("public_url", "is", null)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return json(res, 200, { ok: true, media: data || [] });
  } catch (error) {
    console.error("PUBLIC MEDIA ERROR:", error);
    return json(res, 500, { ok: false, message: error.message || "No se pudo cargar la biblioteca de medios." });
  }
}
