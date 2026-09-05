import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../home-media-public.js", import.meta.url), "utf8");

assert.equal(source.includes("home-media-caption"), false, "La portada no debe crear captions para los medios.");
assert.equal(source.includes("experience-media-caption"), false, "La experiencia no debe crear captions para los medios.");
assert.equal(source.includes("if(item.title)"), false, "Los títulos no deben condicionar ni crear elementos visibles.");
assert.equal(source.includes("cap.textContent=item.title"), false, "El título del medio no debe renderizarse.");

console.log("✓ home media no renderiza títulos visibles");
