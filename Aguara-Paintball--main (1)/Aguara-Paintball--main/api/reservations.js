/* =====================================================
   AGUARÁ PAINTBALL
   API RESERVATIONS
   GET + POST + PATCH + DELETE
   + AVISO TELEGRAM
===================================================== */

import { randomBytes } from "node:crypto";


/* =====================================================
   RESPUESTA JSON
===================================================== */

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}


/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

function getSupabaseConfig() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


  if (!supabaseUrl || !supabaseKey) {
    return null;
  }


  return {
    supabaseUrl,
    supabaseKey
  };
}


/* =====================================================
   HEADERS SUPABASE
===================================================== */

function supabaseHeaders(key, prefer) {

  const headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json"
  };


  if (prefer) {
    headers.Prefer = prefer;
  }


  return headers;
}


/* =====================================================
   TELEGRAM — AVISO DE NUEVA RESERVA
===================================================== */

async function enviarAvisoTelegram(reserva) {

  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID;


  if (!botToken || !chatId) {

    console.error(
      "FALTAN VARIABLES DE TELEGRAM"
    );

    return;
  }


  const precio =
    Number(
      reserva.game_price || 0
    );

  const sena =
    Number(
      reserva.deposit_amount || 0
    );


  const total =
    precio *
    Number(
      reserva.players || 0
    );


  const mensaje = `
🔔 NUEVA RESERVA PENDIENTE

🎯 AGUARÁ PAINTBALL

👤 Nombre: ${reserva.name}
📱 WhatsApp: ${reserva.phone}

📅 Fecha: ${reserva.booking_date}
🕐 Horario: ${reserva.booking_time}

👥 Jugadores: ${reserva.players}

💰 Precio por jugador: $${precio.toLocaleString("es-AR")}
💵 Seña requerida: $${sena.toLocaleString("es-AR")}
💳 Total estimado: $${total.toLocaleString("es-AR")}

🆔 Reserva: ${reserva.public_id}

⚠️ ESTADO: PENDIENTE
`;


  try {

    const response =
      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              chat_id:
                chatId,

              text:
                mensaje
            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      console.error(
        "ERROR TELEGRAM:",
        data
      );

    } else {

      console.log(
        "AVISO TELEGRAM ENVIADO CORRECTAMENTE"
      );

    }

  } catch (error) {

    console.error(
      "ERROR CONECTANDO CON TELEGRAM:",
      error
    );

  }
}


/* =====================================================
   ID PÚBLICO
===================================================== */

function createPublicId(
  fecha,
  horario
) {

  const compactDate =
    fecha.replaceAll("-", "");

  const compactTime =
    horario.replaceAll(":", "");

  const suffix =
    randomBytes(3)
      .toString("hex")
      .toUpperCase();


  return (
    "AG-" +
    compactDate +
    "-" +
    compactTime +
    "-" +
    suffix
  );
}


/* =====================================================
   HANDLER
===================================================== */

export default async function handler(
  req,
  res
) {

  if (
    req.method !== "GET" &&
    req.method !== "POST" &&
    req.method !== "PATCH" &&
    req.method !== "DELETE"
  ) {

    res.setHeader(
      "Allow",
      "GET, POST, PATCH, DELETE"
    );


    return sendJson(
      res,
      405,
      {
        ok: false,
        message:
          "Método no permitido."
      }
    );
  }


  const config =
    getSupabaseConfig();


  if (!config) {

    console.error(
      "FALTAN VARIABLES DE SUPABASE"
    );


    return sendJson(
      res,
      500,
      {
        ok: false,
        message:
          "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel."
      }
    );
  }


  const {
    supabaseUrl,
    supabaseKey
  } = config;


  const baseUrl =
    supabaseUrl.replace(/\/$/, "");


/* =====================================================
   GET — LISTAR RESERVAS
===================================================== */

  if (req.method === "GET") {

    try {

      const response =
        await fetch(
          `${baseUrl}/rest/v1/reservations?select=*&order=booking_date.asc,booking_time.asc`,
          {
            method: "GET",

            headers:
              supabaseHeaders(
                supabaseKey
              )
          }
        );


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        data = [];

      }


      if (!response.ok) {

        console.error(
          "SUPABASE GET ERROR:",
          text
        );


        return sendJson(
          res,
          response.status,
          {
            ok: false,
            message:
              "Supabase no pudo consultar las reservas.",
            error:
              data
          }
        );
      }


      return sendJson(
        res,
        200,
        {
          ok: true,
          reservas:
            Array.isArray(data)
              ? data
              : []
        }
      );


    } catch (error) {

      console.error(
        "ERROR GET RESERVATIONS:",
        error
      );


      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            error?.message ||
            "Error consultando reservas."
        }
      );
    }
  }


