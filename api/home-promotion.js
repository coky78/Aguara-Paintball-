const COOKIE_NAME = "aguara_admin_session";

function parseCookies(req) {
  const header = String(req.headers.cookie || "");
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = value;
  }
  return cookies;
}

function base64UrlToBytes(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
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
  let binary = "";
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function isAdmin(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return false;

  const [expiresText, signature] = token.split(".");
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000) || !signature) return false;

  const expected = await sign(password, String(expires));
  return expected === signature;
}

function sendJson(res, status, payload) {
  return res.status(status).setHeader("Content-Type", "application/json").json(payload);
}

function getConfig() {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
}

function headers(key, prefer) {
  const value = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (prefer) value.Prefer = prefer;
  return value;
}

function mapRow(row) {
  return {
    enabled: row?.enabled === true,
    title: row?.title ?? "",
    text: row?.text_content ?? "",
    date: row?.event_date ?? "",
    ctaText: row?.cta_text ?? "",
    ctaUrl: row?.cta_url ?? ""
  };
}

async function readPromotion(res, admin) {
  const config = getConfig();
  if (!config) return sendJson(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });

  const { supabaseUrl, serviceRoleKey } = config;
  const response = await fetch(`${supabaseUrl}/rest/v1/home_promotion?id=eq.1&select=*`, {
    headers: headers(serviceRoleKey)
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) return sendJson(res, response.status, { ok: false, message: data?.message || "No se pudo leer la promoción." });

  const promo = mapRow(Array.isArray(data) ? data[0] : data);
  if (!admin && !promo.enabled) return sendJson(res, 200, { ok: true, visible: false, promotion: null });
  return sendJson(res, 200, { ok: true, visible: promo.enabled, promotion: promo });
}

async function savePromotion(req, res) {
  if (!(await isAdmin(req))) return sendJson(res, 401, { ok: false, message: "Sesión de administrador no válida." });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const promotion = {
    id: 1,
    enabled: body.enabled === true,
    title: String(body.title || "").trim().slice(0, 120),
    text_content: String(body.text || "").trim().slice(0, 500),
    event_date: String(body.date || "").trim().slice(0, 80),
    cta_text: String(body.ctaText || "").trim().slice(0, 60),
    cta_url: String(body.ctaUrl || "").trim().slice(0, 500)
  };

  if (promotion.enabled && !promotion.title && !promotion.text_content) {
    return sendJson(res, 400, { ok: false, message: "Cargá un título o texto antes de mostrar la promoción." });
  }

  if (promotion.ctaUrl && !/^https?:\/\//i.test(promotion.ctaUrl)) {
    return sendJson(res, 400, { ok: false, message: "El enlace del botón debe comenzar con http:// o https://" });
  }

  const config = getConfig();
  if (!config) return sendJson(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });

  const { supabaseUrl, serviceRoleKey } = config;
  const response = await fetch(`${supabaseUrl}/rest/v1/home_promotion?on_conflict=id`, {
    method: "POST",
    headers: headers(serviceRoleKey, "resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(promotion)
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) return sendJson(res, response.status, { ok: false, message: data?.message || "No se pudo guardar la promoción." });

  return sendJson(res, 200, { ok: true, promotion: mapRow(Array.isArray(data) ? data[0] : data) });
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return readPromotion(res, await isAdmin(req));
    if (req.method === "POST") return savePromotion(req, res);
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  } catch (error) {
    console.error("HOME PROMOTION ERROR:", error);
    return sendJson(res, 500, { ok: false, message: error?.message || "Error gestionando promoción." });
  }
}
