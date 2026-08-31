/* =====================================================
   AGUARÁ PAINTBALL
   API UPLOAD RECEIPT
   SUPABASE + TELEGRAM
===================================================== */

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

function getExtension(fileName, contentType) {
  const name = String(fileName || "").toLowerCase();

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return ".jpg";
  }

  if (name.endsWith(".png")) {
    return ".png";
  }

  if (name.endsWith(".webp")) {
    return ".webp";
  }

  if (name.endsWith(".pdf")) {
    return ".pdf";
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
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("FALTAN VARIABLES DE TELEGRAM");
    return false;
  }

  const precio = Number(reserva.game_price || 0);
  const jugadores = Number(reserva.players || 0);
  const sena = Number(reserva.deposit_amount || 0);
  const total = precio * jugadores;

  const mensaje = [
    "💰 COMPROBANTE DE PAGO RECIBIDO",
    "",
    "🎯 AGUARÁ PAINTBALL",
    "",
    "👤 Nombre: " + (reserva.name || ""),
    "📱 WhatsApp: " + (reserva.phone || ""),
    "",
    "📅 Fecha: " + (reserva.booking_date || ""),
    "🕐 Horario: " + (reserva.booking_time || ""),
    "",
    "👥 Jugadores: " + jugadores,
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
    const response = await fetch(
      "https://api.telegram.org/bot" +
      botToken +
      "/sendMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("ERROR TELEGRAM:", data);
      return false;
    }

    console.log(
      "AVISO TELEGRAM ENVIADO CORRECTAMENTE"
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
    res.setHeader("Allow", "POST");

    return sendJson(res, 405, {
      ok: false,
      message: "Método no permitido."
    });
  }

  const config = getSupabaseConfig();

  if (!config) {
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

  try {

    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    const publicId =
      String(body.public_id || "").trim();

    const fileName =
      String(body.file_name || "comprobante").trim();

    const contentType =
      String(body.content_type || "").trim();

    const fileBase64 =
      String(body.file_base64 || "").trim();


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (!publicId) {
      return sendJson(res, 400, {
        ok: false,
        message:
          "Falta el identificador de la reserva."
      });
    }

    if (!fileBase64) {
      return sendJson(res, 400, {
        ok: false,
        message:
          "No se recibió el comprobante."
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];

    if (!allowedTypes.includes(contentType)) {
      return sendJson(res, 400, {
        ok: false,
        message:
          "Formato no permitido. Usá JPG, PNG, WEBP o PDF."
      });
    }


    /* =================================================
       DECODIFICAR ARCHIVO
    ================================================= */

    const fileBuffer =
      Buffer.from(fileBase64, "base64");

    const maxSize =
      3 * 1024 * 1024;

    if (fileBuffer.length === 0) {
      return sendJson(res, 400, {
        ok: false,
        message:
          "El comprobante está vacío o no es válido."
      });
    }

    if (fileBuffer.length > maxSize) {
      return sendJson(res, 400, {
        ok: false,
        message:
          "El comprobante no puede superar los 3 MB."
      });
    }


    /* =================================================
       BUSCAR RESERVA
    ================================================= */

    const reservationResponse =
      await fetch(
        baseUrl +
        "/rest/v1/reservations" +
        "?public_id=eq." +
        encodeURIComponent(publicId) +
        "&select=id,public_id,name,phone,booking_date,booking_time,players,game_price,deposit_amount,status",
        {
          method: "GET",
          headers:
            supabaseHeaders(supabaseKey)
        }
      );

    const reservationText =
      await reservationResponse.text();

    let reservations = [];

    try {
      reservations =
        JSON.parse(reservationText);
    } catch {
      reservations = [];
    }

    if (!reservationResponse.ok) {
      console.error(
        "ERROR BUSCANDO RESERVA:",
        reservationText
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          "No se pudo verificar la reserva."
      });
    }

    if (
      !Array.isArray(reservations) ||
      reservations.length === 0
    ) {
      return sendJson(res, 404, {
        ok: false,
        message:
          "No encontramos esa reserva."
      });
    }

    const reserva =
      reservations[0];


    /* =================================================
       CREAR RUTA
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
       SUBIR A STORAGE
    ================================================= */

    const uploadResponse =
      await fetch(
        baseUrl +
        "/storage/v1/object/comprobantes/" +
        storagePath,
        {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization:
              "Bearer " + supabaseKey,
            "Content-Type": contentType,
            "x-upsert": "false"
          },
          body: fileBuffer
        }
      );

    const uploadText =
      await uploadResponse.text();

    let uploadData;

    try {
      uploadData =
        JSON.parse(uploadText);
    } catch {
      uploadData =
        uploadText;
    }

    if (!uploadResponse.ok) {
      console.error(
        "ERROR SUBIENDO COMPROBANTE:",
        uploadData
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          "No se pudo guardar el comprobante en Supabase.",
        error: uploadData
      });
    }


    /* =================================================
       ACTUALIZAR RESERVA
    ================================================= */

    const updateResponse =
      await fetch(
        baseUrl +
        "/rest/v1/reservations" +
        "?public_id=eq." +
        encodeURIComponent(publicId),
        {
          method: "PATCH",
          headers:
            supabaseHeaders(
              supabaseKey,
              "return=representation"
            ),
          body: JSON.stringify({
            payment_id: storagePath,
            status: "pending"
          })
        }
      );

    const updateText =
      await updateResponse.text();

    let updateData;

    try {
      updateData =
        JSON.parse(updateText);
    } catch {
      updateData =
        updateText;
    }

    if (!updateResponse.ok) {
      console.error(
        "ERROR ACTUALIZANDO RESERVA:",
        updateData
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          "El comprobante se guardó, pero no pudimos asociarlo a la reserva.",
        error: updateData
      });
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
       RESPUESTA
    ================================================= */

    return sendJson(res, 200, {
      ok: true,
      message:
        "Comprobante recibido correctamente. Aguará revisará el pago y confirmará tu turno.",
      public_id: publicId,
      comprobante: storagePath,
      telegram: telegramEnviado
    });

  } catch (error) {

    console.error(
      "ERROR GENERAL UPLOAD RECEIPT:",
      error
    );

    return sendJson(res, 500, {
      ok: false,
      message:
        error?.message ||
        "Error interno al recibir el comprobante."
    });
  }
}
