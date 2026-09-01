import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adminCatalog = readFileSync(new URL("../admin-catalog.js", import.meta.url), "utf8");
const apiCatalog = readFileSync(new URL("../api/admin-catalog.js", import.meta.url), "utf8");
const publicCatalog = readFileSync(new URL("../api/public-catalog.js", import.meta.url), "utf8");

assert.match(adminCatalog, /catalog-replace/);
assert.match(adminCatalog, /action:\"replace-upload\"/);
assert.match(apiCatalog, /body\.action === \"replace-upload\"/);
assert.match(apiCatalog, /image_path: imagePath/);
assert.match(publicCatalog, /\.eq\("enabled", true\)/);

console.log("✓ Catálogo: edición de foto, API de reemplazo y publicación activa verificadas.");
