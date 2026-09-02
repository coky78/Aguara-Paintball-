import test from "node:test";
import assert from "node:assert/strict";
import { smoothScrollOptions, shouldScrollForUserChange } from "../reservation-scroll.js";

test("usa desplazamiento suave con alineación profesional", () => {
  assert.deepEqual(smoothScrollOptions(), {
    behavior: "smooth",
    block: "start",
    inline: "nearest"
  });
});

test("solo desplaza ante cambios iniciados por el usuario", () => {
  assert.equal(shouldScrollForUserChange({ isTrusted: true }), true);
  assert.equal(shouldScrollForUserChange({ isTrusted: false }), false);
});
