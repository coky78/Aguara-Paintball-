const COOKIE_NAME = "aguara_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

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

function clientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0].trim() || String(req.socket?.remoteAddress || "unknown");
}

function tooManyAttempts(key) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 0 });
    return false;
  }
  return current.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return;
  }
  current.count += 1;
}

function clearFailures(key) {
  attempts.delete(key);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  const key = clientKey(req);
  if (tooManyAttempts(key)) {
    res.setHeader("Retry-After", String(Math.ceil(WINDOW_MS / 1000)));
    return res.status(429).json({
      ok: false,
      message: "Demasiados intentos. Esperá unos minutos y volvé a intentar."
    });
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
    recordFailure(key);
    return res.status(401).json({
      ok: false,
      message: "Usuario o contraseña incorrectos"
    });
  }

  clearFailures(key);

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
