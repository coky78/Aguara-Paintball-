import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../admin-video-editor.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../api/admin-media.js", import.meta.url), "utf8");
const publicApi = fs.readFileSync(new URL("../api/public-media.js", import.meta.url), "utf8");
const publicMedia = fs.readFileSync(new URL("../media-public.js", import.meta.url), "utf8");

assert.match(source, /media-edit-video/);
assert.match(source, /video-editor-controls/);
assert.match(source, /videoPositionY/);
assert.match(source, /videoPositionX/);
assert.match(source, /videoZoom/);
assert.match(source, /positionX/);
assert.match(source, /positionY/);
assert.match(source, /zoom/);
assert.match(api, /position_x/);
assert.match(api, /position_y/);
assert.match(api, /positionX/);
assert.match(api, /positionY/);
assert.match(publicApi, /position_x/);
assert.match(publicApi, /position_y/);
assert.match(publicApi, /zoom/);
assert.match(publicMedia, /objectPosition/);
