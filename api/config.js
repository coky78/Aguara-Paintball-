/* =====================================================
   AGUARÁ PAINTBALL
   API CONFIG
   GET + POST

   Guarda la configuración del negocio en Supabase.

   Variables de Vercel:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY

   Tabla:
   public.aguara_config
===================================================== */

const DEFAULT_CONFIG = {
  gamePrice: 29000,
  shotsText: "100 TIROS INCLUIDOS",
  hydrogelPrice: 25000,
  hydrogelShotsText: "MUNICIÓN INCLUIDA",
  deposit: 50000,
  minPlayers: 10,
  whatsapp: "5493794250285",
  slots: [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00"
  ]
};


/* =====================================================
   RESPUESTA JSON
===================================================== */

function sendJson(res, status, payload) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json")
    .json(payload);
}


/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey
  };
}


/* =====================================================
   HEADERS SUPABASE
===================================================== */

function supabaseHeaders(key, prefer) {
  const headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  return headers;
}


/* =====================================================
   CONVERTIR SUPABASE → PANEL
===================================================== */

function mapFromDatabase(row) {
  if (!row) {
    return {
      ...DEFAULT_CONFIG
    };
  }

  return {
    gamePrice:
      Number.isFinite(Number(row.game_price))
        ? Number(row.game_price)
        : DEFAULT_CONFIG.gamePrice,

    shotsText:
      row.shots_text ??
      DEFAULT_CONFIG.shotsText,

    hydrogelPrice:
      Number.isFinite(Number(row.hydrogel_price))
        ? Number(row.hydrogel_price)
        : DEFAULT_CONFIG.hydrogelPrice,

    hydrogelShotsText:
      row.hydrogel_shots_text ??
      DEFAULT_CONFIG.hydrogelShotsText,

    deposit:
      Number.isFinite(Number(row.deposit))
        ? Number(row.deposit)
        : DEFAULT_CONFIG.deposit,

    minPlayers:
      Number.isFinite(Number(row.min_players))
        ? Number(row.min_players)
        : DEFAULT_CONFIG.minPlayers,

    whatsapp:
      row.whatsapp ??
      DEFAULT_CONFIG.whatsapp,

    slots:
      Array.isArray(row.slots) && row.slots.length
        ? row.slots
        : [...DEFAULT_CONFIG.slots]
  };
}


/* =====================================================
   CONVERTIR PANEL → SUPABASE
===================================================== */

function mapToDatabase(config) {
  return {
    id: 1,

    game_price:
      Number(config.gamePrice),

    shots_text:
      String(
        config.shotsText ?? ""
      ).trim(),

    hydrogel_price:
      Number(config.hydrogelPrice),

    hydrogel_shots_text:
      String(
        config.hydrogelShotsText ?? ""
      ).trim(),

    deposit:
      Number(config.deposit),

    min_players:
      Number(config.minPlayers),

    whatsapp:
      String(
        config.whatsapp ??
        ""
      ).replace(/\D/g, ""),

    slots:
      Array.isArray(config.slots)
        ? config.slots
            .map(function (slot) {
              return String(slot).trim();
            })
            .filter(Boolean)
        : [...DEFAULT_CONFIG.slots]
  };
}


/* =====================================================
   VALIDAR CONFIGURACIÓN
===================================================== */

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    return "Configuración inválida.";
  }

  const gamePrice =
    Number(config.gamePrice);

  const hydrogelPrice =
    Number(config.hydrogelPrice);

  const deposit =
    Number(config.deposit);

  const minPlayers =
    Number(config.minPlayers);

  if (
    !Number.isFinite(gamePrice) ||
    gamePrice < 0
  ) {
    return "El precio de Paintball no es válido.";
  }

  if (
    !Number.isFinite(hydrogelPrice) ||
    hydrogelPrice < 0
  ) {
    return "El precio de Hidrogel no es válido.";
  }

  if (
    !Number.isFinite(deposit) ||
    deposit < 0
  ) {
    return "La seña no es válida.";
  }

  if (
    !Number.isInteger(minPlayers) ||
    minPlayers < 1
  ) {
    return "El mínimo de jugadores no es válido.";
  }

  if (
    !Array.isArray(config.slots) ||
    !config.slots.length
  ) {
    return "Debe existir al menos un horario.";
  }

  return null;
}


/* =====================================================
   GET — LEER CONFIGURACIÓN
===================================================== */

