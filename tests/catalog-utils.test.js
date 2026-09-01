import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCatalogItem, sortCatalogItems } from "../catalog-utils.js";

test("normaliza una marcadora para mostrarla en el catálogo", () => {
  const item = normalizeCatalogItem({
    id: "abc",
    nombre: "Tippmann Cronus",
    descripcion: "Marcadora táctica para partidas intensas.",
    public_url: "/media/cronus.jpg",
    enabled: true,
    sort_order: 2
  });

  assert.deepEqual(item, {
    id: "abc",
    name: "Tippmann Cronus",
    description: "Marcadora táctica para partidas intensas.",
    imageUrl: "/media/cronus.jpg",
    enabled: true,
    sortOrder: 2
  });
});

test("ordena las marcadoras por orden y deja las desactivadas al final", () => {
  const items = [
    { id: "b", sortOrder: 2, enabled: true },
    { id: "c", sortOrder: 1, enabled: false },
    { id: "a", sortOrder: 1, enabled: true }
  ];

  assert.deepEqual(sortCatalogItems(items).map((item) => item.id), ["a", "b", "c"]);
});
