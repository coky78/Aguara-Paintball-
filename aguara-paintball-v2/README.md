# Aguará Paintball — V2 reservas reales

Esta versión agrega una arquitectura de producción para:
- disponibilidad por fecha/horario;
- mínimo de jugadores;
- creación de reserva pendiente;
- Mercado Pago Checkout Pro;
- confirmación por Webhook;
- bloqueo de horario mediante restricción única en Supabase;
- aviso automático al WhatsApp del administrador;
- panel administrativo como siguiente capa.

## Configuración necesaria
1. Crear proyecto Supabase.
2. Ejecutar `supabase-schema.sql`.
3. Crear aplicación de Mercado Pago y configurar Checkout Pro.
4. Configurar el Webhook de Mercado Pago apuntando a `/api/webhook`. Mercado Pago recomienda Webhooks para recibir cambios de estado en tiempo real y validar su autenticidad mediante firma secreta. Ver documentación oficial.
5. Crear/configurar WhatsApp Cloud API.
6. Copiar `.env.example` a variables de entorno de Vercel y completar los valores.
7. Ejecutar `npm install` y desplegar en Vercel.

## Importante
No coloques tokens, claves secretas ni credenciales en `index.html` o `script.js`. Deben permanecer en variables de entorno del servidor.

La confirmación real ocurre en el backend al recibir la notificación de pago. El horario queda protegido por la restricción única `(booking_date, booking_time)`.
