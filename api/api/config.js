```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   API CONFIG
   GET + POST

   Guarda la configuración del negocio en Supabase.

   Variables de Vercel necesarias:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
===================================================== */

const DEFAULT_CONFIG = {

  gamePrice: 29000,

  shotsText:
    "100 TIROS INCLUIDOS",

  hydrogelPrice: 25000,

  hydrogelShotsText:
    "MUNICIÓN INCLUIDA",

  deposit: 50000,

  minPlayers: 10,

  whatsapp:
    "5493794250285",

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
    .setHeader(
      "Content-Type",
      "application/json"
    )
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


  if (!supabaseUrl) {

    throw new Error(
      "Falta la variable SUPABASE_URL."
    );

  }


  if (!serviceRoleKey) {

    throw new Error(
      "Falta la variable SUPABASE_SERVICE_ROLE_KEY."
    );

  }


  return {
    supabaseUrl:
      supabaseUrl.replace(/\/$/, ""),

    serviceRoleKey
  };

}


/* =====================================================
   PETICIÓN A SUPABASE
===================================================== */

async function supabaseFetch(
  path,
  options = {}
) {

  const {
    supabaseUrl,
    serviceRoleKey
  } =
    getSupabaseConfig();


  const headers = {

    apikey:
      serviceRoleKey,

    Authorization:
      `Bearer ${serviceRoleKey}`,

    "Content-Type":
      "application/json",

    Accept:
      "application/json",

    ...(options.headers || {})

  };


  return fetch(
    `${supabaseUrl}${path}`,
    {
      ...options,
      headers
    }
  );

}


/* =====================================================
   NORMALIZAR CONFIGURACIÓN
===================================================== */

function normalizeConfig(row) {

  if (!row) {

    return {
      ...DEFAULT_CONFIG
    };

  }


  return {

    gamePrice:
      Number(
        row.game_price
      ) || 0,


    shotsText:
      String(
        row.shots_text ??
        DEFAULT_CONFIG.shotsText
      ),


    hydrogelPrice:
      Number(
        row.hydrogel_price
      ) || 0,


    hydrogelShotsText:
      String(
        row.hydrogel_shots_text ??
        DEFAULT_CONFIG.hydrogelShotsText
      ),


    deposit:
      Number(
        row.deposit
      ) || 0,


    minPlayers:
      Number(
        row.min_players
      ) || 1,


    whatsapp:
      String(
        row.whatsapp ??
        DEFAULT_CONFIG.whatsapp
      ),


    slots:
      Array.isArray(
        row.slots
      )
        ? row.slots
        : [
            ...DEFAULT_CONFIG.slots
          ]

  };

}


/* =====================================================
   VALIDAR CONFIGURACIÓN
===================================================== */

function validateConfig(config) {

  if (
    !config ||
    typeof config !== "object"
  ) {

    return "Configuración inválida.";

  }


  const gamePrice =
    Number(
      config.gamePrice
    );


  if (
    !Number.isFinite(gamePrice) ||
    gamePrice < 0
  ) {

    return "El precio de Paintball no es válido.";

  }


  const hydrogelPrice =
    Number(
      config.hydrogelPrice
    );


  if (
    !Number.isFinite(hydrogelPrice) ||
    hydrogelPrice < 0
  ) {

    return "El precio de Hidrogel no es válido.";

  }


  const deposit =
    Number(
      config.deposit
    );


  if (
    !Number.isFinite(deposit) ||
    deposit < 0
  ) {

    return "La seña no es válida.";

  }


  const minPlayers =
    Number(
      config.minPlayers
    );


  if (
    !Number.isInteger(minPlayers) ||
    minPlayers < 1
  ) {

    return "El mínimo de jugadores no es válido.";

  }


  if (
    !Array.isArray(
      config.slots
    ) ||
    !config.slots.length
  ) {

    return "Debe existir al menos un horario.";

  }


  return null;

}


/* =====================================================
   GET
   OBTENER CONFIGURACIÓN
===================================================== */

async function getConfig(res) {

  try {

    const response =
      await supabaseFetch(
        "/rest/v1/aguara_config" +
        "?id=eq.1" +
        "&select=*",
        {
          method: "GET"
        }
      );


    const text =
      await response.text();


    console.log(
      "SUPABASE GET CONFIG:",
      response.status,
      text
    );


    if (!response.ok) {

      return sendJson(
        res,
        500,
        {
          ok: false,

          message:
            "Supabase no pudo cargar la configuración.",

          details:
            text
        }
      );

    }


    let rows = [];


    try {

      rows =
        JSON.parse(text);

    } catch {

      rows = [];

    }


    /*
       Si todavía no existe la fila,
       la creamos automáticamente.
    */

    if (
      !Array.isArray(rows) ||
      !rows.length
    ) {

      const created =
        await createDefaultConfig();


      if (!created.ok) {

        return sendJson(
          res,
          500,
          {
            ok: false,

            message:
              "No existe configuración y no se pudo crear la configuración inicial.",

            details:
              created.details
          }
        );

      }


      return sendJson(
        res,
        200,
        {
          ok: true,

          config:
            normalizeConfig(
              created.row
            )
        }
      );

    }


    return sendJson(
      res,
      200,
      {
        ok: true,

        config:
          normalizeConfig(
            rows[0]
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
          error.message ||
          "Error cargando configuración."
      }
    );

  }

}


/* =====================================================
   CREAR CONFIGURACIÓN INICIAL
===================================================== */

async function createDefaultConfig() {

  try {

    const row = {

      id: 1,

      game_price:
        DEFAULT_CONFIG.gamePrice,

      shots_text:
        DEFAULT_CONFIG.shotsText,

      hydrogel_price:
        DEFAULT_CONFIG.hydrogelPrice,

      hydrogel_shots_text:
        DEFAULT_CONFIG.hydrogelShotsText,

      deposit:
        DEFAULT_CONFIG.deposit,

      min_players:
        DEFAULT_CONFIG.minPlayers,

      whatsapp:
        DEFAULT_CONFIG.whatsapp,

      slots:
        DEFAULT_CONFIG.slots

    };


    const response =
      await supabaseFetch(
        "/rest/v1/aguara_config",
        {
          method: "POST",

          headers: {

            Prefer:
              "return=representation"

          },

          body:
            JSON.stringify(row)

        }
      );


    const text =
      await response.text();


    console.log(
      "SUPABASE CREATE CONFIG:",
      response.status,
      text
    );


    if (!response.ok) {

      return {

        ok: false,

        details:
          text

      };

    }


    let rows = [];


    try {

      rows =
        JSON.parse(text);

    } catch {

      rows = [];

    }


    return {

      ok: true,

      row:
        rows[0] ||
        row

    };


  } catch (error) {

    console.error(
      "ERROR CREANDO CONFIG:",
      error
    );


    return {

      ok: false,

      details:
        error.message

    };

  }

}


/* =====================================================
   POST
   GUARDAR CONFIGURACIÓN
===================================================== */

async function saveConfig(
  req,
  res
) {

  try {

    const config =
      req.body;


    const validationError =
      validateConfig(
        config
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


    const row = {

      id: 1,

      game_price:
        Number(
          config.gamePrice
        ),

      shots_text:
        String(
          config.shotsText ??
          ""
        ).trim(),

      hydrogel_price:
        Number(
          config.hydrogelPrice
        ),

      hydrogel_shots_text:
        String(
          config.hydrogelShotsText ??
          ""
        ).trim(),

      deposit:
        Number(
          config.deposit
        ),

      min_players:
        Number(
          config.minPlayers
        ),

      whatsapp:
        String(
          config.whatsapp ??
          ""
        ).replace(
          /\D/g,
          ""
        ),

      slots:
        config.slots
          .map(
            function (slot) {

              return String(
                slot
              ).trim();

            }
          )
          .filter(Boolean)

    };


    /*
       UPSERT:
       Si id=1 existe → actualiza.
       Si no existe → crea.
    */

    const response =
      await supabaseFetch(
        "/rest/v1/aguara_config?on_conflict=id",
        {
          method: "POST",

          headers: {

            Prefer:
              "resolution=merge-duplicates,return=representation"

          },

          body:
            JSON.stringify(row)

        }
      );


    const text =
      await response.text();


    console.log(
      "SUPABASE SAVE CONFIG:",
      response.status,
      text
    );


    if (!response.ok) {

      return sendJson(
        res,
        500,
        {
          ok: false,

          message:
            "Supabase rechazó la configuración.",

          details:
            text
        }
      );

    }


    let rows = [];


    try {

      rows =
        JSON.parse(text);

    } catch {

      rows = [];

    }


    const savedRow =
      rows[0] ||
      row;


    return sendJson(
      res,
      200,
      {
        ok: true,

        message:
          "Configuración guardada correctamente.",

        config:
          normalizeConfig(
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
          error.message ||
          "Error guardando configuración."
      }
    );

  }

}


/* =====================================================
   HANDLER PRINCIPAL
===================================================== */

export default async function handler(
  req,
  res
) {

  /*
     GET
     /api/config
  */

  if (
    req.method === "GET"
  ) {

    return getConfig(
      res
    );

  }


  /*
     POST
     /api/config
  */

  if (
    req.method === "POST"
  ) {

    return saveConfig(
      req,
      res
    );

  }


  /*
     MÉTODO NO PERMITIDO
  */

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
```
