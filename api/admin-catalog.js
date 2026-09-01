import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "aguara_admin_session";
const BUCKET = "site-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function json(res, status, payload) {
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
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
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
  const item = cookies.find((cookie) => cookie.trim().startsWith(COOKIE_NAME + "="));
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

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function safeName(name) {
  const value = String(name || "marcadora.jpg").normalize("NFKD").replace(/[^\w. -]/g, "").replace(/\s+/g, "-").toLowerCase();
  return value.slice(0, 100) || "marcadora.jpg";
}

function publicUrl(path) {
  return `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function cleanText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export default async function handler(req, res) {
  const supabase = getSupabase();
  if (!supabase) return json(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });
  if (!(await validAdmin(req))) return json(res, 401, { ok: false, message: "No autorizado." });

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("equipment_catalog").select("id,name,description,image_path,public_url,sort_order,enabled,created_at,updated_at").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return json(res, 200, { ok: true, items: data || [] });
    }

    const body = req.body || {};

    if (req.method === "POST" && body.action === "prepare-upload") {
      const contentType = String(body.contentType || "");
      const fileSize = Number(body.fileSize || 0);
      if (!/^image\/(jpeg|png|webp)$/.test(contentType)) return json(res, 400, { ok: false, message: "Formato no permitido. Usá JPG, PNG o WEBP." });
      if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_IMAGE_BYTES) return json(res, 400, { ok: false, message: "La imagen debe pesar como máximo 5 MB." });
      const path = `catalog/${crypto.randomUUID()}-${safeName(body.fileName)}`;
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error) throw error;
      return json(res, 200, { ok: true, path, token: data.token });
    }

    if (req.method === "POST" && body.action === "create") {
      const name = cleanText(body.name, 120);
      if (!name) return json(res, 400, { ok: false, message: "El nombre de la marcadora es obligatorio." });
      const description = cleanText(body.description, 1000);
      const imagePath = cleanText(body.imagePath, 300);
      if (!imagePath.startsWith("catalog/")) return json(res, 400, { ok: false, message: "Imagen de catálogo inválida." });
      const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
      const payload = { name, description, image_path: imagePath, public_url: publicUrl(imagePath), sort_order: sortOrder, enabled: body.enabled !== false, updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from("equipment_catalog").insert(payload).select().single();
      if (error) throw error;
      return json(res, 200, { ok: true, item: data });
    }

    if (req.method === "PATCH") {
      const id = cleanText(body.id, 80);
      if (!id) return json(res, 400, { ok: false, message: "Marcadora inválida." });
      const updates = {
        name: cleanText(body.name, 120),
        description: cleanText(body.description, 1000),
        sort_order: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
        enabled: body.enabled !== false,
        updated_at: new Date().toISOString()
      };
      if (!updates.name) return json(res, 400, { ok: false, message: "El nombre de la marcadora es obligatorio." });
      const { data, error } = await supabase.from("equipment_catalog").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return json(res, 200, { ok: true, item: data });
    }

    if (req.method === "DELETE") {
      const id = cleanText(body.id, 80);
      const { data: current, error: lookupError } = await supabase.from("equipment_catalog").select("image_path").eq("id", id).maybeSingle();
      if (lookupError) throw lookupError;
      if (!current) return json(res, 404, { ok: false, message: "Marcadora no encontrada." });
      const { error } = await supabase.from("equipment_catalog").delete().eq("id", id);
      if (error) throw error;
      if (current.image_path) await supabase.storage.from(BUCKET).remove([current.image_path]);
      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return json(res, 405, { ok: false, message: "Método no permitido." });
  } catch (error) {
    console.error("ADMIN CATALOG ERROR:", error);
    return json(res, 500, { ok: false, message: error.message || "Error gestionando el catálogo." });
  }
}