/* =====================================================
   DELETE — ELIMINAR RESERVA
===================================================== */

  if (req.method === "DELETE") {

    try {

      const body =
        req.body &&
        typeof req.body === "object"
          ? req.body
          : {};


      const publicId =
        String(
          body.public_id ??
          ""
        ).trim();


      if (!publicId) {

        return sendJson(
          res,
          400,
          {
            ok: false,
            message:
              "Falta el identificador de la reserva."
          }
        );
      }


      const response =
        await fetch(
          `${baseUrl}/rest/v1/reservations?public_id=eq.${encodeURIComponent(publicId)}`,
          {
            method: "DELETE",

            headers:
              supabaseHeaders(
                supabaseKey,
                "return=representation"
              )
          }
        );


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        data = text;

      }


      if (!response.ok) {

        console.error(
          "ERROR ELIMINANDO RESERVA:",
          data
        );


        return sendJson(
          res,
          response.status,
          {
            ok: false,
            message:
              data?.message ||
              data?.hint ||
              data?.details ||
              "No se pudo eliminar la reserva.",
            error:
              data
          }
        );
      }


      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        return sendJson(
          res,
          404,
          {
            ok: false,
            message:
              "No encontramos esa reserva."
          }
        );
      }


      return sendJson(
        res,
        200,
        {
          ok: true,
          message:
            "Reserva eliminada correctamente.",
          reserva:
            data[0]
        }
      );


    } catch (error) {

      console.error(
        "ERROR GENERAL DELETE:",
        error
      );


      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            error?.message ||
            "Error interno eliminando la reserva."
        }
      );
    }
  }


/* =====================================================
   PATCH — EDITAR / CAMBIAR ESTADO
===================================================== */

  if (req.method === "PATCH") {

    try {

      const body =
        req.body &&
        typeof req.body === "object"
          ? req.body
          : {};


      const publicId =
        String(
          body.public_id ??
          ""
        ).trim();


      if (!publicId) {

        return sendJson(
          res,
          400,
          {
            ok: false,
            message:
              "Falta el identificador de la reserva."
          }
        );
      }


      const update = {};


      /* -----------------------------------------------
         ESTADO
      ----------------------------------------------- */

      if (
        body.status !== undefined
      ) {

        const status =
          String(
            body.status
          ).trim();


        if (
          status !== "pending" &&
          status !== "confirmed" &&
          status !== "cancelled"
        ) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "Estado no válido."
            }
          );
        }


        update.status =
          status;


        if (
          status === "confirmed"
        ) {

          update.confirmed_at =
            new Date().toISOString();

        }


        if (
          status === "cancelled"
        ) {

          update.confirmed_at =
            null;

        }


        if (
          status === "pending"
        ) {

          update.confirmed_at =
            null;

        }
      }


      /* -----------------------------------------------
         DATOS DE EDICIÓN
      ----------------------------------------------- */

      if (
        body.name !== undefined
      ) {

        const name =
          String(
            body.name
          ).trim();


        if (!name) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "El nombre no puede estar vacío."
            }
          );
        }


        update.name =
          name;
      }


      if (
        body.phone !== undefined
      ) {

        const phone =
          String(
            body.phone
          ).trim();


        if (!phone) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "El número de WhatsApp no puede estar vacío."
            }
          );
        }


        update.phone =
          phone;
      }


      if (
        body.booking_date !== undefined
      ) {

        const bookingDate =
          String(
            body.booking_date
          ).trim();


        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(
            bookingDate
          )
        ) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "La fecha no es válida."
            }
          );
        }


        update.booking_date =
          bookingDate;
      }


      if (
        body.booking_time !== undefined
      ) {

        const bookingTime =
          String(
            body.booking_time
          ).trim();


        if (
          !/^\d{2}:\d{2}$/.test(
            bookingTime
          )
        ) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "El horario no es válido."
            }
          );
        }


        update.booking_time =
          bookingTime;
      }


      if (
        body.players !== undefined
      ) {

        const players =
          Number(
            body.players
          );


        if (
          !Number.isInteger(
            players
          ) ||
          players < 10
        ) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "La reserva requiere un mínimo de 10 jugadores."
            }
          );
        }


        update.players =
          players;
      }


      if (
        body.notes !== undefined
      ) {

        update.notes =
          String(
            body.notes
          ).trim() || null;
      }


      /* -----------------------------------------------
         NADA PARA ACTUALIZAR
      ----------------------------------------------- */

      if (
        Object.keys(update).length === 0
      ) {

        return sendJson(
          res,
          400,
          {
            ok: false,
            message:
              "No hay datos para actualizar."
          }
        );
      }


      /* -----------------------------------------------
         ACTUALIZAR SUPABASE
      ----------------------------------------------- */

      const response =
        await fetch(
          `${baseUrl}/rest/v1/reservations?public_id=eq.${encodeURIComponent(publicId)}`,
          {
            method: "PATCH",

            headers:
              supabaseHeaders(
                supabaseKey,
                "return=representation"
              ),

            body:
              JSON.stringify(
                update
              )
          }
        );


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        data = text;

      }


      if (!response.ok) {

        console.error(
          "ERROR ACTUALIZANDO RESERVA:",
          data
        );


        return sendJson(
          res,
          response.status,
          {
            ok: false,
            message:
              data?.message ||
              data?.hint ||
              data?.details ||
              "No se pudo actualizar la reserva.",
            error:
              data
          }
        );
      }


      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        return sendJson(
          res,
          404,
          {
            ok: false,
            message:
              "No encontramos esa reserva."
          }
        );
      }


      return sendJson(
        res,
        200,
        {
          ok: true,
          message:
            "Reserva actualizada correctamente.",
          reserva:
            data[0]
        }
      );


    } catch (error) {

      console.error(
        "ERROR GENERAL PATCH:",
        error
      );


      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            error?.message ||
            "Error interno actualizando la reserva."
        }
      );
    }
  }


