import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../home-media-admin.js", import.meta.url), "utf8");

test("home media client validates the 100 MB storage limit", () => {
  assert.match(source, /MAX_UPLOAD_BYTES=100\*1024\*1024/);
  assert.match(source, /file\.size>MAX_UPLOAD_BYTES/);
});

test("home media client sends an explicit content type and upsert header", () => {
  assert.match(source, /method:"PUT"/);
  assert.match(source, /"Content-Type":contentType/);
  assert.match(source, /"x-upsert":"true"/);
});

test("home media client exposes the storage response body instead of hiding a 400", () => {
  assert.match(source, /await r\.text\(\)/);
  assert.match(source, /Storage rechazó la subida \(400\)/);
});
