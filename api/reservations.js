```javascript
export default async function handler(req, res) {
  // =====================================================
  // SOLO GET Y POST
  // =====================================================

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });
  }

  // =====================================================
  // CONFIGURACIÓN SUPABASE
  // =====================================================

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de Supabase");

    return res.status(500).json({
      ok: false,
      message: "Faltan las variables de Supabase"
    });
  }

  // =====================================================
  // GET — LISTAR RESERVAS
  // =====================================================

  if (req.method === "GET") {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/reservations?select=*&order=fecha.asc,horario.asc`,
        {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json"
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
        console.error("SUPABASE GET ERROR:", text);

        return res.status(500).json({
          ok: false,
          message: "Error consultando reservas",
          error: text
        });
      }

      return res.status(200).json({
        ok: true,
        reservas: data
      });

    } catch (error) {
      console.error("GET ERROR:", error);

      return res.status(500).json({
        ok: false,
        message: error.message
      });
    }
  }

  // =====================================================
  // POST — CREAR RESERVA
  // =====================================================

  try {
    const body = req.body || {};

    const nombre =
      String(body.nombre || "").trim();

    const whatsapp =
      String(body.whatsapp || "").trim();

    const fecha =
      String(body.fecha || "").trim();

    const horario =
      String(body.horario || "").trim();

    const jugadores =
      Number(body.jugadores);

    // ===================================================
    // VALIDACIONES
    // ===================================================

    if (!nombre) {
      return res.status(400).json({
        ok: false,
        message: "Falta el nombre"
      });
    }

    if (!whatsapp) {
      return res.status(400).json({
        ok: false,
        message: "Falta el número de WhatsApp"
      });
    }

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "Falta la fecha"
      });
    }

    if (!horario) {
      return res.status(400).json({
        ok: false,
        message: "Falta el horario"
      });
    }

    if (
      !Number.isFinite(jugadores) ||
      jugadores <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad de jugadores no es válida"
      });
    }

    // ===================================================
    // PREPARAR RESERVA
    //
    // IMPORTANTE:
    // NO usamos "observaciones".
    // ===================================================

    const reserva = {
      nombre: nombre,
      whatsapp: whatsapp,
      fecha: fecha,
      horario: horario,

      jugadores: jugadores,

      tipo_de_juego:
        body.tipo_de_juego || "Paintball",

      precio_por_jugador:
        body.precio_por_jugador != null
          ? Number(body.precio_por_jugador)
          : null,

      total:
        body.total != null
          ? Number(body.total)
          : null,

      sena_requerida:
        body.sena_requerida != null
          ? Number(body.sena_requerida)
          : null,

      monto_recibido:
        body.monto_recibido != null
          ? Number(body.monto_recibido)
          : 0,

      estado_de_pago:
        body.estado_de_pago || "pendiente",

      estado_de_reserva:
        body.estado_de_reserva || "pendiente",

      fecha_de_transferencia:
        body.fecha_de_transferencia || null
    };

    console.log(
      "RESERVA A GUARDAR:",
      JSON.stringify(reserva)
    );

    // ===================================================
    // INSERTAR EN SUPABASE
    // ===================================================

    const response = await fetch(
      `${supabaseUrl}/rest/v1/reservations`,
      {
        method: "POST",

        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },

        body: JSON.stringify(reserva)
      }
    );

    // ===================================================
    // LEER RESPUESTA
    // ===================================================

    const text =
      await response.text();

    console.log(
      "SUPABASE STATUS:",
      response.status
    );

    console.log(
      "SUPABASE RESPONSE:",
      text
    );

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // ===================================================
    // ERROR SUPABASE
    // ===================================================

    if (!response.ok) {
      console.error(
        "SUPABASE INSERT ERROR:",
        data
      );

      return res.status(500).json({
        ok: false,
        message:
          data?.message ||
          data?.error ||
          "Supabase rechazó la reserva",
        error: data
      });
    }

    // ===================================================
    // ÉXITO
    // ===================================================

    return res.status(201).json({
      ok: true,
      message: "Reserva guardada correctamente",
      reserva:
        Array.isArray(data)
          ? data[0]
          : data
    });

  } catch (error) {

    console.error(
      "ERROR GENERAL RESERVATIONS:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        error?.message ||
        "Error interno al procesar la reserva"
    });
  }
}
```
