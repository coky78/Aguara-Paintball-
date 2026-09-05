import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../api/home-media.js", import.meta.url), "utf8");

test("home media API no usa representaciones singulares que puedan producir PGRST116", () => {
  assert.doesNotMatch(source, /\.maybeSingle\(\)/);
  assert.doesNotMatch(source, /\.single\(\)/);
  assert.match(source, /\.limit\(1\)/);
});
