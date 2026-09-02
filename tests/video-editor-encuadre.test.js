import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../admin-media.js", import.meta.url), "utf8");

assert.match(source, /hero_video:\s*\{[^}]*type:\s*["']video["']/s);
assert.match(source, /media-edit-video/);
assert.match(source, /video-editor-controls/);
assert.match(source, /videoPositionY/);
assert.match(source, /videoZoom/);
assert.match(source, /object-position/);
