import { createHmac } from "node:crypto";

function makeToken() {
  const timestamp = String(Date.now());
  const secret = process.env.ADMIN_PASSWORD;
  const signature = createHmac("sha256", secret)
    .update(timestamp)
    .digest("base64url");
  return `${timestamp}.${signature}`;
}

function cookieOptions() {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=28800",
    ...(process.env.VERCEL_ENV ? ["Secure"] : [])
  ].join("; ");
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Método no permitido." });
  }

  const { username, password } = req.body || {};
  const validUser = "aguarapaintball";
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validPassword) {
    return res.status(500).json({
      ok: false,
      message: "ADMIN_PASSWORD no está configurada en Vercel."
    });
  }

  if (username === validUser && password === validPassword) {
    res.setHeader("Set-Cookie", `aguara_admin=${makeToken()}; ${cookieOptions()}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({
    ok: false,
    message: "Usuario o contraseña incorrectos"
  });
}
