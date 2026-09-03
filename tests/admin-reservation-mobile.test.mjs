import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../admin-mobile-reservations.js", import.meta.url), "utf8");

test("el módulo móvil crea un enlace WhatsApp seguro para el cliente", () => {
  assert.match(source, /wa\.me/);
  assert.match(source, /admin-whatsapp/);
});

test("el módulo móvil aumenta reservas y controles táctiles", () => {
  assert.match(source, /@media \(max-width: 640px\)/);
  assert.match(source, /padding:\s*24px/);
  assert.match(source, /min-height:\s*56px/);
});
