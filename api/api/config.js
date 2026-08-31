```javascript
/* =====================================================
   AGUARÁ PAINTBALL
   API CONFIG
   GET + POST

   GUARDA CONFIGURACIÓN EN SUPABASE

   TABLA:
   public.aguara_config

   COLUMNAS:
   id
   game_price
   shots_text
   hydrogel_price
   hydrogel_shots_text
   deposit
   min_players
===================================================== */


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

  const headers = {

    apikey:
      key,

    Authorization:
      "Bearer " + key,

    "Content-Type":
      "application/json"

  };


  if (prefer) {

    headers.Prefer =
      prefer;

  }


  return headers;

}


/* =====================================================
   VALORES POR DEFECTO
===================================================== */

const DEFAULT_CONFIG = {

  gamePrice:
    29000,

  shotsText:
    "100 TIROS INCLUIDOS",

  hydrogelPrice:
    25000,

  hydrogelShotsText:
    "MUNICIÓN INCLUIDA",

  deposit:
    50000,

  minPlayers:
    10

};


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
      Number.isFinite(
        Number(row.game_price)
      )
        ? Number(row.game_price)
        : DEFAULT_CONFIG.gamePrice,


    shotsText:
      row.shots_text ??
      DEFAULT_CONFIG.shotsText,


    hydrogelPrice:
      Number.isFinite(
        Number(row.hydrogel_price)
      )
        ? Number(row.hydrogel_price)
        : DEFAULT_CONFIG.hydrogelPrice,


    hydrogelShotsText:
      row.hydrogel_shots_text ??
      DEFAULT_CONFIG.hydrogelShotsText,


    deposit:
      Number.isFinite(
        Number(row.deposit)
      )
        ? Number(row.deposit)
        : DEFAULT_CONFIG.deposit,


    minPlayers:
      Number.isFinite(
        Number(row.min_players)
      )
        ? Number(row.min_players)
        : DEFAULT_CONFIG.minPlayers

  };

}


/* =====================================================
   CONVERTIR PANEL → SUPABASE
===================================================== */

function mapToDatabase(config) {

  return {

    game_price:
      Number(config.gamePrice),


    shots_text:
      String(
        config.shotsText ?? ""
      ).trim(),


    hydrogel_price:
      Number(
        config.hydrogelPrice
      ),


    hydrogel_shots_text:
      String(
        config.hydrogelShotsText ?? ""
      ).trim(),


    deposit:
      Number(
        config.deposit
      ),


    min_players:
      Number(
        config.minPlayers
      )

  };

}


/* =====================================================
   VALIDAR CONFIGURACIÓN
===================================================== */

function validateConfig(config) {

  const gamePrice =
    Number(
      config.gamePrice
    );


  const hydrogelPrice =
    Number(
      config.hydrogelPrice
    );


  const deposit =
    Number(
      config.deposit
    );


  const minPlayers =
    Number(
      config.minPlayers
    );


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


  return null;

}


/* =====================================================
   HANDLER
===================================================== */

export default async function handler(
  req,
  res
) {


  /* ===================================================
     MÉTODOS PERMITIDOS
  =================================================== */

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

        ok:
          false,

        message:
          "Método no permitido."

      }
    );

  }


  /* ===================================================
     SUPABASE
  =================================================== */

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

        ok:
          false,

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
     GET — LEER CONFIGURACIÓN
  =================================================== */

  if (
    req.method === "GET"
  ) {

    try {

      const response =
        await fetch(

          `${baseUrl}/rest/v1/aguara_config?select=*&order=id.asc&limit=1`,

          {

            method:
              "GET",

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
          "SUPABASE GET CONFIG ERROR:",
          data
        );


        return sendJson(
          res,
          response.status,
          {

            ok:
              false,

            message:
              data?.message ||
              data?.hint ||
              data?.details ||
              "No se pudo leer la configuración de Supabase.",

            error:
              data

          }
        );

      }


      const row =
        Array.isArray(data)
          ? data[0]
          : data;


      const configuration =
        mapFromDatabase(
          row
        );


      return sendJson(
        res,
        200,
        {

          ok:
            true,

          config:
            configuration

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

          ok:
            false,

          message:
            error?.message ||
            "Error interno leyendo la configuración."

        }
      );

    }

  }


  /* ===================================================
     POST — GUARDAR CONFIGURACIÓN
  =================================================== */

  if (
    req.method === "POST"
  ) {

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


      /* -----------------------------------------------
         ACEPTAR CAMELCASE DEL ADMIN
      ------------------------------------------------ */

      const configuration = {

        gamePrice:
          body.gamePrice ??
          body.game_price,


        shotsText:
          body.shotsText ??
          body.shots_text,


        hydrogelPrice:
          body.hydrogelPrice ??
          body.hydrogel_price,


        hydrogelShotsText:
          body.hydrogelShotsText ??
          body.hydrogel_shots_text,


        deposit:
          body.deposit,


        minPlayers:
          body.minPlayers ??
          body.min_players

      };


      /* -----------------------------------------------
         VALIDACIÓN
      ------------------------------------------------ */

      const validationError =
        validateConfig(
          configuration
        );


      if (validationError) {

        return sendJson(
          res,
          400,
          {

            ok:
              false,

            message:
              validationError

          }
        );

      }


      /* -----------------------------------------------
         CONVERTIR A COLUMNAS SUPABASE
      ------------------------------------------------ */

      const databaseConfig =
        mapToDatabase(
          configuration
        );


      console.log(
        "CONFIGURACIÓN A GUARDAR EN SUPABASE:",
        databaseConfig
      );


      /* -----------------------------------------------
         BUSCAR CONFIGURACIÓN EXISTENTE
      ------------------------------------------------ */

      const searchResponse =
        await fetch(

          `${baseUrl}/rest/v1/aguara_config?select=id&order=id.asc&limit=1`,

          {

            method:
              "GET",

            headers:
              supabaseHeaders(
                supabaseKey
              )

          }

        );


      const searchText =
        await searchResponse.text();


      let searchData;


      try {

        searchData =
          JSON.parse(
            searchText
          );

      } catch {

        searchData = [];

      }


      if (!searchResponse.ok) {

        console.error(
          "ERROR BUSCANDO CONFIGURACIÓN:",
          searchData
        );


        return sendJson(
          res,
          searchResponse.status,
          {

            ok:
              false,

            message:
              searchData?.message ||
              searchData?.hint ||
              searchData?.details ||
              "No se pudo consultar aguara_config.",

            error:
              searchData

          }
        );

      }


      const existingRow =
        Array.isArray(
          searchData
        )
          ? searchData[0]
          : null;


      /* =================================================
         ACTUALIZAR FILA EXISTENTE
      ================================================= */

      if (
        existingRow?.id !== undefined
      ) {

        const response =
          await fetch(

            `${baseUrl}/rest/v1/aguara_config?id=eq.${encodeURIComponent(existingRow.id)}`,

            {

              method:
                "PATCH",

              headers:
                supabaseHeaders(
                  supabaseKey,
                  "return=representation"
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


        if (!response.ok) {

          console.error(
            "ERROR ACTUALIZANDO CONFIG:",
            data
          );


          return sendJson(
            res,
            response.status,
            {

              ok:
                false,

              message:
                data?.message ||
                data?.hint ||
                data?.details ||
                "No se pudo actualizar la configuración.",

              error:
                data

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

            ok:
              true,

            message:
              "Configuración guardada correctamente en Supabase.",

            config:
              mapFromDatabase(
                savedRow
              )

          }
        );

      }


      /* =================================================
         CREAR CONFIGURACIÓN SI NO EXISTE
      ================================================= */

      const response =
        await fetch(

          `${baseUrl}/rest/v1/aguara_config`,

          {

            method:
              "POST",

            headers:
              supabaseHeaders(
                supabaseKey,
                "return=representation"
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


      if (!response.ok) {

        console.error(
          "ERROR CREANDO CONFIG:",
          data
        );


        return sendJson(
          res,
          response.status,
          {

            ok:
              false,

            message:
              data?.message ||
              data?.hint ||
              data?.details ||
              "No se pudo crear la configuración.",

            error:
              data

          }
        );

      }


      const savedRow =
        Array.isArray(data)
          ? data[0]
          : data;


      return sendJson(
        res,
        201,
        {

          ok:
            true,

          message:
            "Configuración creada correctamente en Supabase.",

          config:
            mapFromDatabase(
              savedRow
            )

        }
      );


    } catch (error) {

      console.error(
        "ERROR GENERAL POST CONFIG:",
        error
      );


      return sendJson(
        res,
        500,
        {

          ok:
            false,

          message:
            error?.message ||
            "Error interno guardando la configuración."

        }
      );

    }

  }

}
```
