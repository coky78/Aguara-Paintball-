export default async function handler(req, res) {
  // Solo permitir POST y GET
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: Faltan variables de Supabase");

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
        `${supabaseUrl}/rest/v1/reservation?select=*&order=fecha.asc,horario.asc`,
        {
          method: "GET",

          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const responseText = await response.text();

      console.log(
        "SUPABASE GET STATUS:",
        response.status
      );

      console.log(
        "SUPABASE GET RESPONSE:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
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


    const {
      nombre,
      whatsapp,
      fecha,
      horario,
      jugadores,
      tipo_de_juego,
      precio_por_jugador,
      total,
      sena_requerida,
      monto_recibido,
      estado_de_pago,
      estado_de_reserva,
      fecha_de_transferencia,
      observaciones
    } = body;


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

    if (!jugadores || Number(jugadores) <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad de jugadores no es válida"
      });
    }


    /* =====================================================
       DATOS QUE SE GUARDARÁN EN SUPABASE
    ===================================================== */

    const reserva = {
      nombre: String(nombre),
      whatsapp: String(whatsapp),
      fecha: fecha,
      horario: horario,
      jugadores: Number(jugadores),

      tipo_de_juego:
        tipo_de_juego || "Paintball",

      precio_por_jugador:
        precio_por_jugador !== undefined &&
        precio_por_jugador !== null
          ? Number(precio_por_jugador)
          : null,

      total:
        total !== undefined &&
        total !== null
          ? Number(total)
          : null,

      sena_requerida:
        sena_requerida !== undefined &&
        sena_requerida !== null
          ? Number(sena_requerida)
          : null,

      monto_recibido:
        monto_recibido !== undefined &&
        monto_recibido !== null
          ? Number(monto_recibido)
          : 0,

      estado_de_pago:
        estado_de_pago || "pendiente",

      estado_de_reserva:
        estado_de_reserva || "pendiente",

      fecha_de_transferencia:
        fecha_de_transferencia || null,

      observaciones:
        observaciones || null
    };


    console.log(
      "GUARDANDO EN SUPABASE:",
      JSON.stringify(reserva)
    );


    /* =====================================================
       ENVIAR A SUPABASE
    ===================================================== */

    const response = await fetch(
      `${supabaseUrl}/rest/v1/reservation`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=representation"
        },

        body: JSON.stringify(reserva)
      }
    );


    /* =====================================================
       LEER RESPUESTA SIN ROMPER EL ERROR
    ===================================================== */

    const responseText =
      await response.text();


    console.log(
      "SUPABASE POST STATUS:",
      response.status
    );

    console.log(
      "SUPABASE POST RESPONSE:",
      responseText
    );


    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }


    /* =====================================================
       ERROR DE SUPABASE
    ===================================================== */

    if (!response.ok) {
      console.error(
        "ERROR SUPABASE COMPLETO:",
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
       ÉXITO
    ===================================================== */

    return res.status(201).json({
      ok: true,

      message:
        "Reserva guardada correctamente",

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
        "Error interno al procesar la reserva",

      error:
        error.message
    });
  }
}
