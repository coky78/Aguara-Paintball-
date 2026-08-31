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

La reserva se guarda con las columnas definidas en `supabase-schema.sql`. La combinación de fecha y horario es única, por lo que dos usuarios no pueden guardar el mismo turno simultáneamente.

La integración de Mercado Pago y el webhook de confirmación de pago no están implementados en este repositorio; no se presenta como una función activa hasta agregar esos endpoints y credenciales.
Restauración Aguará


## Edición de fotos y video desde Administración

El panel `admin.html` ahora permite reemplazar:
- video principal;
- foto 1;
- foto 2;
- foto 3;
- foto 4.

Los archivos se guardan en Supabase Storage, por lo que no es necesario modificar el código ni volver a subir el proyecto cada vez que se cambia una imagen o video.

### Activación única

1. Abrí el SQL Editor de tu proyecto de Supabase.
2. Ejecutá nuevamente el archivo `supabase-schema.sql` completo. La parte nueva crea la tabla `site_media`.
3. No hace falta crear manualmente el bucket `aguara-media`: la API lo crea automáticamente al primer guardado desde Administración.
4. Mantené configuradas en Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Entrá a `/admin.html`, iniciá sesión y usá la sección **Fotos y video**.

### Formatos

- Fotos: JPG, PNG, WEBP o GIF, hasta 12 MB.
- Video principal: MP4 o WEBM, hasta 80 MB.

El sitio público sigue usando los archivos originales de `assets/` si todavía no existe un reemplazo guardado en Supabase.
