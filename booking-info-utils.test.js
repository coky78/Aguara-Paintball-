import test from "node:test";
import assert from "node:assert/strict";
import { parseBookingInfo } from "./booking-info-utils.js";

test("detecta el alias de transferencia y permite copiarlo", () => {
  const result = parseBookingInfo("Elegí tu fecha.\nAlias de transferencia: aguara.paintball\nLa seña confirma la reserva.");

  assert.equal(result.alias, "aguara.paintball");
  assert.equal(result.lines[1].label, "Alias de transferencia");
  assert.equal(result.lines[1].value, "aguara.paintball");
});

test("detecta un alias escrito en la línea siguiente a la indicación de alias", () => {
  const result = parseBookingInfo("Si querés señar te dejo el alias.\n👇\n\naguarapaintball\n\nLa seña confirma la reserva.");

  assert.equal(result.alias, "aguarapaintball");
  assert.equal(result.lines[3].type, "alias");
  assert.equal(result.lines[3].value, "aguarapaintball");
});

test("no convierte texto común en un alias", () => {
  const result = parseBookingInfo("Elegí tu fecha y horario.\nLa seña es necesaria para confirmar.");

  assert.equal(result.alias, "");
  assert.deepEqual(result.lines.map((line) => line.type), ["text", "text"]);
});
