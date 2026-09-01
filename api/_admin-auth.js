import crypto from "node:crypto";

function getCookie(req, name) {
  const header = String(req.headers?.cookie || "");
  const prefix = `${name}=`;
  for (const part of header.split(";")) {
    const value = part.trim();
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return "";
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function requireAdmin(req, res) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    res.status(500).json({ ok: false, message: "Autenticación administrativa no configurada." });
    return false;
  }

  const token = getCookie(req, "aguara_admin");
  const separator = token.lastIndexOf(".");
  if (separator <= 0) {
    res.status(401).json({ ok: false, message: "No autorizado." });
    return false;
  }

  const value = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const parts = value.split(".");
  const expiresAt = Number(parts[1]);

  if (!parts[0] || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    res.status(401).json({ ok: false, message: "Sesión administrativa inválida o vencida." });
    return false;
  }

  if (!timingSafeEqualText(signature, sign(value, secret))) {
    res.status(401).json({ ok: false, message: "No autorizado." });
    return false;
  }

  return true;
}
