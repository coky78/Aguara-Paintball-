```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   API UPLOAD RECEIPT
   COMPROBANTES + TELEGRAM
===================================================== */

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}


/* =====================================================
   SUPABASE
===================================================== */

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
   EXTENSIÓN
===================================================== */

function getExtension(fileName, contentType) {
  const name = String(fileName || "").trim();
  const dot = name.lastIndexOf(".");

  if (dot >= 0) {
    return name.substring(dot).toLowerCase();
  }

  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf"
  };

  return extensions[contentType] || "";
}


/* =====================================================
   TELEGRAM
===================================================== */

async function enviarAvisoTelegram(reserva, comprobante) {

  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID;


  console.log(
    "TELEGRAM CONFIG:",
    {
      tokenConfigurado: !!botToken,
      chatConfigurado: !!chatId
    }
  );


  if (!botToken || !chatId) {

    console.error(
      "ERROR: FALTAN VARIABLES DE TELEGRAM"
    );

    return false;
  }


  const precio =
    Number(reserva.game_price || 0);

  const jugadores =
    Number(reserva.players || 0);

  const sena =
    Number(reserva.deposit_amount || 0);

  const total =
    precio * jugadores;


  const mensaje = [
    "💰 COMPROBANTE DE PAGO RECIBIDO",
    "",
    "🎯 AGUARÁ PAINTBALL",
    "",
    "👤 Nombre: " +
      (reserva.name || "No informado"),

    "📱 WhatsApp: " +
      (reserva.phone || "No informado"),

    "",
    "📅 Fecha: " +
      (reserva.booking_date || "No informada"),

    "🕐 Horario: " +
      (reserva.booking_time || "No informado"),

    "",
    "👥 Jugadores: " +
      jugadores,

    "",
    "💰 Precio por jugador: $" +
      precio.toLocaleString("es-AR"),

    "💵 Seña requerida: $" +
      sena.toLocaleString("es-AR"),

    "💳 Total estimado: $" +
      total.toLocaleString("es-AR"),

    "",
    "🆔 Reserva: " +
      (reserva.public_id || ""),

    "",
    "📎 Comprobante:",
    comprobante,

    "",
    "⚠️ ESTADO: PENDIENTE DE REVISIÓN"
  ].join("\n");


  try {

    const telegramUrl =
      "https://api.telegram.org/bot" +
      botToken +
      "/sendMessage";


    const response =
      await fetch(
        telegramUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              chat_id: chatId,
              text: mensaje
            })
        }
      );


    const responseText =
      await response.text();


    console.log(
      "RESPUESTA TELEGRAM:",
      response.status,
      responseText
    );


    if (!response.ok) {

      console.error(
        "TELEGRAM RECHAZÓ EL MENSAJE:",
        responseText
      );

      return false;
    }


    console.log(
      "✅ AVISO TELEGRAM ENVIADO CORRECTAMENTE"
    );


    return true;

  } catch (error) {

    console.error(
      "ERROR CONECTANDO CON TELEGRAM:",
      error
    );

    return false;
  }
}


/* =====================================================
   API
===================================================== */

export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader(
      "Allow",
      "POST"
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

    return sendJson(
      res,
      500,
      {
        ok: false,
        message:
          "Faltan las variables de Supabase en Vercel."
      }
    );
  }


  const baseUrl =
    config.supabaseUrl.replace(/\/$/, "");

  const supabaseKey =
    config.supabaseKey;


  try {

    /* =================================================
       DATOS
    ================================================= */

    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};


    const publicId =
      String(
        body.public_id || ""
      ).trim();


    const fileName =
      String(
        body.file_name || "comprobante"
      ).trim();


    const contentType =
      String(
        body.content_type || ""
      ).trim();


    const fileBase64 =
      String(
        body.file_base64 || ""
      ).trim();


    /* =================================================
       VALIDAR RESERVA
    ================================================= */

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


    /* =================================================
       VALIDAR ARCHIVO
    ================================================= */

    if (!fileBase64) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "No se recibió el comprobante."
        }
      );
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];


    if (
      !allowedTypes.includes(
        contentType
      )
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "Formato no permitido. Usá JPG, PNG, WEBP o PDF."
        }
      );
    }


    /* =================================================
       DECODIFICAR
    ================================================= */

    let fileBuffer;

    try {

      fileBuffer =
        Buffer.from(
          fileBase64,
          "base64"
        );

    } catch (error) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El comprobante no es válido."
        }
      );
    }


    if (
      !fileBuffer ||
      fileBuffer.length === 0
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El comprobante está vacío."
        }
      );
    }


    /* =================================================
       MÁXIMO 3 MB
    ================================================= */

    if (
      fileBuffer.length >
      3 * 1024 * 1024
    ) {

      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            "El comprobante no puede superar los 3 MB."
        }
      );
    }


    /* =================================================
       BUSCAR RESERVA
    ================================================= */

    const reservationUrl =
      baseUrl +
      "/rest/v1/reservations" +
      "?public_id=eq." +
      encodeURIComponent(publicId) +
      "&select=id,public_id,name,phone,booking_date,booking_time,players,game_price,deposit_amount,status";


    const reservationResponse =
      await fetch(
        reservationUrl,
        {
          method: "GET",

          headers:
            supabaseHeaders(
              supabaseKey
            )
        }
      );


    const reservationText =
      await reservationResponse.text();


    let reservations = [];


    try {

      reservations =
        JSON.parse(
          reservationText
        );

    } catch {

      reservations = [];
    }


    if (
      !reservationResponse.ok
    ) {

      console.error(
        "ERROR BUSCANDO RESERVA:",
        reservationText
      );

      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            "No se pudo verificar la reserva."
        }
      );
    }


    if (
      !Array.isArray(reservations) ||
      reservations.length === 0
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


    const reserva =
      reservations[0];


    /* =================================================
       RUTA STORAGE
    ================================================= */

    const extension =
      getExtension(
        fileName,
        contentType
      );


    const storagePath =
      publicId +
      "/" +
      Date.now() +
      "-comprobante" +
      extension;


    /* =================================================
       SUBIR COMPROBANTE
    ================================================= */

    const uploadUrl =
      baseUrl +
      "/storage/v1/object/comprobantes/" +
      storagePath;


    const uploadResponse =
      await fetch(
        uploadUrl,
        {
          method: "POST",

          headers: {
            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey,

            "Content-Type":
              contentType,

            "x-upsert":
              "false"
          },

          body:
            fileBuffer
        }
      );


    const uploadText =
      await uploadResponse.text();


    if (
      !uploadResponse.ok
    ) {

      console.error(
        "ERROR SUBIENDO COMPROBANTE:",
        uploadText
      );

      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            "No se pudo guardar el comprobante en Supabase.",
          error:
            uploadText
        }
      );
    }


    /* =================================================
       ACTUALIZAR RESERVA
    ================================================= */

    const updateUrl =
      baseUrl +
      "/rest/v1/reservations" +
      "?public_id=eq." +
      encodeURIComponent(publicId);


    const updateResponse =
      await fetch(
        updateUrl,
        {
          method: "PATCH",

          headers:
            supabaseHeaders(
              supabaseKey,
              "return=representation"
            ),

          body:
            JSON.stringify({
              payment_id:
                storagePath,

              status:
                "pending"
            })
        }
      );


    const updateText =
      await updateResponse.text();


    if (
      !updateResponse.ok
    ) {

      console.error(
        "ERROR ACTUALIZANDO RESERVA:",
        updateText
      );

      return sendJson(
        res,
        500,
        {
          ok: false,
          message:
            "El comprobante se guardó, pero no pudimos asociarlo a la reserva.",
          error:
            updateText
        }
      );
    }


    /* =================================================
       TELEGRAM
    ================================================= */

    const telegramEnviado =
      await enviarAvisoTelegram(
        reserva,
        storagePath
      );


    /* =================================================
       LOG
    ================================================= */

    console.log(
      "COMPROBANTE RECIBIDO CORRECTAMENTE",
      {
        publicId:
          publicId,

        nombre:
          reserva.name,

        telefono:
          reserva.phone,

        fecha:
          reserva.booking_date,

        horario:
          reserva.booking_time,

        archivo:
          storagePath,

        telegram:
          telegramEnviado
      }
    );


    /* =================================================
       RESPUESTA FINAL
    ================================================= */

    return sendJson(
      res,
      200,
      {
        ok: true,

        message:
          "Comprobante recibido correctamente. Aguará revisará el pago y confirmará tu turno.",

        public_id:
          publicId,

        comprobante:
          storagePath,

        telegram:
          telegramEnviado
      }
    );


  } catch (error) {

    console.error(
      "ERROR GENERAL UPLOAD RECEIPT:",
      error
    );

    return sendJson(
      res,
      500,
      {
        ok: false,

        message:
          "Error interno al recibir el comprobante.",

        error:
          error?.message ||
          String(error)
      }
    );
  }
}
```
