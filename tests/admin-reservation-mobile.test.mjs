import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../admin.js", import.meta.url), "utf8");

test("reservas del administrador incluyen acceso directo al WhatsApp del cliente", () => {
  assert.match(source, /admin-whatsapp/);
  assert.match(source, /https:\/\/wa\.me\//);
});

test("reservas del administrador tienen controles móviles grandes", () => {
  assert.match(source, /@media \(max-width: 640px\)/);
  assert.match(source, /\.admin-reservation[^{]*\{[^}]*padding:\s*24px/);
  assert.match(source, /\.admin-action-btn[^{]*\{[^}]*min-height:\s*56px/);
});
