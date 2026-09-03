/* AGUARÁ PAINTBALL — compatibilidad pública de disponibilidad.
   Solo expone fecha, horario y estado; nunca datos personales de reservas. */

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("FALTAN VARIABLES DE SUPABASE");
    return sendJson(res, 500, {
      ok: false,
      message: "Faltan variables de Supabase en Vercel."
    });
  }

  try {
    const baseUrl = supabaseUrl.replace(/\/$/, "");
    const url = `${baseUrl}/rest/v1/reservations?select=booking_date,booking_time,status&order=booking_date.asc,booking_time.asc`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json"
      }
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }

    if (!response.ok) {
      console.error("SUPABASE PUBLIC RESERVATIONS ERROR:", text);
      return sendJson(res, response.status, {
        ok: false,
        message: "No se pudo consultar la disponibilidad.",
        error: data
      });
    }

    const reservas = Array.isArray(data)
      ? data.map(row => ({
          booking_date: row.booking_date,
          booking_time: row.booking_time,
          status: row.status
        }))
      : [];

    return sendJson(res, 200, { ok: true, reservas });
  } catch (error) {
    console.error("ERROR PUBLIC RESERVATIONS:", error);
    return sendJson(res, 500, {
      ok: false,
      message: error?.message || "Error consultando disponibilidad."
    });
  }
}