/* =====================================================
   POST — CREAR RESERVA
===================================================== */

  try {

    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};


    const nombre =
      String(
        body.nombre ??
        body.name ??
        ""
      ).trim();


    const whatsapp =
      String(
        body.whatsapp ??
        body.phone ??
        ""
      ).trim();


    const fecha =
      String(
        body.fecha ??
        body.booking_date ??
        ""
      ).trim();


    const horario =
      String(
        body.horario ??
        body.booking_time ??
        ""
      ).trim();


    const jugadores =
      Number(
        body.jugadores ??
        body.players
      );


    const notas =
      String(
        body.notas ??
        body.notes ??
        body.observaciones ??
        ""
      ).trim();


    /* -----------------------------------------------
       VALIDACIONES
    ----------------------------------------------- */

    if (!nombre) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "Falta el nombre."
        }
      );
    }


    if (!whatsapp) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "Falta el número de WhatsApp."
        }
      );
    }


    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        fecha
      )
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "La fecha no es válida."
        }
      );
    }


    if (
      !/^\d{2}:\d{2}$/.test(
        horario
      )
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El horario no es válido."
        }
      );
    }


    if (
      !Number.isInteger(
        jugadores
      ) ||
      jugadores < 10
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "La reserva requiere un mínimo de 10 jugadores."
        }
      );
    }


    /* -----------------------------------------------
       PRECIOS
    ----------------------------------------------- */

    const precioPorJugador =
      Number(
        body.precio_por_jugador ??
        body.game_price ??
        29000
      );


    const total =
      Number(
        body.total ??
        precioPorJugador *
        jugadores
      );


    const senaRequerida =
      Number(
        body.sena_requerida ??
        body.deposit_amount ??
        50000
      );


    if (
      !Number.isFinite(
        precioPorJugador
      ) ||
      precioPorJugador < 0
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El precio no es válido."
        }
      );
    }


    if (
      !Number.isFinite(
        total
      ) ||
      total < 0
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El total no es válido."
        }
      );
    }


    if (
      !Number.isFinite(
        senaRequerida
      ) ||
      senaRequerida < 0
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "La seña no es válida."
        }
      );
    }


    /* -----------------------------------------------
       CREAR RESERVA
    ----------------------------------------------- */

    const reserva = {

      public_id:
        createPublicId(
          fecha,
          horario
        ),

      name:
        nombre,

      phone:
        whatsapp,

      booking_date:
        fecha,

      booking_time:
        horario,

      players:
        jugadores,

      notes:
        notas || null,

      deposit_amount:
        senaRequerida,

      game_price:
        precioPorJugador,

      status:
        "pending",

      payment_id:
        null,

      confirmed_at:
        null
    };


    const response =
      await fetch(
        `${baseUrl}/rest/v1/reservations`,
        {
          method: "POST",

          headers:
            supabaseHeaders(
              supabaseKey,
              "return=representation"
            ),

          body:
            JSON.stringify(
              reserva
            )
        }
      );


    const text =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(text);

    } catch {

      data = text;

    }


    /* -----------------------------------------------
       ERROR SUPABASE
    ----------------------------------------------- */

    if (!response.ok) {

      console.error(
        "ERROR REAL DE SUPABASE:",
        data
      );


      const duplicate =
        response.status === 409 ||
        String(
          data?.code || ""
        ) === "23505";


      return sendJson(
        res,
        duplicate
          ? 409
          : response.status,
        {
          ok: false,

          message:
            duplicate
              ? "Ese horario ya está reservado. Elegí otra fecha u horario."
              : data?.message ||
                data?.hint ||
                data?.details ||
                "Supabase rechazó la reserva.",

          error:
            data
        }
      );
    }


    /* -----------------------------------------------
       RESERVA CREADA
    ----------------------------------------------- */

    const reservaCreada =
      Array.isArray(data)
        ? data[0]
        : data;


   
    /* -----------------------------------------------
       RESPUESTA FINAL
    ----------------------------------------------- */

    return sendJson(
      res,
      201,
      {
        ok: true,

        message:
          "Reserva guardada correctamente.",

        reserva:
          reservaCreada,

        public_id:
          reservaCreada?.public_id ||
          null
      }
    );


  } catch (error) {

    console.error(
      "ERROR GENERAL RESERVATIONS:",
      error
    );


    return sendJson(
      res,
      500,
      {
        ok: false,

        message:
          error?.message ||
          "Error interno al procesar la reserva."
      }
    );
  }
}
