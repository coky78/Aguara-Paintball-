import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../media-public.js", import.meta.url), "utf8");
assert.equal((source.match(/fetch\("\/api\/public-media"/g) || []).length, 1);
assert.equal((source.match(/fetch\("\/api\/public-catalog"/g) || []).length, 0);

console.log("public-media endpoint consolidation: ok");
