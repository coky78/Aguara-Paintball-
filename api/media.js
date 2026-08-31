/* =====================================================
   AGUARÁ PAINTBALL
   API MEDIA
   Supabase Storage + catálogo multimedia
===================================================== */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "aguara-media";
const MANIFEST_PATH = "_media.json";
const MAX_SIZE = 100 * 1024 * 1024;

const ALLOWED = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"]
};

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function ensureBucket(supabase) {
  const { data, error } = await supabase.storage.getBucket(BUCKET);

  if (!error && data) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_SIZE,
    allowedMimeTypes: [...ALLOWED.image, ...ALLOWED.video]
  });

  if (createError && !/already exists|duplicate/i.test(createError.message || "")) {
    throw createError;
  }
}

async function readManifest(supabase) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(MANIFEST_PATH);

  if (error) {
    if (/not found|404/i.test(error.message || "")) return [];
    return [];
  }

  const text = await data.text();

  try {
    const items = JSON.parse(text);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

async function writeManifest(supabase, items) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(MANIFEST_PATH, new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
      cacheControl: "0"
    });

  if (error) throw error;
}

function normalize(items) {
  return [...items]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((item, index) => ({ ...item, order: index + 1 }));
}

function publicUrl(supabase, path) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function slugify(value) {
  return String(value || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "archivo";
}

function extensionForMime(type) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov"
  };
  return map[type] || null;
}

async function listMedia(res, supabase) {
  const media = normalize(await readManifest(supabase)).map(item => ({
    ...item,
    url: publicUrl(supabase, item.path)
  }));

  return sendJson(res, 200, { ok: true, media });
}

async function createUpload(req, res, supabase) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const title = String(body.title || body.file_name || "Archivo").trim();
  const contentType = String(body.content_type || "");
  const size = Number(body.size || 0);

  const kind = contentType.startsWith("image/") ? "image" :
    contentType.startsWith("video/") ? "video" : null;

  if (!kind || !ALLOWED[kind].includes(contentType)) {
    return sendJson(res, 400, {
      ok: false,
      message: "Formato no permitido. Usá JPG, PNG, WEBP, MP4, WEBM o MOV."
    });
  }

  if (size <= 0 || size > MAX_SIZE) {
    return sendJson(res, 400, {
      ok: false,
      message: "El archivo debe pesar entre 1 byte y 100 MB."
    });
  }

  const extension = extensionForMime(contentType);
  const id = crypto.randomUUID();
  const path = `media/${id}-${slugify(title)}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: false });

  if (error) throw error;

  return sendJson(res, 200, {
    ok: true,
    id,
    path,
    kind,
    title,
    token: data.token,
    publicUrl: publicUrl(supabase, path)
  });
}

async function registerMedia(req, res, supabase) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const path = String(body.path || "").trim();
  const kind = body.kind === "video" ? "video" : "image";
  const title = String(body.title || "Archivo").trim() || "Archivo";
  const id = String(body.id || path.split("/").pop() || crypto.randomUUID());

  if (!path) {
    return sendJson(res, 400, { ok: false, message: "Falta la ruta del archivo." });
  }

  const items = await readManifest(supabase);
  const item = {
    id,
    path,
    kind,
    title,
    order: items.length + 1,
    createdAt: new Date().toISOString()
  };

  const next = normalize([...items, item]);
  await writeManifest(supabase, next);

  return sendJson(res, 200, { ok: true, media: next });
}

async function editMedia(req, res, supabase) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const id = String(body.id || "").trim();
  const items = await readManifest(supabase);
  const index = items.findIndex(item => item.id === id);

  if (index < 0) {
    return sendJson(res, 404, { ok: false, message: "No se encontró el medio." });
  }

  if (body.title !== undefined) {
    const title = String(body.title || "").trim();
    if (!title) {
      return sendJson(res, 400, { ok: false, message: "El título no puede estar vacío." });
    }
    items[index].title = title;
  }

  if (body.order !== undefined) {
    const order = Number(body.order);
    if (!Number.isInteger(order) || order < 1) {
      return sendJson(res, 400, { ok: false, message: "El orden no es válido." });
    }
    const [item] = items.splice(index, 1);
    items.splice(Math.min(order - 1, items.length), 0, item);
  }

  if (body.path !== undefined) {
    items[index].path = String(body.path).trim();
  }

  const next = normalize(items);
  await writeManifest(supabase, next);
  return sendJson(res, 200, { ok: true, media: next });
}

async function deleteMedia(req, res, supabase) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const id = String(body.id || "").trim();
  const items = await readManifest(supabase);
  const item = items.find(entry => entry.id === id);

  if (!item) {
    return sendJson(res, 404, { ok: false, message: "No se encontró el medio." });
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([item.path]);

  if (error) throw error;

  const next = normalize(items.filter(entry => entry.id !== id));
  await writeManifest(supabase, next);

  return sendJson(res, 200, { ok: true, media: next });
}

export default async function handler(req, res) {
  const supabase = getSupabase();

  if (!supabase) {
    return sendJson(res, 500, {
      ok: false,
      message: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel."
    });
  }

  try {
    await ensureBucket(supabase);

    if (req.method === "GET") {
      return listMedia(res, supabase);
    }

    if (req.method === "POST") {
      const action = String(req.body?.action || "create-upload");
      if (action === "register") return registerMedia(req, res, supabase);
      return createUpload(req, res, supabase);
    }

    if (req.method === "PATCH") {
      return editMedia(req, res, supabase);
    }

    if (req.method === "DELETE") {
      return deleteMedia(req, res, supabase);
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  } catch (error) {
    console.error("AGUARÁ MEDIA API ERROR:", error);
    return sendJson(res, 500, {
      ok: false,
      message: error?.message || "Error gestionando multimedia."
    });
  }
}
