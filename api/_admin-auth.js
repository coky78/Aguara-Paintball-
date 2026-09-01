import crypto from "node:crypto";

const COOKIE_NAME = "aguara_admin_session";

function getCookie(req, name) {
  const header = String(req.headers?.cookie || "");
  const prefix = `${name}=`;
  for (const part of header.split(";")) {
    const value = part.trim();
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return "";
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sign(secret, payload) {
  return base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function requireAdmin(req, res) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    res.status(500).json({ ok: false, message: "Autenticación administrativa no configurada." });
    return false;
  }

  const token = getCookie(req, COOKIE_NAME);
  const separator = token.indexOf(".");
  if (separator <= 0) {
    res.status(401).json({ ok: false, message: "No autorizado." });
    return false;
  }

  const expires = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expiresSeconds = Number(expires);

  if (!/^\d+$/.test(expires) || !Number.isFinite(expiresSeconds) || expiresSeconds * 1000 <= Date.now()) {
    res.status(401).json({ ok: false, message: "Sesión administrativa inválida o vencida." });
    return false;
  }

  const expected = sign(secret, expires);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    res.status(401).json({ ok: false, message: "No autorizado." });
    return false;
  }

  return true;
}
