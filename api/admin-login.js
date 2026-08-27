```javascript
export default function handler(req, res) {

  // Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido"
    });
  }

  try {

    const { username, password } = req.body || {};

    // Usuario correcto
    const validUser = "aguarapaintball";

    // Contraseña almacenada en Vercel
    const validPassword = process.env.ADMIN_PASSWORD;

    // Comprobaciones
    const receivedUser =
      String(username || "").trim();

    const receivedPassword =
      String(password || "").trim();

    // Comprobar que Vercel tenga configurada la variable
    if (!validPassword) {
      console.error(
        "ADMIN_PASSWORD no está configurada"
      );

      return res.status(500).json({
        ok: false,
        message: "ADMIN_PASSWORD no está configurada en Production"
      });
    }

    // Validar usuario y contraseña
    if (
      receivedUser === validUser &&
      receivedPassword === String(validPassword).trim()
    ) {

      return res.status(200).json({
        ok: true,
        message: "Acceso autorizado"
      });

    }

    return res.status(401).json({
      ok: false,
      message: "Usuario o contraseña incorrectos"
    });

  } catch (error) {

    console.error(
      "Error en admin-login:",
      error
    );

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor"
    });

  }

}
```
