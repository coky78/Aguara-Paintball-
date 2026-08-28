export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        ok: false,
        message: "Faltan las variables de Supabase"
      });
    }

    // CREAR RESERVA
    if (req.method === "POST") {
      const {
        nombre,
        whatsapp,
        fecha,
        horario,
        jugadores,
        tipo_de_juego
      } = req.body || {};

      if (!nombre || !whatsapp || !fecha || !horario || !jugadores) {
        return res.status(400).json({
          ok: false,
          message: "Faltan datos de la reserva"
        });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/reservation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            nombre: nombre,
            whatsapp: whatsapp,
            fecha: fecha,
            horario: horario,
            jugadores: Number(jugadores),
            tipo_de_juego: tipo_de_juego || "Paintball"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("ERROR SUPABASE:", data);

        return res.status(500).json({
          ok: false,
          message: "No se pudo guardar la reserva",
          error: data.message || JSON.stringify(data)
        });
      }

      return res.status(201).json({
        ok: true,
        reserva: data[0]
      });
    }

    // CONSULTAR RESERVAS
    if (req.method === "GET") {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/reservation?select=*&order=fecha.asc,horario.asc`,
        {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("ERROR SUPABASE:", data);

        return res.status(500).json({
          ok: false,
          message: "No se pudieron consultar las reservas"
        });
      }

      return res.status(200).json({
        ok: true,
        reservas: data
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
      message: "Error interno del servidor",
      error: error.message
    });
  }
}
