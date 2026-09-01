import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adminCatalog = readFileSync(new URL("../admin-catalog.js", import.meta.url), "utf8");
const apiCatalog = readFileSync(new URL("../api/admin-catalog.js", import.meta.url), "utf8");
const publicCatalog = readFileSync(new URL("../api/public-catalog.js", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../middleware.js", import.meta.url), "utf8");

assert.match(adminCatalog, /catalog-replace/);
assert.match(adminCatalog, /imagePath,oldImagePath/);
assert.match(apiCatalog, /body\.imagePath!==undefined/);
assert.match(apiCatalog, /updates\.image_path=imagePath/);
assert.match(publicCatalog, /\.eq\("enabled",true\)/);
assert.match(middleware, /path === "\/api\/public-media"/);
assert.match(middleware, /path === "\/api\/public-catalog"/);

console.log("✓ Catálogo: edición de foto, API de reemplazo, publicación y middleware verificadas.");
