/* =====================================================
   AGUARÁ PAINTBALL
   API RESERVATIONS
   GET + POST + PATCH + DELETE
===================================================== */

import { randomBytes } from "node:crypto";

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {})
  };
}

function createPublicId(fecha, horario) {
  const compactDate = fecha.replaceAll("-", "");
  const compactTime = horario.replaceAll(":", "");
  const suffix = randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `AG-${compactDate}-${compactTime}-${suffix}`;
}

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

  const config = getSupabaseConfig();

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


  /* =====================================================
     GET — LISTAR RESERVAS
  ===================================================== */

  if (req.method === "GET") {

    try {

      const response = await fetch(
        `${baseUrl}/rest/v1/reservations?select=*&order=booking_date.asc,booking_time.asc`,
        {
          method: "GET",
          headers: supabaseHeaders(
            supabaseKey
          )
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

      return sendJson(res, 200, {
        ok: true,
        reservas:
          Array.isArray(data)
            ? data
            : []
      });

    } catch (error) {

      console.error(
        "ERROR GET RESERVATIONS:",
        error
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          error?.message ||
          "Error consultando reservas."
      });
    }
  }


  /* =====================================================
     PATCH — EDITAR / CONFIRMAR RESERVA
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
          body.public_id ?? ""
        ).trim();

      if (!publicId) {

        return sendJson(res, 400, {
          ok: false,
          message:
            "Falta el identificador de la reserva."
        });
      }


      /*
        Permitimos editar los campos
        enviados por el panel.
      */

      const updates = {};

      if (
        body.name !== undefined ||
        body.nombre !== undefined
      ) {
        updates.name =
          String(
            body.name ??
            body.nombre ??
            ""
          ).trim();
      }

      if (
        body.phone !== undefined ||
        body.whatsapp !== undefined
      ) {
        updates.phone =
          String(
            body.phone ??
            body.whatsapp ??
            ""
          ).trim();
      }

      if (
        body.booking_date !== undefined ||
        body.fecha !== undefined
      ) {
        updates.booking_date =
          String(
            body.booking_date ??
            body.fecha ??
            ""
          ).trim();
      }

      if (
        body.booking_time !== undefined ||
        body.horario !== undefined
      ) {
        updates.booking_time =
          String(
            body.booking_time ??
            body.horario ??
            ""
          ).trim();
      }

      if (
        body.players !== undefined ||
        body.jugadores !== undefined
      ) {
        updates.players =
          Number(
            body.players ??
            body.jugadores
          );
      }

      if (
        body.notes !== undefined ||
        body.notas !== undefined
      ) {
        updates.notes =
          String(
            body.notes ??
            body.notas ??
            ""
          ).trim() || null;
      }

      if (
        body.status !== undefined
      ) {
        const status =
          String(
            body.status
          ).trim();

        const allowedStatuses = [
          "pending",
          "confirmed",
          "cancelled"
        ];

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return sendJson(res, 400, {
            ok: false,
            message:
              "Estado de reserva no válido."
          });
        }

        updates.status =
          status;

        if (
          status === "confirmed"
        ) {
          updates.confirmed_at =
            new Date().toISOString();
        }

        if (
          status !== "confirmed"
        ) {
          updates.confirmed_at =
            null;
        }
      }


      if (
        body.deposit_amount !== undefined ||
        body.sena_requerida !== undefined
      ) {
        updates.deposit_amount =
          Number(
            body.deposit_amount ??
            body.sena_requerida
          );
      }


      if (
        body.game_price !== undefined ||
        body.precio_por_jugador !== undefined
      ) {
        updates.game_price =
          Number(
            body.game_price ??
            body.precio_por_jugador
          );
      }


      if (
        !Object.keys(updates).length
      ) {

        return sendJson(res, 400, {
          ok: false,
          message:
            "No hay datos para actualizar."
        });
      }


      const response = await fetch(
        `${baseUrl}/rest/v1/reservations` +
        `?public_id=eq.${encodeURIComponent(publicId)}`,
        {
          method: "PATCH",

          headers: supabaseHeaders(
            supabaseKey,
            "return=representation"
          ),

          body:
            JSON.stringify(updates)
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
            error: data
          }
        );
      }


      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        return sendJson(res, 404, {
          ok: false,
          message:
            "No encontramos esa reserva."
        });
      }


      return sendJson(res, 200, {
        ok: true,
        message:
          "Reserva actualizada correctamente.",
        reserva: data[0]
      });

    } catch (error) {

      console.error(
        "ERROR GENERAL PATCH:",
        error
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          error?.message ||
          "Error interno al actualizar la reserva."
      });
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
          body.public_id ?? ""
        ).trim();


      if (!publicId) {

        return sendJson(res, 400, {
          ok: false,
          message:
            "Falta el identificador de la reserva."
        });
      }


      const response = await fetch(
        `${baseUrl}/rest/v1/reservations` +
        `?public_id=eq.${encodeURIComponent(publicId)}`,
        {
          method: "DELETE",

          headers: supabaseHeaders(
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
        !Array.isArray(data) ||
        data.length === 0
      ) {

        return sendJson(res, 404, {
          ok: false,
          message:
            "No encontramos esa reserva."
        });
      }


      return sendJson(res, 200, {
        ok: true,
        message:
          "Reserva eliminada correctamente.",
        reserva: data[0]
      });

    } catch (error) {

      console.error(
        "ERROR GENERAL DELETE:",
        error
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          error?.message ||
          "Error interno al eliminar la reserva."
      });
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


    if (!nombre) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "Falta el nombre."
      });
    }


    if (!whatsapp) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "Falta el número de WhatsApp."
      });
    }


    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        fecha
      )
    ) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "La fecha no es válida."
      });
    }


    if (
      !/^\d{2}:\d{2}$/.test(
        horario
      )
    ) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "El horario no es válido."
      });
    }


    if (
      !Number.isInteger(
        jugadores
      ) ||
      jugadores < 10
    ) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "La reserva requiere un mínimo de 10 jugadores."
      });
    }


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

      return sendJson(res, 400, {
        ok: false,
        message:
          "El precio no es válido."
      });
    }


    if (
      !Number.isFinite(total) ||
      total < 0
    ) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "El total no es válido."
      });
    }


    if (
      !Number.isFinite(
        senaRequerida
      ) ||
      senaRequerida < 0
    ) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "La seña no es válida."
      });
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


    return sendJson(res, 201, {

      ok: true,

      message:
        "Reserva guardada correctamente.",

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

    return sendJson(res, 500, {

      ok: false,

      message:
        error?.message ||
        "Error interno al procesar la reserva."

    });
  }
}
