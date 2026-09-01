# Aguará Paintball — reservas

Este proyecto incluye:
- sitio público responsive;
- formulario de reservas;
- API `/api/reservations` conectada a Supabase;
- bloqueo de fecha + horario mediante restricción única en Supabase;
- panel de administración con login y consulta de reservas;
- enlaces de WhatsApp.

## Configuración necesaria

1. Crear un proyecto de Supabase.
2. Ejecutar `supabase-schema.sql`.
3. Configurar en Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Desplegar el proyecto en Vercel.

## Importante

Las claves secretas deben permanecer en variables de entorno del servidor. No deben colocarse en `index.html` ni `script.js`.
Restauración del proyecto

La reserva se guarda con las columnas definidas en `supabase-schema.sql`. La combinación de fecha y horario es única, por lo que dos usuarios no pueden guardar el mismo turno simultáneamente.

La integración de Mercado Pago y el webhook de confirmación de pago no están implementados en este repositorio; no se presenta como una función activa hasta agregar esos endpoints y credenciales.
Restauración Aguará

<!-- deployment trigger after Telegram flow correction -->
NO FUNCIONA
