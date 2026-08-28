```javascript
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // =====================================================
  // MÉTODOS PERMITIDOS
  // =====================================================

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });
  }

  // =====================================================
  // VARIABLES DE SUPABASE
  // =====================================================

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de Supabase");

    return res.status(500).json({
      ok: false,
      message: "Faltan las variables de configuración de Supabase"
    });
  }

  // =====================================================
  // CLIENTE SUPABASE
  // =====================================================

  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // ===================================================
    // GET — LISTAR RESERVAS
    // ===================================================

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("fecha", { ascending: true })
        .order("horario", { ascending: true });

      if (error) {
        console.error("ERROR GET SUPABASE:", error);

        return res.status(500).json({
          ok: false,
          message: "No se pudieron consultar las reservas",
          error: error.message
        });
      }

      return res.status(200).json({
        ok: true,
        reservas: data || []
      });
    }

    // ===================================================
    // POST — CREAR RESERVA
    // ===================================================

    const body = req.body || {};

    console.log(
      "DATOS RECIBIDOS:",
      JSON.stringify(body)
    );

    // ===================================================
    // DATOS DEL FORMULARIO
    // ===================================================

    const nombre =
      String(body.nombre || "").trim();

    const whatsapp =
      String(body.whatsapp || "").trim();

    const fecha =
      String(body.fecha || "").trim();

    const horario =
      String(body.horario || "").trim();

    const jugadores =
      Number(body.jugadores);

    const tipoDeJuego =
      String(
        body.tipo_de_juego || "Paintball"
      );

    const precioPorJugador =
      body.precio_por_jugador != null
        ? Number(body.precio_por_jugador)
        : null;

    const total =
      body.total != null
        ? Number(body.total)
        : null;

    const senaRequerida =
      body.sena_requerida != null
        ? Number(body.sena_requerida)
        : null;

    const montoRecibido =
      body.monto_recibido != null
        ? Number(body.monto_recibido)
        : 0;

    const estadoDePago =
      String(
        body.estado_de_pago || "pendiente"
      );

    const estadoDeReserva =
      String(
        body.estado_de_reserva || "pendiente"
      );

    const fechaDeTransferencia =
      body.fecha_de_transferencia || null;

    // ===================================================
    // VALIDACIONES
    // ===================================================

    if (!nombre) {
      return res.status(400).json({
        ok: false,
        message: "Falta el nombre"
      });
    }

    if (!whatsapp) {
      return res.status(400).json({
        ok: false,
        message: "Falta el número de WhatsApp"
      });
    }

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "Falta la fecha"
      });
    }

    if (!horario) {
      return res.status(400).json({
        ok: false,
        message: "Falta el horario"
      });
    }

    if (
      !Number.isFinite(jugadores) ||
      jugadores <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad de jugadores no es válida"
      });
    }

    if (
      precioPorJugador !== null &&
      !Number.isFinite(precioPorJugador)
    ) {
      return res.status(400).json({
        ok: false,
        message: "El precio por jugador no es válido"
      });
    }

    if (
      total !== null &&
      !Number.isFinite(total)
    ) {
      return res.status(400).json({
        ok: false,
        message: "El total no es válido"
      });
    }

    if (
      senaRequerida !== null &&
      !Number.isFinite(senaRequerida)
    ) {
      return res.status(400).json({
        ok: false,
        message: "La seña requerida no es válida"
      });
    }

    // ===================================================
    // RESERVA
    //
    // IMPORTANTE:
    // NO enviamos "observaciones" porque esa columna
    // no existe en public.reservations.
    // ===================================================

    const reserva = {
      nombre,
      whatsapp,
      fecha,
      horario,
      jugadores,

      tipo_de_juego:
        tipoDeJuego,

      precio_por_jugador:
        precioPorJugador,

      total,

      sena_requerida:
        senaRequerida,

      monto_recibido:
        montoRecibido,

      estado_de_pago:
        estadoDePago,

      estado_de_reserva:
        estadoDeReserva,

      fecha_de_transferencia:
        fechaDeTransferencia
    };

    console.log(
      "INSERTANDO RESERVA:",
      JSON.stringify(reserva)
    );

    // ===================================================
    // INSERTAR EN SUPABASE
    // ===================================================

    const { data, error } = await supabase
      .from("reservations")
      .insert(reserva)
      .select()
      .single();

    // ===================================================
    // ERROR SUPABASE
    // ===================================================

    if (error) {
      console.error(
        "ERROR INSERT SUPABASE:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          error.message ||
          "Supabase rechazó la reserva",
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      });
    }

    // ===================================================
    // ÉXITO
    // ===================================================

    console.log(
      "RESERVA GUARDADA:",
      JSON.stringify(data)
    );

    return res.status(201).json({
      ok: true,
      message: "Reserva guardada correctamente",
      reserva: data
    });

  } catch (error) {
    // ===================================================
    // ERROR GENERAL
    // ===================================================

    console.error(
      "ERROR GENERAL RESERVATIONS:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        error?.message ||
        "Error interno al procesar la reserva",
      error:
        error?.message || String(error)
    });
  }
}
```
