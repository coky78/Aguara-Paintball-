/* =====================================================
   AGUARÁ PAINTBALL
   CALENDAR.JS
   Cada horario se bloquea individualmente.
   El día NUNCA se marca como reservado completo.
===================================================== */

(function () {

  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");

  if (!dateInput || !timeSelect) {
    console.log("Calendar: elementos no encontrados.");
    return;
  }


  /* ===================================================
     CONFIGURACIÓN DE HORARIOS
  =================================================== */

  const SLOTS = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00"
  ];


  /* ===================================================
     RESERVAS
  =================================================== */

  let reservations = [];


  /* ===================================================
     OBTENER RESERVAS
  =================================================== */

  async function loadReservations() {

    try {

      const response =
        await fetch(
          "/api/reservations",
          {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          }
        );


      if (!response.ok) {

        throw new Error(
          "No se pudieron consultar las reservas."
        );

      }


      const data =
        await response.json();


      reservations =
        Array.isArray(data.reservas)
          ? data.reservas
          : [];


      console.log(
        "Reservas cargadas:",
        reservations
      );


      /*
        IMPORTANTE:

        NO marcamos ningún día como reservado.

        Solamente usamos las reservas cuando
        el usuario selecciona una fecha para
        bloquear sus horarios correspondientes.
      */


      updateTimeSlots();


    } catch (error) {

      console.error(
        "ERROR CARGANDO RESERVAS:",
        error
      );

    }

  }


  /* ===================================================
     COMPROBAR SI UN HORARIO ESTÁ RESERVADO
  =================================================== */

  function isTimeReserved(date, time) {

    return reservations.some(
      function (reservation) {

        const reservationDate =
          String(
            reservation.booking_date || ""
          ).slice(0, 10);


        const reservationTime =
          String(
            reservation.booking_time || ""
          ).slice(0, 5);


        const status =
          String(
            reservation.status || ""
          ).toLowerCase();


        /*
          Solo bloqueamos reservas que
          realmente estén pendientes o confirmadas.

          Si alguna otra reserva tiene otro estado,
          no bloquea el horario.
        */

        const activeStatus =
          status === "pending" ||
          status === "confirmed";


        return (
          reservationDate === date &&
          reservationTime === time &&
          activeStatus
        );

      }
    );

  }


  /* ===================================================
     ACTUALIZAR HORARIOS
  =================================================== */

  function updateTimeSlots() {

    const selectedDate =
      dateInput.value;


    if (!selectedDate) {

      timeSelect.innerHTML = "";


      const option =
        document.createElement("option");

      option.value = "";

      option.textContent =
        "Elegí una fecha";


      timeSelect.appendChild(
        option
      );

      return;
    }


    /*
      Guardamos el horario que tenía seleccionado
      el usuario antes de reconstruir la lista.
    */

    const previousValue =
      timeSelect.value;


    timeSelect.innerHTML = "";


    const firstOption =
      document.createElement("option");

    firstOption.value = "";

    firstOption.textContent =
      "Elegí un horario";


    timeSelect.appendChild(
      firstOption
    );


    /* =================================================
       CREAR HORARIOS
    ================================================= */

    SLOTS.forEach(
      function (time) {

        const option =
          document.createElement("option");


        option.value =
          time;


        if (
          isTimeReserved(
            selectedDate,
            time
          )
        ) {

          /*
            EL HORARIO ESTÁ RESERVADO

            Lo mostramos pero queda bloqueado.
          */

          option.textContent =
            time + " — RESERVADO";

          option.disabled =
            true;

          option.dataset.reserved =
            "true";

        } else {

          option.textContent =
            time;

          option.disabled =
            false;

        }


        timeSelect.appendChild(
          option
        );

      }
    );


    /*
      Si el horario anterior sigue disponible,
      lo conservamos.

      Si quedó reservado, volvemos a
      "Elegí un horario".
    */

    if (
      previousValue &&
      !isTimeReserved(
        selectedDate,
        previousValue
      )
    ) {

      timeSelect.value =
        previousValue;

    } else {

      timeSelect.value =
        "";

    }

  }


  /* ===================================================
     CAMBIO DE FECHA
  =================================================== */

  dateInput.addEventListener(
    "change",
    function () {

      updateTimeSlots();

    }
  );


  /* ===================================================
     EVITAR SELECCIONAR HORARIO BLOQUEADO
  =================================================== */

  timeSelect.addEventListener(
    "change",
    function () {

      const selectedDate =
        dateInput.value;


      const selectedTime =
        timeSelect.value;


      if (
        selectedDate &&
        selectedTime &&
        isTimeReserved(
          selectedDate,
          selectedTime
        )
      ) {

        alert(
          "Ese horario ya está reservado. Elegí otro horario."
        );


        timeSelect.value =
          "";

      }

    }
  );


  /* ===================================================
     ACTUALIZAR RESERVAS PERIÓDICAMENTE
  =================================================== */

  loadReservations();


  /*
    Cada 30 segundos volvemos a consultar.

    Esto permite que si alguien reserva un horario
    desde otro dispositivo, ese horario se actualice.
  */

  setInterval(
    loadReservations,
    30000
  );


  console.log(
    "Aguará Paintball — calendar.js cargado."
  );

})();
