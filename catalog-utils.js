export function normalizeCatalogItem(item = {}) {
  return {
    id: String(item.id || ""),
    name: String(item.name ?? item.nombre ?? "").trim(),
    description: String(item.description ?? item.descripcion ?? "").trim(),
    imageUrl: String(item.public_url ?? item.imageUrl ?? "").trim(),
    enabled: item.enabled !== false,
    sortOrder: Number.isFinite(Number(item.sort_order ?? item.sortOrder)) ? Number(item.sort_order ?? item.sortOrder) : 0
  };
}

export function sortCatalogItems(items = []) {
  return [...items].sort((a, b) => {
    if (Boolean(a.enabled) !== Boolean(b.enabled)) return a.enabled ? -1 : 1;
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });
}
