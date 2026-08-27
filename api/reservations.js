import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // CREAR UNA RESERVA
    if (req.method === "POST") {
      const {
        nombre,
        whatsapp,
        fecha,
        horario,
        jugadores,
        tipo_juego,
        precio_por_jugador,
        total
      } = req.body || {};

      if (
        !nombre ||
        !whatsapp ||
        !fecha ||
        !horario ||
        !jugadores
      ) {
        return res.status(400).json({
          ok: false,
          message: "Faltan datos de la reserva"
        });
      }

      const resultado = await sql`
        INSERT INTO reservas (
          nombre,
          whatsapp,
          fecha,
          horario,
          jugadores,
          tipo_juego,
          precio_por_jugador,
          total,
          sena_requerida,
          monto_recibido,
          estado_pago,
          estado_reserva
        )
        VALUES (
          ${nombre},
          ${whatsapp},
          ${fecha},
          ${horario},
          ${Number(jugadores)},
          ${tipo_juego || "Paintball"},
          ${Number(precio_por_jugador || 0)},
          ${Number(total || 0)},
          50000,
          0,
          'pendiente',
          'pendiente'
        )
        RETURNING *
      `;

      return res.status(201).json({
        ok: true,
        reserva: resultado[0]
      });
    }

    // CONSULTAR RESERVAS
    if (req.method === "GET") {
      const reservas = await sql`
        SELECT *
        FROM reservas
        ORDER BY fecha ASC, horario ASC
      `;

      return res.status(200).json({
        ok: true,
        reservas
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });

  } catch (error) {
    console.error("ERROR RESERVAS:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor"
    });
  }
}
