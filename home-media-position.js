export function buildMediaTransform(positionX = 50, positionY = 50, zoom = 1) {
  const x = Math.max(0, Math.min(100, Number(positionX) || 50));
  const y = Math.max(0, Math.min(100, Number(positionY) || 50));
  const z = Math.max(0.1, Math.min(3, Number(zoom) || 1));
  const translateX = (50 - x) * (z - 1);
  const translateY = (50 - y) * (z - 1);
  return `translate(${translateX}%, ${translateY}%) scale(${z})`;
}
