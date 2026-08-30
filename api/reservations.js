/* =====================================================
   AGUARÁ PAINTBALL
   API RESERVATIONS
   GET + POST + PATCH + DELETE
===================================================== */

import { randomBytes } from "node:crypto";


/* =====================================================
   RESPUESTA JSON
===================================================== */

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}


/* =====================================================
   SUPABASE
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


function supabaseHeaders(key, prefer) {

  return {
    apikey: key,

    Authorization:
      `Bearer ${key}`,

    "Content-Type":
      "application/json",

    ...(prefer
      ? { Prefer: prefer }
      : {})
  };
}


/* =====================================================
   PUBLIC ID
===================================================== */

function createPublicId(fecha, horario) {

  const compactDate =
    fecha.replaceAll("-", "");

  const compactTime =
    horario.replaceAll(":", "");

  const suffix =
    randomBytes(3)
      .toString("hex")
      .toUpperCase();


  return (
    `AG-${compactDate}-${compactTime}-${suffix}`
  );
}


/* =====================================================
   HANDLER
===================================================== */

export default async function handler(req, res) {

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


    return sendJson(res, 405, {
      ok: false,
      message: "Método no permitido"
    });
  }


  const config =
    getSupabaseConfig();


  if (!config) {

    console.error(
      "FALTAN VARIABLES DE SUPABASE"
    );


    return sendJson(res, 500, {
      ok: false,
      message:
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel."
    });
  }


  const {
    supabaseUrl,
    supabaseKey
  } = config;


  const baseUrl =
    supabaseUrl.replace(/\/$/, "");


  /* ===================================================
     GET
  =================================================== */

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
            error: data
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


  /* ===================================================
     PATCH — EDITAR RESERVA
  =================================================== */

  if (req.method === "PATCH") {

    try {

      const body =
        req.body &&
        typeof req.body === "object"
          ? req.body
          : {};


      const publicId =
        String(
          body.public_id ?? ""
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
         NOMBRE
      ----------------------------------------------- */

      if (
        body.name !== undefined ||
        body.nombre !== undefined
      ) {

        const name =
          String(
            body.name ??
            body.nombre ??
            ""
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


        update.name = name;
      }


      /* -----------------------------------------------
         WHATSAPP
      ----------------------------------------------- */

      if (
        body.phone !== undefined ||
        body.whatsapp !== undefined
      ) {

        const phone =
          String(
            body.phone ??
            body.whatsapp ??
            ""
          ).trim();


        if (!phone) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "El WhatsApp no puede estar vacío."
            }
          );
        }


        update.phone = phone;
      }


      /* -----------------------------------------------
         FECHA
      ----------------------------------------------- */

      if (
        body.booking_date !== undefined ||
        body.fecha !== undefined
      ) {

        const fecha =
          String(
            body.booking_date ??
            body.fecha ??
            ""
          ).trim();


        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
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
          fecha;
      }


      /* -----------------------------------------------
         HORARIO
      ----------------------------------------------- */

      if (
        body.booking_time !== undefined ||
        body.horario !== undefined
      ) {

        const horario =
          String(
            body.booking_time ??
            body.horario ??
            ""
          ).trim();


        if (
          !/^\d{2}:\d{2}$/.test(horario)
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
          horario;
      }


      /* -----------------------------------------------
         JUGADORES
      ----------------------------------------------- */

      if (
        body.players !== undefined ||
        body.jugadores !== undefined
      ) {

        const players =
          Number(
            body.players ??
            body.jugadores
          );


        if (
          !Number.isInteger(players) ||
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


      /* -----------------------------------------------
         OBSERVACIONES
      ----------------------------------------------- */

      if (
        body.notes !== undefined ||
        body.observaciones !== undefined
      ) {

        const notes =
          String(
            body.notes ??
            body.observaciones ??
            ""
          ).trim();


        update.notes =
          notes || null;
      }


      /* -----------------------------------------------
         ESTADO
      ----------------------------------------------- */

      if (body.status !== undefined) {

        const status =
          String(
            body.status
          ).trim();


        const allowedStatuses = [
          "pending",
          "confirmed"
        ];


        if (
          !allowedStatuses.includes(status)
        ) {

          return sendJson(
            res,
            400,
            {
              ok: false,
              message:
                "Estado de reserva no válido."
            }
          );
        }


        update.status =
          status;


        if (status === "confirmed") {

          update.confirmed_at =
            new Date().toISOString();

        } else {

          update.confirmed_at =
            null;
        }
      }


      /* -----------------------------------------------
         SEÑA
      ----------------------------------------------- */

      if (
        body.deposit_amount !== undefined ||
        body.sena_requerida !== undefined
      ) {

        const deposit =
          Number(
            body.deposit_amount ??
            body.sena_requerida
          );


        if (
          !Number.isFinite(deposit) ||
          deposit < 0
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


        update.deposit_amount =
          deposit;
      }


      /* -----------------------------------------------
         PRECIO
      ----------------------------------------------- */

      if (
        body.game_price !== undefined ||
        body.precio_por_jugador !== undefined
      ) {

        const price =
          Number(
            body.game_price ??
            body.precio_por_jugador
          );


        if (
          !Number.isFinite(price) ||
          price < 0
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


        update.game_price =
          price;
      }


      /* -----------------------------------------------
         PAYMENT ID
      ----------------------------------------------- */

      if (
        body.payment_id !== undefined
      ) {

        update.payment_id =
          body.payment_id || null;
      }


      /* -----------------------------------------------
         EVITAR PATCH VACÍO
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
          `${baseUrl}/rest/v1/reservations` +
          `?public_id=eq.${encodeURIComponent(publicId)}`,
          {
            method: "PATCH",

            headers:
              supabaseHeaders(
                supabaseKey,
                "return=representation"
              ),

            body:
              JSON.stringify(update)
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
          "ERROR EDITANDO RESERVA:",
          data
        );


        const duplicate =
          response.status === 409 ||
          String(data?.code || "") === "23505";


        return sendJson(
          res,
          duplicate
            ? 409
            : response.status,
          {
            ok: false,

            message:
              duplicate
                ? "Ese horario ya está reservado. Elegí otro."
                : data?.message ||
                  data?.hint ||
                  data?.details ||
                  "No se pudo editar la reserva.",

            error: data
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
            "Error interno al editar la reserva."
        }
      );
    }
  }


  /* ===================================================
     DELETE — ELIMINAR RESERVA
  =================================================== */

  if (req.method === "DELETE") {

    try {

      const body =
        req.body &&
        typeof req.body === "object"
          ? req.body
          : {};


      let publicId =
        String(
          body.public_id ?? ""
        ).trim();


      /* Permite también ?public_id= */
      if (!publicId && req.query) {

        publicId =
          String(
            req.query.public_id ?? ""
          ).trim();
      }


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
          `${baseUrl}/rest/v1/reservations` +
          `?public_id=eq.${encodeURIComponent(publicId)}`,
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

            error: data
          }
        );
      }


      if (
        Array.isArray(data) &&
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
            Array.isArray(data)
              ? data[0]
              : data
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
            "Error interno al eliminar la reserva."
        }
      );
    }
  }


  /* ===================================================
     POST — CREAR RESERVA
  =================================================== */

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
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
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
      !/^\d{2}:\d{2}$/.test(horario)
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
      !Number.isInteger(jugadores) ||
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


    const precioPorJugador =
      Number(
        body.precio_por_jugador ??
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
        50000
      );


    if (
      !Number.isFinite(precioPorJugador) ||
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
      !Number.isFinite(total) ||
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
      !Number.isFinite(senaRequerida) ||
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
            JSON.stringify(reserva)
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
        "ERROR REAL DE SUPABASE:",
        data
      );


      const duplicate =
        response.status === 409 ||
        String(data?.code || "") === "23505";


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

          error: data
        }
      );
    }


    return sendJson(
      res,
      201,
      {
        ok: true,

        message:
          "Reserva guardada correctamente.",

        reserva:
          Array.isArray(data)
            ? data[0]
            : data
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
