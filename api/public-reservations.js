/* =====================================================
   AGUARÁ PAINTBALL
   RESERVAS PÚBLICAS — SOLO FECHA/HORARIO/ESTADO

   Este endpoint existe para que el calendario público pueda
   consultar horarios ocupados sin exponer nombre, teléfono,
   comprobantes ni otros datos personales.
===================================================== */

function sendJson(res, status, payload) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json")
    .setHeader("Cache-Control", "no-store")
    .json(payload);
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey
  };
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

  try {
    const response = await fetch(
      config.supabaseUrl +
        "/rest/v1/reservations?select=booking_date,booking_time,status&order=booking_date.asc,booking_time.asc",
      {
        method: "GET",
        headers: {
          apikey: config.serviceRoleKey,
          Authorization: "Bearer " + config.serviceRoleKey,
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
      console.error("PUBLIC RESERVATIONS SUPABASE ERROR:", data);
      return sendJson(res, response.status, {
        ok: false,
        message: "No se pudieron consultar los horarios reservados."
      });
    }

    const reservas = (Array.isArray(data) ? data : [])
      .filter((row) => String(row.status || "pending").toLowerCase() !== "cancelled")
      .map((row) => ({
        booking_date: String(row.booking_date || "").slice(0, 10),
        booking_time: String(row.booking_time || "").slice(0, 5),
        status: String(row.status || "pending").toLowerCase()
      }))
      .filter((row) => row.booking_date && row.booking_time);

    return sendJson(res, 200, {
      ok: true,
      reservas
    });
  } catch (error) {
    console.error("PUBLIC RESERVATIONS ERROR:", error);
    return sendJson(res, 500, {
      ok: false,
      message: error?.message || "Error consultando horarios reservados."
    });
  }
}
