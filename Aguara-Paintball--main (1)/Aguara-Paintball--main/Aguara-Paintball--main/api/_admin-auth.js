import { createHmac, timingSafeEqual } from "node:crypto";

export function requireAdmin(req, res) {
  const cookieHeader = String(req.headers?.cookie || "");
  const match = cookieHeader.match(/(?:^|;\s*)aguara_admin=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : "";
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret || !token) {
    res.status(401).json({ ok: false, message: "Sesión de administrador requerida." });
    return false;
  }

  const [timestamp, signature] = token.split(".");
  const age = Date.now() - Number(timestamp);

  if (!timestamp || !signature || !Number.isFinite(age) || age < 0 || age > 8 * 60 * 60 * 1000) {
    res.status(401).json({ ok: false, message: "Sesión de administrador expirada." });
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(timestamp)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ ok: false, message: "Sesión de administrador inválida." });
    return false;
  }

  return true;
}
