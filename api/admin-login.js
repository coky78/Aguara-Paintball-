const COOKIE_NAME = "aguara_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sign(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return base64Url(new Uint8Array(signature));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  const { username, password } = req.body || {};
  const validUser = "aguarapaintball";
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validPassword) {
    console.error("FALTA ADMIN_PASSWORD EN VERCEL");
    return res.status(500).json({
      ok: false,
      message: "La autenticación del administrador no está configurada."
    });
  }

  if (username !== validUser || password !== validPassword) {
    return res.status(401).json({
      ok: false,
      message: "Usuario o contraseña incorrectos"
    });
  }

  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const sessionSignature = await sign(validPassword, String(expires));

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${expires}.${sessionSignature}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  return res.status(200).json({
    ok: true,
    message: "Sesión de administrador iniciada correctamente."
  });
}
