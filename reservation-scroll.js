export function smoothScrollOptions() {
  return { behavior: "smooth", block: "start", inline: "nearest" };
}

export function shouldScrollForUserChange(event) {
  return Boolean(event && event.isTrusted !== false);
}

function scrollToElement(element) {
  if (!element) return;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView(reduceMotion ? { behavior: "auto", block: "start", inline: "nearest" } : smoothScrollOptions());
}

function initReservationScrolling() {
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const nameInput = document.getElementById("name");
  if (!dateInput || !timeSelect || !nameInput) return;

  let pendingDateScroll = false;
  let lastDateValue = dateInput.value;

  dateInput.addEventListener("change", (event) => {
    if (!shouldScrollForUserChange(event) || !dateInput.value) return;
    pendingDateScroll = true;
    lastDateValue = dateInput.value;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!pendingDateScroll || dateInput.value !== lastDateValue) return;
      pendingDateScroll = false;
      scrollToElement(timeSelect.closest("label") || timeSelect);
    }));
  });

  timeSelect.addEventListener("change", (event) => {
    if (!shouldScrollForUserChange(event) || !timeSelect.value) return;
    requestAnimationFrame(() => scrollToElement(nameInput.closest("label") || nameInput));
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initReservationScrolling, { once: true });
  else initReservationScrolling();
}
