/* =====================================================
  AGUARÁ PAINTBALL
   SCRIPT.JS — VERSIÓN CORREGIDA
   SCRIPT.JS — RESERVAS + COMPROBANTE
===================================================== */


@@ -20,7 +20,7 @@ const CONFIG = {

whatsapp: "5493794250285",

  /* HORARIOS */
  /* HORARIOS — NO MODIFICAR */
slots: [
"10:00",
"11:00",
@@ -99,6 +99,12 @@ const notesInput =

const bookingMessage =
document.getElementById("bookingMessage");


/* =====================================================
   ELEMENTOS DEL COMPROBANTE
===================================================== */

const receiptUpload =
document.getElementById("receiptUpload");

@@ -114,8 +120,16 @@ const receiptMessage =
const receiptAmount =
document.getElementById("receiptAmount");


/*
   Guarda el public_id de la última reserva creada.
   Ese ID permite asociar el comprobante
   exactamente con la reserva correcta.
*/

let currentReservationId = null;


/* =====================================================
  PRECIOS
===================================================== */
@@ -183,6 +197,12 @@ if (publicMinPlayers) {
}


if (receiptAmount) {
  receiptAmount.textContent =
    money(CONFIG.deposit);
}


/* =====================================================
  AÑO
===================================================== */
@@ -236,13 +256,9 @@ function cargarHorarios() {
}


  /* Limpiar horarios anteriores */

timeSelect.innerHTML = "";


  /* Opción inicial */

const primeraOpcion =
document.createElement("option");

@@ -256,8 +272,6 @@ function cargarHorarios() {
);


  /* Agregar horarios */

CONFIG.slots.forEach(function (hora) {

const opcion =
@@ -336,8 +350,6 @@ if (dateInput) {
}


      /* Cargar horarios */

cargarHorarios();

}
@@ -374,6 +386,308 @@ function showMessage(
}


/* =====================================================
   MENSAJES DEL COMPROBANTE
===================================================== */

function showReceiptMessage(
  message,
  type
) {

  if (!receiptMessage) {

    alert(message);

    return;
  }


  receiptMessage.hidden =
    false;

  receiptMessage.textContent =
    message;

  receiptMessage.className =
    "form-message " +
    (type || "success");
}


/* =====================================================
   LEER ARCHIVO COMO BASE64
===================================================== */

function fileToBase64(file) {

  return new Promise(
    function (resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(reader.result || "");

          const comma =
            result.indexOf(",");


          resolve(
            comma >= 0
              ? result.slice(comma + 1)
              : result
          );
        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "No se pudo leer el comprobante."
            )
          );

        };


      reader.readAsDataURL(file);

    }
  );
}


/* =====================================================
   ENVIAR COMPROBANTE
===================================================== */

async function uploadReceipt() {

  if (!currentReservationId) {

    showReceiptMessage(
      "Primero tenés que realizar una reserva.",
      "error"
    );

    return;
  }


  if (!receiptFile || !receiptFile.files.length) {

    showReceiptMessage(
      "Seleccioná el comprobante de pago.",
      "error"
    );

    return;
  }


  const file =
    receiptFile.files[0];


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];


  if (!allowedTypes.includes(file.type)) {

    showReceiptMessage(
      "Formato no permitido. Subí JPG, PNG, WEBP o PDF.",
      "error"
    );

    return;
  }


  /*
    Limitamos el archivo a 3 MB.
    Esto evita problemas con el tamaño
    de la petición hacia Vercel.
  */

  if (file.size > 3 * 1024 * 1024) {

    showReceiptMessage(
      "El comprobante no puede superar los 3 MB.",
      "error"
    );

    return;
  }


  const originalText =
    receiptButton
      ? receiptButton.innerHTML
      : "Enviar comprobante";


  if (receiptButton) {

    receiptButton.disabled =
      true;

    receiptButton.innerHTML =
      "Enviando comprobante...";
  }


  try {

    const base64 =
      await fileToBase64(file);


    const response =
      await fetch(
        "/api/upload-receipt",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body: JSON.stringify({

            public_id:
              currentReservationId,

            file_name:
              file.name,

            content_type:
              file.type,

            file_base64:
              base64

          })
        }
      );


    const text =
      await response.text();


    console.log(
      "RESPUESTA COMPROBANTE:",
      response.status,
      text
    );


    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch {

      data = {};

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "No se pudo enviar el comprobante."
      );
    }


    showReceiptMessage(
      "¡Comprobante recibido correctamente! Aguará revisará el pago y confirmará tu turno.",
      "success"
    );


    if (receiptFile) {
      receiptFile.value = "";
    }


    if (receiptButton) {

      receiptButton.innerHTML =
        "Comprobante enviado ✓";

    }


  } catch (error) {

    console.error(
      "ERROR ENVIANDO COMPROBANTE:",
      error
    );


    showReceiptMessage(
      error.message ||
      "No se pudo enviar el comprobante.",
      "error"
    );


    if (receiptButton) {

      receiptButton.disabled =
        false;

      receiptButton.innerHTML =
        originalText;

    }

  }

}


/* =====================================================
   BOTÓN DEL COMPROBANTE
===================================================== */

if (receiptButton) {

  receiptButton.addEventListener(
    "click",
    function () {

      uploadReceipt();

    }
  );
}


/* =====================================================
  CREAR RESERVA
===================================================== */
@@ -385,10 +699,6 @@ async function createReservation() {
}


  /* -------------------------------------------------
     OBTENER DATOS
  ------------------------------------------------- */

const name =
nameInput
? nameInput.value.trim()
@@ -637,7 +947,7 @@ async function createReservation() {
data =
JSON.parse(texto);

    } catch (error) {
    } catch {

data = {};

@@ -657,6 +967,34 @@ async function createReservation() {
}


    /* =================================================
       GUARDAR PUBLIC_ID
    ================================================= */

    const reservaCreada =
      data.reserva || {};


    currentReservationId =
      reservaCreada.public_id ||
      data.public_id ||
      null;


    console.log(
      "RESERVA CREADA:",
      reservaCreada
    );


    if (!currentReservationId) {

      throw new Error(
        "La reserva se guardó, pero no recibimos el identificador de la reserva."
      );
    }


/* =================================================
      RESERVA CORRECTA
   ================================================= */
@@ -670,14 +1008,31 @@ async function createReservation() {
time +
". Seña requerida: " +
money(senaRequerida) +
      ".",
      ". Ahora podés enviar el comprobante.",

"success"
);


/* =================================================
       LIMPIAR FORMULARIO
       MOSTRAR COMPROBANTE
    ================================================= */

    if (receiptUpload) {

      receiptUpload.hidden =
        false;

      receiptUpload.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }


    /* =================================================
       LIMPIAR DATOS DE RESERVA
   ================================================= */

if (nameInput) {
