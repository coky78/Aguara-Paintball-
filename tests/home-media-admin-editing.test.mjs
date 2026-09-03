import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../home-media-admin.js", import.meta.url), "utf8");

test("espacios multimedia de portada permiten reemplazar foto o video", () => {
  assert.match(source, /Elegir foto o video/);
  assert.match(source, /Reemplazar medio/);
  assert.match(source, /accept=.*video\/mp4/);
});

test("espacios multimedia de portada permiten editar datos y activar o desactivar el medio", () => {
  assert.match(source, /Nombre \/ título/);
  assert.match(source, /Texto alternativo/);
  assert.match(source, /Mostrar en portada/);
  assert.match(source, /hm-save/);
  assert.match(source, /hm-delete/);
});

test("espacios multimedia de portada permiten editar el encuadre de fotos y videos", () => {
  assert.match(source, /Editar encuadre/);
  assert.match(source, /positionX/);
  assert.match(source, /positionY/);
  assert.match(source, /zoom/);
  assert.match(source, /Guardar encuadre/);
});
