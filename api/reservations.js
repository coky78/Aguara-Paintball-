```javascript
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

  return res
    .status(status)
    .json(payload);

}


/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

function getSupabaseConfig() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {

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

function supabaseHeaders(
  key,
  prefer
) {

  return {

    apikey:
      key,

    Authorization:
      `Bearer ${key}`,

    "Content-Type":
      "application/json",

    ...(prefer
      ? {
          Prefer:
            prefer
        }
      : {})

  };

}


/* =====================================================
   ID PÚBLICO
===================================================== */

function createPublicId(
  fecha,
  horario
) {

  const compactDate =
    fecha.replaceAll(
      "-",
      ""
    );

  const compactTime =
    horario.replaceAll(
      ":",
      ""
    );

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

export default async function handler(
  req,
  res
) {

  /*
     MÉTODOS PERMITIDOS
  */

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
          "Método no permitido"
      }
    );

  }


  /*
     SUPABASE
  */

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
    supabaseUrl.replace(
      /\/$/,
      ""
    );


  /* ===================================================
     GET — LISTAR RESERVAS
  =================================================== */

  if (req.method === "GET") {

    try {

      const response =
        await fetch(
          `${baseUrl}/rest/v1/reservations` +
          `?select=*` +
          `&order=booking_date.asc,booking_time.asc`,
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
          data
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


      /*
         ID DE LA RESERVA
      */

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


      /*
         DATOS NUEVOS
      */

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


      /*
         VALIDAR NOMBRE
      */

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


      /*
         VALIDAR WHATSAPP
      */

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


      /*
         VALIDAR FECHA
      */

      if (
        !/^\d{4}-\d{2}-\d{2}$/
          .test(fecha)
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


      /*
         VALIDAR HORARIO
      */

      if (
        !/^\d{2}:\d{2}$/
          .test(horario)
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


      /*
         VALIDAR JUGADORES
      */

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


      /*
         COMPROBAR SI EL NUEVO
         HORARIO YA ESTÁ OCUPADO
      */

      const duplicateResponse =
        await fetch(
          `${baseUrl}/rest/v1/reservations` +
          `?booking_date=eq.${encodeURIComponent(fecha)}` +
          `&booking_time=eq.${encodeURIComponent(horario)}` +
          `&public_id=neq.${encodeURIComponent(publicId)}` +
          `&select=public_id`,
          {
            method: "GET",

            headers:
              supabaseHeaders(
                supabaseKey
              )
          }
        );


      const duplicateText =
        await duplicateResponse.text();


      let duplicateData = [];

      try {

        duplicateData =
          JSON.parse(
            duplicateText
          );

      } catch {

        duplicateData = [];

      }


      if (
        !duplicateResponse.ok
      ) {

        console.error(
          "ERROR COMPROBANDO HORARIO:",
          duplicateData
        );

        return sendJson(
          res,
          duplicateResponse.status,
          {
            ok: false,
            message:
              "No se pudo comprobar si el nuevo horario está disponible.",
            error:
              duplicateData
          }
        );

      }


      if (
        Array.isArray(
          duplicateData
        ) &&
        duplicateData.length > 0
      ) {

        return sendJson(
          res,
          409,
          {
            ok: false,
            message:
              "Ese horario ya está reservado. Elegí otra fecha u horario."
          }
        );

      }


      /*
         ACTUALIZAR
      */

      const updateData = {

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
          notas || null

      };


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
              JSON.stringify(
                updateData
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
              "No se pudo modificar la reserva.",

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
            "Reserva modificada correctamente.",

          reserva:
            data[0]
        }
      );


    } catch (error) {

      console.error(
        "ERROR GENERAL EDITANDO RESERVA:",
        error
      );

      return sendJson(
        res,
        500,
        {
          ok: false,

          message:
            error?.message ||
            "Error interno al modificar la reserva."
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


      /*
         ELIMINAR POR PUBLIC_ID
      */

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
        "ERROR GENERAL ELIMINANDO RESERVA:",
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
      !/^\d{4}-\d{2}-\d{2}$/
        .test(fecha)
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
      !/^\d{2}:\d{2}$/
        .test(horario)
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


    /* -----------------------------------------------
       INSERTAR EN SUPABASE
    ----------------------------------------------- */

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
              : (
                  data?.message ||
                  data?.hint ||
                  data?.details ||
                  "Supabase rechazó la reserva."
                ),

          error:
            data

        }
      );

    }


    /* -----------------------------------------------
       RESPUESTA OK
    ----------------------------------------------- */

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
```
