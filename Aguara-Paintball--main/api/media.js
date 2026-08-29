import { requireAdmin } from "./_admin-auth.js";

const BUCKET = "aguara-media";

const SLOTS = {
  hero_video: {
    label: "Video principal",
    type: "video",
    fallback: "assets/hero.mp4"
  },
  gallery_1: {
    label: "Foto 1",
    type: "image",
    fallback: "assets/gallery-1.jpg"
  },
  gallery_2: {
    label: "Foto 2",
    type: "image",
    fallback: "assets/gallery-2.jpg"
  },
  gallery_3: {
    label: "Foto 3",
    type: "image",
    fallback: "assets/gallery-3.jpg"
  },
  gallery_4: {
    label: "Foto 4",
    type: "image",
    fallback: "assets/gallery-4.jpg"
  }
};

function send(res, status, payload) {
  return res.status(status).json(payload);
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

function headers(key, prefer) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {})
  };
}

function publicUrl(base, path) {
  return `${base}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

async function ensureBucket(base, key) {
  const check = await fetch(`${base}/storage/v1/bucket/${BUCKET}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });

  if (check.ok) return true;

  const response = await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 80 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]
    })
  });

  if (response.ok || response.status === 409) return true;

  console.error("No se pudo crear bucket:", await response.text());
  return false;
}

async function listRows(base, key) {
  const response = await fetch(
    `${base}/rest/v1/site_media?select=slot,file_name,mime_type,title,alt_text,storage_path,updated_at&order=slot.asc`,
    { headers: headers(key) }
  );

  const text = await response.text();
  let data = [];
  try { data = JSON.parse(text); } catch {}

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo consultar la configuración de medios.");
  }

  const rows = Array.isArray(data) ? data : [];
  return Object.entries(SLOTS).map(([slot, info]) => {
    const row = rows.find((item) => item.slot === slot);
    return {
      slot,
      label: info.label,
      type: info.type,
      title: row?.title || info.label,
      alt_text: row?.alt_text || "Aguará Paintball",
      file_name: row?.file_name || "",
      mime_type: row?.mime_type || "",
      storage_path: row?.storage_path || "",
      url: row?.storage_path ? publicUrl(base, row.storage_path) : info.fallback,
      source: row?.storage_path ? "supabase" : "local"
    };
  });
}

export default async function handler(req, res) {
  const cfg = config();
  if (!cfg) {
    return send(res, 500, { ok: false, message: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel." });
  }

  const { url: base, key } = cfg;

  try {
    if (req.method === "GET") {
      const media = await listRows(base, key);
      return send(res, 200, { ok: true, media });
    }

    if (!requireAdmin(req, res)) return;

    if (!(await ensureBucket(base, key))) {
      return send(res, 500, { ok: false, message: "No se pudo preparar el almacenamiento de medios." });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const action = String(body.action || "").trim();

    if (action === "sign") {
      const slot = String(body.slot || "").trim();
      const fileName = String(body.file_name || "").trim();
      const mimeType = String(body.mime_type || "").trim();

      if (!SLOTS[slot]) return send(res, 400, { ok: false, message: "Sección de contenido no válida." });

      const allowed = SLOTS[slot].type === "image"
        ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
        : ["video/mp4", "video/webm"];

      if (!allowed.includes(mimeType)) {
        return send(res, 400, { ok: false, message: "Formato no permitido para esta sección." });
      }

      const safeExt = mimeType === "image/jpeg" ? ".jpg"
        : mimeType === "image/png" ? ".png"
        : mimeType === "image/webp" ? ".webp"
        : mimeType === "image/gif" ? ".gif"
        : mimeType === "video/webm" ? ".webm" : ".mp4";

      const path = `slots/${slot}-${Date.now()}${safeExt}`;

      const signResponse = await fetch(
        `${base}/storage/v1/object/upload/sign/${BUCKET}/${encodeURIComponent(path).replaceAll("%2F", "/")}`,
        {
          method: "POST",
          headers: headers(key),
          body: JSON.stringify({ expiresIn: 3600, upsert: true })
        }
      );

      const signText = await signResponse.text();
      let signData = {};
      try { signData = JSON.parse(signText); } catch {}

      if (!signResponse.ok) {
        return send(res, 500, {
          ok: false,
          message: signData?.message || "No se pudo generar el enlace de carga.",
          error: signData
        });
      }

      const token = signData.token;
      if (!token) {
        return send(res, 500, { ok: false, message: "Supabase no devolvió el token de carga." });
      }

      const uploadUrl =
        `${base}/storage/v1/object/upload/sign/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}?token=${encodeURIComponent(token)}`;

      return send(res, 200, {
        ok: true,
        slot,
        path,
        upload_url: uploadUrl,
        token
      });
    }

    if (action === "save") {
      const slot = String(body.slot || "").trim();
      const path = String(body.storage_path || "").trim();
      const fileName = String(body.file_name || "").trim().slice(0, 180);
      const mimeType = String(body.mime_type || "").trim();
      const title = String(body.title || "").trim().slice(0, 120);
      const altText = String(body.alt_text || "Aguará Paintball").trim().slice(0, 180);

      if (!SLOTS[slot] || !path.startsWith(`slots/${slot}-`)) {
        return send(res, 400, { ok: false, message: "Archivo o sección inválida." });
      }

      const upsertResponse = await fetch(`${base}/rest/v1/site_media?on_conflict=slot`, {
        method: "POST",
        headers: headers(key, "resolution=merge-duplicates,return=representation"),
        body: JSON.stringify({
          slot,
          file_name: fileName || path.split("/").pop(),
          mime_type: mimeType,
          title: title || SLOTS[slot].label,
          alt_text: altText || "Aguará Paintball",
          storage_path: path,
          updated_at: new Date().toISOString()
        })
      });

      const text = await upsertResponse.text();
      let data = [];
      try { data = JSON.parse(text); } catch {}

      if (!upsertResponse.ok) {
        return send(res, 500, { ok: false, message: data?.message || "No se pudo guardar el medio.", error: data });
      }

      return send(res, 200, { ok: true, media: data[0] || null });
    }

    if (action === "delete") {
      const slot = String(body.slot || "").trim();
      if (!SLOTS[slot]) return send(res, 400, { ok: false, message: "Sección no válida." });

      const existingResponse = await fetch(
        `${base}/rest/v1/site_media?slot=eq.${encodeURIComponent(slot)}&select=storage_path`,
        { headers: headers(key) }
      );
      const existing = await existingResponse.json();
      const oldPath = Array.isArray(existing) ? existing[0]?.storage_path : "";

      if (oldPath) {
        await fetch(`${base}/storage/v1/object/remove/${BUCKET}`, {
          method: "POST",
          headers: headers(key),
          body: JSON.stringify({ prefixes: [oldPath] })
        });
      }

      const deleteResponse = await fetch(
        `${base}/rest/v1/site_media?slot=eq.${encodeURIComponent(slot)}`,
        {
          method: "DELETE",
          headers: headers(key, "return=minimal")
        }
      );

      if (!deleteResponse.ok) {
        return send(res, 500, { ok: false, message: "No se pudo eliminar la configuración." });
      }

      return send(res, 200, { ok: true });
    }

    return send(res, 400, { ok: false, message: "Acción no válida." });
  } catch (error) {
    console.error("MEDIA API:", error);
    return send(res, 500, { ok: false, message: error?.message || "Error interno gestionando medios." });
  }
}
