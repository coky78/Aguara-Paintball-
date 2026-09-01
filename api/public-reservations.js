/* =====================================================
   AGUARÁ PAINTBALL
   PUBLIC RESERVATIONS AVAILABILITY

   Endpoint público usado únicamente por el calendario.
   No expone nombres, teléfonos, comprobantes ni datos
   administrativos. Devuelve solamente fecha y horario.
===================================================== */

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return { supabaseUrl, supabaseKey };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, {
      ok: false,
      message: "Método no permitido."
    });
  }

  const config = getSupabaseConfig();

  if (!config) {
    return sendJson(res, 500, {
      ok: false,
      message: "Faltan variables de Supabase en Vercel."
    });
  }

  const baseUrl = config.supabaseUrl.replace(/\/$/, "");

  try {
    const response = await fetch(
      `${baseUrl}/rest/v1/reservations?select=booking_date,booking_time,fecha,horario&order=booking_date.asc,booking_time.asc`,
      {
        method: "GET",
        headers: {
          apikey: config.supabaseKey,
          Authorization: `Bearer ${config.supabaseKey}`,
          Accept: "application/json"
        }
      }
    );

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }

    if (!response.ok) {
      console.error("SUPABASE PUBLIC AVAILABILITY ERROR:", text);
      return sendJson(res, response.status, {
        ok: false,
        message: "No se pudieron consultar los horarios.",
        error: data
      });
    }

    const reservas = Array.isArray(data)
      ? data.map(row => ({
          booking_date: row.booking_date || row.fecha || "",
          booking_time: String(row.booking_time || row.horario || "").slice(0, 5)
        }))
      : [];

    res.setHeader("Cache-Control", "no-store");

    return sendJson(res, 200, {
      ok: true,
      reservas
    });
  } catch (error) {
    console.error("ERROR PUBLIC RESERVATIONS:", error);

    return sendJson(res, 500, {
      ok: false,
      message: error?.message || "Error consultando disponibilidad."
    });
  }
}
