const COOKIE_NAME = "aguara_admin_session";

function sendJson(res, status, payload) {
  return res.status(status).setHeader("Content-Type", "application/json").json(payload);
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map(char => char.charCodeAt(0)));
}

async function sign(secret, payload) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(signature));
}

async function validAdmin(req) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const cookies = String(req.headers.cookie || "").split(";");
  const item = cookies.find(cookie => cookie.trim().startsWith(COOKIE_NAME + "="));
  if (!item) return false;
  const value = item.split("=").slice(1).join("=").trim();
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(secret, String(expires));
  const a = fromBase64Url(signature);
  const b = fromBase64Url(expected);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

function headers(key, prefer) {
  const result = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", Accept: "application/json" };
  if (prefer) result.Prefer = prefer;
  return result;
}

const DEFAULT_TEXT = "Elegí primero la fecha y después uno de los horarios disponibles. La seña es necesaria para confirmar la reserva.";

export default async function handler(req, res) {
  const config = getConfig();
  if (!config) return sendJson(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });

  if (req.method === "GET") {
    try {
      const response = await fetch(config.url + "/rest/v1/aguara_booking_info?select=text_content&id=eq.1&limit=1", { headers: headers(config.key) });
      const data = await response.json();
      if (!response.ok) return sendJson(res, response.status, { ok: false, message: "No se pudo leer el texto de reservas.", error: data });
      return sendJson(res, 200, { ok: true, text: data?.[0]?.text_content || DEFAULT_TEXT });
    } catch (error) {
      return sendJson(res, 500, { ok: false, message: error.message || "Error leyendo el texto de reservas." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  }

  if (!(await validAdmin(req))) return sendJson(res, 401, { ok: false, message: "No autorizado." });

  const text = String(req.body?.text ?? "").trim();
  if (!text) return sendJson(res, 400, { ok: false, message: "El texto no puede quedar vacío." });
  if (text.length > 1200) return sendJson(res, 400, { ok: false, message: "El texto no puede superar 1200 caracteres." });

  try {
    const update = await fetch(config.url + "/rest/v1/aguara_booking_info?id=eq.1", {
      method: "PATCH",
      headers: headers(config.key, "return=representation"),
      body: JSON.stringify({ text_content: text, updated_at: new Date().toISOString() })
    });
    const updated = await update.json();
    if (!update.ok) return sendJson(res, update.status, { ok: false, message: "No se pudo guardar el texto de reservas.", error: updated });
    if (Array.isArray(updated) && updated.length) return sendJson(res, 200, { ok: true, text: updated[0].text_content || text });

    const insert = await fetch(config.url + "/rest/v1/aguara_booking_info", {
      method: "POST",
      headers: headers(config.key, "return=representation"),
      body: JSON.stringify({ id: 1, text_content: text, updated_at: new Date().toISOString() })
    });
    const inserted = await insert.json();
    if (!insert.ok) return sendJson(res, insert.status, { ok: false, message: "No se pudo crear el registro del texto de reservas.", error: inserted });
    return sendJson(res, 200, { ok: true, text: inserted?.[0]?.text_content || text });
  } catch (error) {
    return sendJson(res, 500, { ok: false, message: error.message || "Error guardando el texto de reservas." });
  }
}
