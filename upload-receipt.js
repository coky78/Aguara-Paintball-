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

function supabaseHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra
  };
}

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

    console.error("FALTAN VARIABLES DE SUPABASE");

    return sendJson(res, 500, {
      ok: false,
      message:
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel."
    });
  }

  try {

    const { supabaseUrl, supabaseKey } = config;

    const baseUrl =
      supabaseUrl.replace(/\/$/, "");

    /*
      El comprobante llegará como base64
      desde la página.
    */

    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    const publicId =
      String(body.public_id || "").trim();

    const fileName =
      String(body.file_name || "").trim();

    const contentType =
      String(body.content_type || "").trim();

    const fileBase64 =
      String(body.file_base64 || "").trim();


    if (!publicId) {

      return sendJson(res, 400, {
        ok: false,
        message: "Falta identificar la reserva."
      });
    }


    if (!fileName) {

      return sendJson(res, 400, {
        ok: false,
        message: "Falta el nombre del archivo."
      });
    }


    if (!contentType) {

      return sendJson(res, 400, {
        ok: false,
        message: "Falta el tipo de archivo."
      });
    }


    if (!fileBase64) {

      return sendJson(res, 400, {
        ok: false,
        message: "No se recibió el comprobante."
      });
    }


    /*
      Permitimos solamente imágenes y PDF.
    */

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];


    if (!tiposPermitidos.includes(contentType)) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "Formato no permitido. Subí JPG, PNG, WEBP o PDF."
      });
    }


    /*
      Limitar tamaño aproximado a 5 MB.
    */

    const buffer =
      Buffer.from(fileBase64, "base64");


    if (buffer.length > 5 * 1024 * 1024) {

      return sendJson(res, 400, {
        ok: false,
        message:
          "El comprobante no puede superar los 5 MB."
      });
    }


    /*
      Buscar la reserva.
    */

    const reservationResponse =
      await fetch(
        `${baseUrl}/rest/v1/reservations?select=id,public_id,status,receipt_url&public_id=eq.${encodeURIComponent(publicId)}&limit=1`,
        {
          method: "GET",
          headers:
            supabaseHeaders(
              supabaseKey,
              {
                "Content-Type":
                  "application/json"
              }
            )
        }
      );


    const reservationText =
      await reservationResponse.text();


    let reservationData;

    try {

      reservationData =
        JSON.parse(reservationText);

    } catch {

      reservationData = [];

    }


    if (
      !reservationResponse.ok ||
      !Array.isArray(reservationData) ||
      !reservationData.length
    ) {

      return sendJson(res, 404, {
        ok: false,
        message:
          "No encontramos la reserva indicada."
      });
    }


    const reservation =
      reservationData[0];


    /*
      No permitir comprobantes
      para reservas ya confirmadas.
    */

    if (reservation.status === "confirmed") {

      return sendJson(res, 400, {
        ok: false,
        message:
          "Esta reserva ya está confirmada."
      });
    }


    /*
      Generar nombre seguro.
    */

    const extension =
      contentType === "application/pdf"
        ? "pdf"
        : contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
            ? "webp"
            : "jpg";


    const random =
      randomBytes(8).toString("hex");


    const storagePath =
      `${publicId}/${Date.now()}-${random}.${extension}`;


    /*
      Subir archivo a Supabase Storage.
    */

    const uploadResponse =
      await fetch(
        `${baseUrl}/storage/v1/object/receipts/${storagePath}`,
        {
          method: "POST",

          headers:
            supabaseHeaders(
              supabaseKey,
              {
                "Content-Type":
                  contentType,

                "x-upsert":
                  "false"
              }
            ),

          body: buffer
        }
      );


    const uploadText =
      await uploadResponse.text();


    if (!uploadResponse.ok) {

      console.error(
        "ERROR SUBIENDO COMPROBANTE:",
        uploadText
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          "No se pudo guardar el comprobante."
      });
    }


    /*
      Crear URL pública del archivo.
      El bucket deberá ser público.
    */

    const receiptUrl =
      `${baseUrl}/storage/v1/object/public/receipts/${storagePath}`;


    /*
      Guardar URL y fecha en la reserva.
    */

    const updateResponse =
      await fetch(
        `${baseUrl}/rest/v1/reservations?public_id=eq.${encodeURIComponent(publicId)}`,
        {
          method: "PATCH",

          headers:
            supabaseHeaders(
              supabaseKey,
              {
                "Content-Type":
                  "application/json",

                Prefer:
                  "return=representation"
              }
            ),

          body: JSON.stringify({
            receipt_url:
              receiptUrl,

            receipt_uploaded_at:
              new Date().toISOString(),

            status:
              "receipt_received"
          })
        }
      );


    const updateText =
      await updateResponse.text();


    if (!updateResponse.ok) {

      console.error(
        "ERROR ACTUALIZANDO RESERVA:",
        updateText
      );

      return sendJson(res, 500, {
        ok: false,
        message:
          "El comprobante se guardó, pero no pudimos actualizar la reserva."
      });
    }


    return sendJson(res, 200, {

      ok: true,

      message:
        "Comprobante recibido correctamente.",

      public_id:
        publicId,

      receipt_url:
        receiptUrl

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
