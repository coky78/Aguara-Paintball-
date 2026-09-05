import test from "node:test";
import assert from "node:assert/strict";
import { buildMediaTransform } from "../home-media-position.js";

test("horizontal position changes the rendered transform", () => {
  assert.equal(buildMediaTransform(0, 50, 2), "translate(50%, 0%) scale(2)");
  assert.equal(buildMediaTransform(100, 50, 2), "translate(-50%, 0%) scale(2)");
});

test("vertical position changes the rendered transform", () => {
  assert.equal(buildMediaTransform(50, 0, 2), "translate(0%, 50%) scale(2)");
  assert.equal(buildMediaTransform(50, 100, 2), "translate(0%, -50%) scale(2)");
});

test("center position keeps the media centered", () => {
  assert.equal(buildMediaTransform(50, 50, 1.5), "translate(0%, 0%) scale(1.5)");
});
