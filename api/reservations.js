```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   API RESERVATIONS
   GET + POST
===================================================== */

export default async function handler(req, res) {

  /* =====================================================
     MÉTODOS PERMITIDOS
  ===================================================== */

  if (req.method !== "GET" && req.method !== "POST") {

    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });

  }


  /* =====================================================
     SUPABASE
  ===================================================== */

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


  if (!supabaseUrl || !supabaseKey) {

    console.error(
      "FALTAN VARIABLES DE SUPABASE"
    );

    return res.status(500).json({
      ok: false,
      message:
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel"
    });

  }


  /* =====================================================
     GET — LISTAR RESERVAS
  ===================================================== */

  if (req.method === "GET") {

    try {

      const response =
        await fetch(
          supabaseUrl +
          "/rest/v1/reservations?select=*&order=fecha.asc,horario.asc",
          {
            method: "GET",

            headers: {
              apikey: supabaseKey,
              Authorization:
                "Bearer " + supabaseKey,
              "Content-Type":
                "application/json"
            }
          }
        );


      const text =
        await response.text();


      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = [];
      }


      if (!response.ok) {

        console.error(
          "SUPABASE GET ERROR:",
          text
        );

        return res.status(response.status).json({
          ok: false,
          message:
            "Supabase no pudo consultar las reservas",
          error: text
        });

      }


      return res.status(200).json({
        ok: true,
        reservas: data
      });


    } catch (error) {

      console.error(
        "ERROR GET RESERVATIONS:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          error.message ||
          "Error consultando reservas"
      });

    }

  }


  /* =====================================================
     POST — CREAR RESERVA
  ===================================================== */

  try {

    const body =
      req.body || {};


    console.log(
      "DATOS RECIBIDOS:",
      JSON.stringify(body)
    );


    /* ===================================================
       DATOS PRINCIPALES
    =================================================== */

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


    /* ===================================================
       VALIDACIONES
    =================================================== */

    if (!nombre) {

      return res.status(400).json({
        ok: false,
        message: "Falta el nombre"
      });

    }


    if (!whatsapp) {

      return res.status(400).json({
        ok: false,
        message:
          "Falta el número de WhatsApp"
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
        message:
          "Falta el horario"
      });

    }


    if (
      !Number.isFinite(jugadores) ||
      jugadores < 10
    ) {

      return res.status(400).json({
        ok: false,
        message:
          "La reserva requiere un mínimo de 10 jugadores"
      });

    }


    /* ===================================================
       CONVERTIR VALORES NUMÉRICOS
    =================================================== */

    const precioPorJugador =
      body.precio_por_jugador != null
        ? Number(body.precio_por_jugador)
        : 29000;


    const total =
      body.total != null
        ? Number(body.total)
        : precioPorJugador * jugadores;


    const senaRequerida =
      body.sena_requerida != null
        ? Number(body.sena_requerida)
        : 50000;


    const montoRecibido =
      body.monto_recibido != null
        ? Number(body.monto_recibido)
        : 0;


    /* ===================================================
       RESERVA
       
       ESTOS NOMBRES COINCIDEN CON LA TABLA
       DE SUPABASE QUE ME MOSTRASTE.
       
       NO INCLUIMOS "observaciones".
    =================================================== */

    const reserva = {

      nombre:
        nombre,

      whatsapp:
        whatsapp,

      fecha:
        fecha,

      horario:
        horario,

      jugadores:
        jugadores,

      tipo_de_juego:
        String(
          body.tipo_de_juego ||
          "Paintball"
        ),

      precio_por_jugador:
        Number.isFinite(precioPorJugador)
          ? precioPorJugador
          : 29000,

      total:
        Number.isFinite(total)
          ? total
          : precioPorJugador * jugadores,

      sena_requerida:
        Number.isFinite(senaRequerida)
          ? senaRequerida
          : 50000,

      monto_recibido:
        Number.isFinite(montoRecibido)
          ? montoRecibido
          : 0,

      estado_de_pago:
        String(
          body.estado_de_pago ||
          "pendiente"
        ),

      estado_de_reserva:
        String(
          body.estado_de_reserva ||
          "pendiente"
        ),

      fecha_de_transferencia:
        body.fecha_de_transferencia
          ? body.fecha_de_transferencia
          : null

    };


    console.log(
      "RESERVA QUE SE ENVÍA A SUPABASE:",
      JSON.stringify(reserva)
    );


    /* ===================================================
       INSERTAR
    =================================================== */

    const response =
      await fetch(
        supabaseUrl +
        "/rest/v1/reservations",
        {
          method: "POST",

          headers: {
            apikey:
              supabaseKey,

            Authorization:
              "Bearer " + supabaseKey,

            "Content-Type":
              "application/json",

            Prefer:
              "return=representation"
          },

          body:
            JSON.stringify(reserva)
        }
      );


    /* ===================================================
       RESPUESTA SUPABASE
    =================================================== */

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

      data =
        JSON.parse(text);

    } catch {

      data =
        text;

    }


    /* ===================================================
       ERROR
    =================================================== */

    if (!response.ok) {

      console.error(
        "ERROR REAL DE SUPABASE:",
        data
      );


      return res.status(response.status).json({

        ok: false,

        message:
          data?.message ||
          data?.hint ||
          data?.details ||
          data?.error ||
          "Supabase rechazó la reserva",

        error:
          data

      });

    }


    /* ===================================================
       ÉXITO
    =================================================== */

    console.log(
      "RESERVA GUARDADA CORRECTAMENTE"
    );


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
        error?.message ||
        "Error interno al procesar la reserva",

      error:
        String(error)

    });

  }

}
```
