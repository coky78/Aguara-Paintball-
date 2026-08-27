```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
        tipo_de_juego
      } = req.body || {};

      if (!nombre || !whatsapp || !fecha || !horario || !jugadores) {
        return res.status(400).json({
          ok: false,
          message: "Faltan datos de la reserva"
        });
      }

      const { data, error } = await supabase
        .from("reservation")
        .insert([
          {
            nombre,
            whatsapp,
            fecha,
            horario,
            jugadores: Number(jugadores),
            tipo_de_juego: tipo_de_juego || "Paintball"
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("ERROR SUPABASE:", error);

        return res.status(500).json({
          ok: false,
          message: "No se pudo guardar la reserva"
        });
      }

      return res.status(201).json({
        ok: true,
        reserva: data
      });
    }

    // CONSULTAR RESERVAS
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("reservation")
        .select("*")
        .order("fecha", { ascending: true })
        .order("horario", { ascending: true });

      if (error) {
        console.error("ERROR SUPABASE:", error);

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
      message: "Error interno del servidor"
    });
  }
}
```
