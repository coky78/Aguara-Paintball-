import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "aguara_admin_session";
const BUCKET = "site-media";
const DEFAULT_SLOTS = {
  hero_video: { type: "video", path: "hero.mp4", title: "Video principal", alt: "Aguará Paintball" },
  gallery_1: { type: "image", path: "gallery-1.jpg", title: "Galería 1", alt: "Aguará Paintball" },
  gallery_2: { type: "image", path: "gallery-2.jpg", title: "Galería 2", alt: "Partida de paintball" },
  gallery_3: { type: "image", path: "gallery-3.jpg", title: "Galería 3", alt: "Jugadores de Aguará Paintball" },
  gallery_4: { type: "image", path: "gallery-4.jpg", title: "Galería 4", alt: "Campo de paintball" },
  gallery_5: { type: "image", path: "gallery-5.jpg", title: "Galería 5", alt: "Aguará Paintball" },
  gallery_6: { type: "image", path: "gallery-6.jpg", title: "Galería 6", alt: "Aguará Paintball" },
  logo: { type: "image", path: "logo.png", title: "Logo", alt: "Aguará Paintball" }
};

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
  const value = String(name || "media").normalize("NFKD").replace(/[^\w. -]/g, "").replace(/\s+/g, "-").toLowerCase();
  return value.slice(0, 100) || "media";
}

function allowedType(contentType) {
  return /^image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime)$/.test(String(contentType || ""));
}

function normalizeSlots(rows) {
  return Object.entries(DEFAULT_SLOTS).map(([slotKey, fallback], index) => {
    const row = rows.find((item) => item.slot_key === slotKey);
    return {
      slot_key: slotKey,
      media_type: row?.media_type || fallback.type,
      storage_path: row?.storage_path || "",
      public_url: row?.public_url || "",
      title: row?.title || fallback.title,
      alt_text: row?.alt_text || fallback.alt,
      sort_order: row?.sort_order ?? index,
      enabled: row?.enabled ?? true,
      fallback_path: fallback.path,
      fallback_url: `/assets/${fallback.path}`
    };
  });
}

export default async function handler(req, res) {
  const supabase = getSupabase();
  if (!supabase) return json(res, 500, { ok: false, message: "Faltan variables de Supabase en Vercel." });
  if (!(await validAdmin(req))) return json(res, 401, { ok: false, message: "No autorizado." });

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("media_library").select("slot_key,media_type,storage_path,public_url,title,alt_text,sort_order,enabled").order("sort_order", { ascending: true });
      if (error) throw error;
      return json(res, 200, { ok: true, media: normalizeSlots(data || []) });
    }

    const body = req.body || {};

    if (req.method === "POST" && body.action === "prepare-upload") {
      const slotKey = String(body.slotKey || "");
      const contentType = String(body.contentType || "");
      if (!DEFAULT_SLOTS[slotKey]) return json(res, 400, { ok: false, message: "Destino de medio inválido." });
      if (!allowedType(contentType)) return json(res, 400, { ok: false, message: "Formato no permitido. Usá JPG, PNG, WEBP, GIF, MP4, WEBM o MOV." });
      if (DEFAULT_SLOTS[slotKey].type === "image" && !contentType.startsWith("image/")) return json(res, 400, { ok: false, message: "Ese espacio requiere una imagen." });
      if (DEFAULT_SLOTS[slotKey].type === "video" && !contentType.startsWith("video/")) return json(res, 400, { ok: false, message: "Ese espacio requiere un video." });
      const filename = safeName(body.fileName || DEFAULT_SLOTS[slotKey].path);
      const path = `${slotKey}/${crypto.randomUUID()}-${filename}`;
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error) throw error;
      return json(res, 200, { ok: true, path, token: data.token });
    }

    if (req.method === "POST" && body.action === "finalize") {
      const slotKey = String(body.slotKey || "");
      const path = String(body.path || "");
      if (!DEFAULT_SLOTS[slotKey] || !path.startsWith(slotKey + "/")) return json(res, 400, { ok: false, message: "Destino de medio inválido." });
      const mediaType = DEFAULT_SLOTS[slotKey].type;
      const publicUrl = `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(path).replace(/%2F/g, "/")}`;
      const { data: previous } = await supabase.from("media_library").select("storage_path").eq("slot_key", slotKey).maybeSingle();
      const payload = {
        slot_key: slotKey,
        media_type: mediaType,
        storage_path: path,
        public_url: publicUrl,
        title: String(body.title || DEFAULT_SLOTS[slotKey].title).trim().slice(0, 160),
        alt_text: String(body.altText || DEFAULT_SLOTS[slotKey].alt).trim().slice(0, 160),
        enabled: body.enabled !== false,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from("media_library").upsert(payload, { onConflict: "slot_key" }).select().single();
      if (error) throw error;
      if (previous?.storage_path && previous.storage_path !== path) {
        await supabase.storage.from(BUCKET).remove([previous.storage_path]);
      }
      return json(res, 200, { ok: true, media: data });
    }

    if (req.method === "PATCH") {
      const slotKey = String(body.slotKey || "");
      if (!DEFAULT_SLOTS[slotKey]) return json(res, 400, { ok: false, message: "Destino de medio inválido." });
      const updates = {
        title: String(body.title || "").trim().slice(0, 160),
        alt_text: String(body.altText || "").trim().slice(0, 160),
        enabled: body.enabled !== false,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from("media_library").update(updates).eq("slot_key", slotKey).select().single();
      if (error) throw error;
      return json(res, 200, { ok: true, media: data });
    }

    if (req.method === "DELETE") {
      const slotKey = String(body.slotKey || "");
      if (!DEFAULT_SLOTS[slotKey]) return json(res, 400, { ok: false, message: "Destino de medio inválido." });
      const { data: current, error: lookupError } = await supabase.from("media_library").select("storage_path").eq("slot_key", slotKey).maybeSingle();
      if (lookupError) throw lookupError;
      if (current?.storage_path) {
        const { error } = await supabase.storage.from(BUCKET).remove([current.storage_path]);
        if (error) throw error;
      }
      const { data, error } = await supabase.from("media_library").update({ storage_path: "", public_url: "", enabled: false, updated_at: new Date().toISOString() }).eq("slot_key", slotKey).select().single();
      if (error) throw error;
      return json(res, 200, { ok: true, media: data });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return json(res, 405, { ok: false, message: "Método no permitido." });
  } catch (error) {
    console.error("ADMIN MEDIA ERROR:", error);
    return json(res, 500, { ok: false, message: error.message || "Error gestionando medios." });
  }
}