async function getConfig(res) {
  const config =
    getSupabaseConfig();

  if (!config) {
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
    serviceRoleKey
  } = config;

  try {
    const response =
      await fetch(
        supabaseUrl +
        "/rest/v1/aguara_config?select=*&order=id.asc&limit=1",
        {
          method: "GET",
          headers:
            supabaseHeaders(
              serviceRoleKey
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
        "SUPABASE GET CONFIG ERROR:",
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
            "No se pudo leer la configuración de Supabase.",
          error: data
        }
      );
    }

    if (
      !Array.isArray(data) ||
      !data.length
    ) {
      return sendJson(
        res,
        200,
        {
          ok: true,
          config:
            { ...DEFAULT_CONFIG }
        }
      );
    }

    return sendJson(
      res,
      200,
      {
        ok: true,
        config:
          mapFromDatabase(
            data[0]
          )
      }
    );

  } catch (error) {
    console.error(
      "ERROR GET CONFIG:",
      error
    );

    return sendJson(
      res,
      500,
      {
        ok: false,
        message:
          error?.message ||
          "Error interno leyendo la configuración."
      }
    );
  }
}


/* =====================================================
   POST — GUARDAR CONFIGURACIÓN
===================================================== */

async function saveConfig(req, res) {
  const config =
    getSupabaseConfig();

  if (!config) {
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
    serviceRoleKey
  } = config;

  try {
    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    console.log(
      "CONFIG RECIBIDA DESDE ADMIN:",
      body
    );

    const configuration = {
      gamePrice:
        body.gamePrice ??
        body.game_price ??
        DEFAULT_CONFIG.gamePrice,

      shotsText:
        body.shotsText ??
        body.shots_text ??
        DEFAULT_CONFIG.shotsText,

      hydrogelPrice:
        body.hydrogelPrice ??
        body.hydrogel_price ??
        DEFAULT_CONFIG.hydrogelPrice,

      hydrogelShotsText:
        body.hydrogelShotsText ??
        body.hydrogel_shots_text ??
        DEFAULT_CONFIG.hydrogelShotsText,

      deposit:
        body.deposit ??
        DEFAULT_CONFIG.deposit,

      minPlayers:
        body.minPlayers ??
        body.min_players ??
        DEFAULT_CONFIG.minPlayers,

      whatsapp:
        body.whatsapp ??
        DEFAULT_CONFIG.whatsapp,

      slots:
        Array.isArray(body.slots)
          ? body.slots
          : [...DEFAULT_CONFIG.slots]
    };

    const validationError =
      validateConfig(
        configuration
      );

    if (validationError) {
      return sendJson(
        res,
        400,
        {
          ok: false,
          message:
            validationError
        }
      );
    }

    const databaseConfig =
      mapToDatabase(
        configuration
      );

    console.log(
      "CONFIGURACIÓN A GUARDAR:",
      databaseConfig
    );

    const response =
      await fetch(
        supabaseUrl +
        "/rest/v1/aguara_config?on_conflict=id",
        {
          method: "POST",

          headers:
            supabaseHeaders(
              serviceRoleKey,
              "resolution=merge-duplicates,return=representation"
            ),

          body:
            JSON.stringify(
              databaseConfig
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

    console.log(
      "SUPABASE SAVE CONFIG:",
      response.status,
      data
    );

    if (!response.ok) {
      return sendJson(
        res,
        response.status,
        {
          ok: false,
          message:
            data?.message ||
            data?.hint ||
            data?.details ||
            "Supabase rechazó la configuración.",
          error: data
        }
      );
    }

    const savedRow =
      Array.isArray(data)
        ? data[0]
        : data;

    return sendJson(
      res,
      200,
      {
        ok: true,
        message:
          "Configuración guardada correctamente en Supabase.",
        config:
          mapFromDatabase(
            savedRow
          )
      }
    );

  } catch (error) {
    console.error(
      "ERROR POST CONFIG:",
      error
    );

    return sendJson(
      res,
      500,
      {
        ok: false,
        message:
          error?.message ||
          "Error guardando configuración."
      }
    );
  }
}


/* =====================================================
   HANDLER PRINCIPAL
===================================================== */

export default async function handler(req, res) {

  if (
    req.method !== "GET" &&
    req.method !== "POST"
  ) {
    res.setHeader(
      "Allow",
      "GET, POST"
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

  if (
    req.method === "GET"
  ) {
    return getConfig(res);
  }

  if (
    req.method === "POST"
  ) {
    return saveConfig(
      req,
      res
    );
  }
}
