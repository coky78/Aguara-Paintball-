```javascript
export default async function handler(req, res) {
  // Solo permitir GET y POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });
  }

  // Variables de Supabase del servidor
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Comprobar configuración
  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de Supabase");

    return res.status(500).json({
      ok: false,
      message: "Faltan las variables de configuración de Supabase"
    });
  }

  try {
    /* =====================================================
       GET — CONSULTAR RESERVAS
    ===================================================== */

    if (req.method === "GET") {
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
        data = text;
      }

      if (!response.ok) {
        console.error("Error GET Supabase:", data);

        return res.status(response.status).json({
          ok: false,
          message: "No se pudieron consultar las reservas",
          error: data
        });
      }

      return res.status(200).json({
        ok: true,
        reservas: data
      });
    }


    /* =====================================================
       POST — CREAR RESERVA
    ===================================================== */

    const body = req.body || {};

    console.log(
      "DATOS RECIBIDOS:",
      JSON.stringify(body)
    );

    const nombre = body.nombre;
    const whatsapp = body.whatsapp;
    const fecha = body.fecha;
    const horario = body.horario;
    const jugadores = Number(body.jugadores);

    /* =====================================================
       VALIDACIONES
    ===================================================== */

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

    if (!Number.isFinite(jugadores) || jugadores <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad de jugadores no es válida"
      });
    }


    /* =====================================================
       PREPARAR DATOS
       
       IMPORTANTE:
       Estos nombres coinciden con las columnas
       de public.reservations.
    ===================================================== */

    const reserva = {
      nombre: String(nombre),
      whatsapp: String(whatsapp),
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
      "GUARDANDO RESERVA:",
      JSON.stringify(reserva)
    );


    /* =====================================================
       INSERTAR EN SUPABASE
    ===================================================== */

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


    /* =====================================================
       RESPUESTA DE SUPABASE
    ===================================================== */

    const text = await response.text();

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


    /* =====================================================
       ERROR
    ===================================================== */

    if (!response.ok) {
      console.error(
        "ERROR SUPABASE:",
        data
      );

      return res.status(response.status).json({
        ok: false,
        message:
          data?.message ||
          data?.error ||
          "Supabase rechazó la reserva",
        error: data
      });
    }


    /* =====================================================
       RESERVA GUARDADA
    ===================================================== */

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
      "ERROR GENERAL:",
      error
    );

    return res.status(500).json({
      ok: false,
      message: "Error interno al procesar la reserva",
      error: error.message
    });
  }
}
```
