import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../hero-adjust.css", import.meta.url), "utf8");

assert.match(source, /\.hero-content\{[^}]*left:\s*0/s);
assert.match(source, /\.hero-content\{[^}]*justify-self:\s*start/s);
assert.match(source, /\.hero-content\{[^}]*text-align:\s*left/s);
assert.match(source, /\.hero-logo-splash\{[^}]*top:\s*23%/s);
