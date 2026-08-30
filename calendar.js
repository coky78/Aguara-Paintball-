/* =====================================================
   AGUARÁ PAINTBALL — CALENDARIO DE RESERVAS
   Complemento independiente. NO modifica script.js.
===================================================== */
(() => {
  "use strict";

  const state = {
    reservations: [],
    byDate: new Map(),
    month: new Date(),
    selectedDate: ""
  };

  const pad = n => String(n).padStart(2, "0");
  const time5 = v => String(v || "").slice(0, 5);

  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function injectStyles() {
    if (document.getElementById("aguaraCalendarStyles")) return;
    const style = document.createElement("style");
    style.id = "aguaraCalendarStyles";
    style.textContent = `
      .aguara-calendar-shell{grid-column:1/-1;margin:0 0 18px;padding:18px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:linear-gradient(145deg,rgba(20,15,12,.97),rgba(10,10,10,.97));box-shadow:0 18px 45px rgba(0,0,0,.25)}
      .aguara-calendar-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
      .aguara-calendar-title{margin:0;text-transform:capitalize;font-weight:800;font-size:1.15rem;letter-spacing:.02em}
      .aguara-calendar-nav{display:flex;gap:8px}
      .aguara-calendar-nav button{width:40px;height:40px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#231812;color:#fff;cursor:pointer;font-size:1.15rem;font-weight:800}
      .aguara-calendar-nav button:hover{background:#3b2418}
      .aguara-calendar-weekdays,.aguara-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}
      .aguara-calendar-weekdays{margin-bottom:7px}
      .aguara-calendar-weekday{padding:6px 0;text-align:center;font-size:.72rem;color:rgba(255,255,255,.55);font-weight:800;text-transform:uppercase}
      .aguara-day{position:relative;aspect-ratio:1 / 1;min-height:0;border:1px solid rgba(255,255,255,.10);border-radius:12px;background:#171717;color:#fff;cursor:pointer;padding:8px 6px;display:flex;align-items:center;justify-content:center;transition:transform .15s ease,border-color .15s ease,background .15s ease}
      .aguara-day:hover:not(:disabled){transform:translateY(-1px);border-color:rgba(255,255,255,.28)}
      .aguara-day:disabled{cursor:default}
      .aguara-day.is-outside{opacity:.28}
      .aguara-day.is-today{box-shadow:inset 0 0 0 1px rgba(255,255,255,.48)}
      .aguara-day.is-selected{border-color:#f08a35;background:#3a2418;color:#fff;box-shadow:0 0 0 2px rgba(240,138,53,.18)}
      .aguara-day.is-reserved{background:rgba(84,47,26,.72);border-color:rgba(126,67,34,.90)}
      .aguara-day-number{position:relative;z-index:2;font-size:1rem;font-weight:900;margin-top:10px}
      .aguara-day-x{position:absolute;top:3px;left:50%;transform:translateX(-50%);z-index:1;color:#ff3131;font-size:1.15rem;line-height:1;text-shadow:0 1px 5px rgba(0,0,0,.9)}
      .aguara-day-label{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);font-size:.43rem;font-weight:900;color:#ff8989;white-space:nowrap;letter-spacing:.04em}
      .aguara-calendar-status{margin-top:13px;padding:11px 13px;border-radius:11px;background:rgba(0,0,0,.23);font-size:.86rem;color:rgba(255,255,255,.78)}
      .aguara-time-panel{margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,.08)}
      .aguara-time-title{margin:0 0 10px;font-size:.92rem;font-weight:800}
      .aguara-time-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .aguara-time-card{position:relative;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#1a1a1a;color:#fff;padding:11px 12px;text-align:left;cursor:pointer;font-weight:800}
      .aguara-time-card small{display:block;margin-top:2px;font-size:.66rem;font-weight:700;color:rgba(255,255,255,.55)}
      .aguara-time-card.is-selected{border-color:#f08a35;background:#3a2418}
      .aguara-time-card.is-reserved{background:rgba(84,47,26,.72);border-color:rgba(126,67,34,.90);color:rgba(255,255,255,.68);cursor:not-allowed;padding-top:18px}
      .aguara-time-card.is-reserved::before{content:"✕";position:absolute;top:4px;right:8px;color:#ff3131;font-size:1.05rem;font-weight:900}
      .aguara-time-card.is-reserved small{color:#ff8989}
      @media(max-width:640px){.aguara-calendar-shell{padding:13px;border-radius:15px}.aguara-day{min-height:0;padding:4px}.aguara-day-number{font-size:.92rem}.aguara-day-label{font-size:.38rem}.aguara-time-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  async function loadReservations() {
    try {
      const response = await fetch("/api/reservations", { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("No se pudieron consultar las reservas.");
      const payload = await response.json();
      state.reservations = Array.isArray(payload.reservas) ? payload.reservas : [];
      rebuildIndex();
      renderCalendar();
      renderTimes();
    } catch (error) {
      console.error("CALENDARIO AGUARÁ:", error);
    }
  }

  function rebuildIndex() {
    state.byDate = new Map();
    for (const row of state.reservations) {
      const date = String(row.booking_date || row.fecha || "").slice(0, 10);
      const time = time5(row.booking_time || row.horario || "");
      if (!date) continue;
      if (!state.byDate.has(date)) state.byDate.set(date, new Set());
      if (time) state.byDate.get(date).add(time);
    }
  }

  function reserved(date, time) {
    return state.byDate.get(date)?.has(time) || false;
  }

  function makeShell() {
    if (document.getElementById("aguaraCalendarShell")) return true;
    const dateInput = document.getElementById("date");
    const formGrid = dateInput?.closest(".form-grid");
    if (!dateInput || !formGrid) return false;

    const shell = document.createElement("div");
    shell.id = "aguaraCalendarShell";
    shell.className = "aguara-calendar-shell";
    shell.innerHTML = `
      <div class="aguara-calendar-head">
        <h3 class="aguara-calendar-title" id="aguaraCalendarTitle"></h3>
        <div class="aguara-calendar-nav">
          <button type="button" id="aguaraPrevMonth" aria-label="Mes anterior">‹</button>
          <button type="button" id="aguaraNextMonth" aria-label="Mes siguiente">›</button>
        </div>
      </div>
      <div class="aguara-calendar-weekdays">
        <div class="aguara-calendar-weekday">Dom</div><div class="aguara-calendar-weekday">Lun</div><div class="aguara-calendar-weekday">Mar</div><div class="aguara-calendar-weekday">Mié</div><div class="aguara-calendar-weekday">Jue</div><div class="aguara-calendar-weekday">Vie</div><div class="aguara-calendar-weekday">Sáb</div>
      </div>
      <div class="aguara-calendar-grid" id="aguaraCalendarGrid"></div>
      <div class="aguara-calendar-status" id="aguaraCalendarStatus">Elegí una fecha. Los días con reservas aparecen marcados con una ❌ roja.</div>
      <div class="aguara-time-panel">
        <h4 class="aguara-time-title">Horarios disponibles</h4>
        <div class="aguara-time-grid" id="aguaraTimeGrid"></div>
      </div>
    `;
    formGrid.prepend(shell);

    document.getElementById("aguaraPrevMonth").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); });
    document.getElementById("aguaraNextMonth").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); });

    dateInput.addEventListener("change", () => {
      state.selectedDate = dateInput.value;
      if (state.selectedDate) {
        const d = parseDate(state.selectedDate);
        state.month = new Date(d.getFullYear(), d.getMonth(), 1);
      }
      renderCalendar();
      renderTimes();
    });

    const timeSelect = document.getElementById("time");
    if (timeSelect) {
      const observer = new MutationObserver(() => renderTimes());
      observer.observe(timeSelect, { childList: true, subtree: true, attributes: true });
      timeSelect.addEventListener("change", renderTimes);
    }
    return true;
  }

  function renderCalendar() {
    const grid = document.getElementById("aguaraCalendarGrid");
    const title = document.getElementById("aguaraCalendarTitle");
    if (!grid || !title) return;
    const y = state.month.getFullYear(), m = state.month.getMonth();
    title.textContent = new Date(y, m, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    grid.innerHTML = "";

    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("button");
      cell.type = "button"; cell.disabled = true; cell.className = "aguara-day is-outside";
      cell.textContent = String(new Date(y, m, 0).getDate() - firstDay + i + 1);
      grid.appendChild(cell);
    }

    const today = dateKey(new Date());
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      const count = state.byDate.get(key)?.size || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `aguara-day${key === today ? " is-today" : ""}${key === state.selectedDate ? " is-selected" : ""}${count ? " is-reserved" : ""}`;
      btn.title = count ? `${count} horario(s) reservado(s)` : "Día disponible";
     btn.innerHTML = `<span class="aguara-day-number">${d}</span>`;
      btn.addEventListener("click", () => selectDate(key));
      grid.appendChild(btn);
    }

    const status = document.getElementById("aguaraCalendarStatus");
    if (status) status.textContent = state.selectedDate ? `${parseDate(state.selectedDate).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — seleccioná un horario.` : "Elegí una fecha. Los días con reservas aparecen marcados con una ❌ roja.";
  }

  function selectDate(key) {
    const input = document.getElementById("date");
    if (!input) return;
    state.selectedDate = key;
    const d = parseDate(key);
    state.month = new Date(d.getFullYear(), d.getMonth(), 1);
    input.value = key;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    renderCalendar();
    renderTimes();
  }

  function renderTimes() {
    const grid = document.getElementById("aguaraTimeGrid");
    const select = document.getElementById("time");
    if (!grid || !select) return;
    const date = select.previousElementSibling?.querySelector?.("#date")?.value || document.getElementById("date")?.value || state.selectedDate;
    const options = Array.from(select.options).filter(o => o.value);
    grid.innerHTML = "";

    if (!date || !options.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:rgba(255,255,255,.52);font-size:.82rem;">Primero elegí una fecha.</div>`;
      return;
    }

    for (const option of options) {
      const time = time5(option.value);
      const isReserved = reserved(date, time);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `aguara-time-card${option.value === select.value && !isReserved ? " is-selected" : ""}${isReserved ? " is-reserved" : ""}`;
      card.disabled = isReserved;
      card.innerHTML = `<span>${time}</span><small>${isReserved ? "RESERVADO" : "DISPONIBLE"}</small>`;
      if (!isReserved) {
        card.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
      grid.appendChild(card);
    }
  }

  function init() {
  injectStyles();
  if (!makeShell()) return;

  const dateInput = document.getElementById("date");

  // Siempre comenzar con la fecha actual
  const today = dateKey(new Date());

  state.selectedDate = today;

  if (dateInput) {
    dateInput.value = today;
  }

  // Mostrar automáticamente el mes actual
  const d = parseDate(today);
  state.month = new Date(d.getFullYear(), d.getMonth(), 1);

  renderCalendar();
  renderTimes();
  loadReservations();

  // Actualizar reservas periódicamente
  setInterval(loadReservations, 30000);
}

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
