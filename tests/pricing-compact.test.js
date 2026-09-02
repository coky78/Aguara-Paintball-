import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../pricing-adjust.css", import.meta.url), "utf8");

assert.match(source, /\.price-card\{[^}]*padding:\s*20px/s);
assert.match(source, /\.price-card strong\{[^}]*font-size:\s*2\.3rem/s);
assert.match(source, /\.price-grid\{[^}]*gap:\s*12px/s);
