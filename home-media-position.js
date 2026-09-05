export function buildMediaTransform(positionX = 50, positionY = 50, zoom = 1) {
  const rawX = Number(positionX);
  const rawY = Number(positionY);
  const rawZoom = Number(zoom);
  const x = Math.max(0, Math.min(100, Number.isFinite(rawX) ? rawX : 50));
  const y = Math.max(0, Math.min(100, Number.isFinite(rawY) ? rawY : 50));
  const z = Math.max(0.1, Math.min(3, Number.isFinite(rawZoom) ? rawZoom : 1));
  const translateX = (50 - x) * (z - 1);
  const translateY = (50 - y) * (z - 1);
  return `translate(${translateX}%, ${translateY}%) scale(${z})`;
}

function applyEditorTransform(overlay) {
  if (!overlay) return;
  const x = overlay.querySelector(".hme-x");
  const y = overlay.querySelector(".hme-y");
  const z = overlay.querySelector(".hme-z");
  const media = overlay.querySelector(".hme-preview img, .hme-preview video");
  if (!x || !y || !z || !media) return;
  media.style.transformOrigin = "center center";
  media.style.transform = buildMediaTransform(x.value, y.value, z.value);
}

function applyCardTransform(card) {
  if (!card) return;
  const preview = card.querySelector(".home-admin-preview");
  const media = preview?.querySelector("img, video");
  if (!media) return;
  media.style.transformOrigin = "center center";
  media.style.transform = buildMediaTransform(card.dataset.positionX, card.dataset.positionY, card.dataset.zoom);
}

if (typeof document !== "undefined") {
  document.addEventListener("input", (event) => {
    if (event.target.matches?.(".hme-x, .hme-y, .hme-z")) {
      applyEditorTransform(event.target.closest(".home-media-editor-overlay"));
    }
  });

  const observer = new MutationObserver(() => {
    document.querySelectorAll(".home-media-editor-overlay").forEach(applyEditorTransform);
    document.querySelectorAll("#homeMediaAdminGrid .media-card").forEach(applyCardTransform);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
