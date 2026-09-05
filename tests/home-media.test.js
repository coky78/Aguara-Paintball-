const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const publicScript = fs.readFileSync('home-media-public.js', 'utf8');
const adminScript = fs.readFileSync('home-media-admin.js', 'utf8');
const adminApi = fs.readFileSync('api/home-media.js', 'utf8');
const publicApi = fs.readFileSync('api/public-home-media.js', 'utf8');

for (const key of ['home_media_1','home_media_2','home_media_3','home_media_4','home_media_5','home_media_6']) {
  if (!adminScript.includes(key)) throw new Error(`home-media-admin.js no contiene ${key}`);
  if (!adminApi.includes(key)) throw new Error(`api/home-media.js no contiene ${key}`);
}
if (!publicScript.includes('homeMediaGrid')) throw new Error('home-media-public.js no renderiza la grilla');
if (!publicApi.includes('media_library')) throw new Error('api/public-home-media.js no consulta media_library');
if (!index.includes('id="homeMediaSection"')) throw new Error('index.html no tiene la sección multimedia de portada');
if (!index.includes('id="homeMediaGrid"')) throw new Error('index.html no tiene la grilla multimedia de portada');
if (!index.includes('home-media-public.js')) throw new Error('index.html no carga el renderizador de portada');

// A missing home_media_N row is valid for an empty slot. The API must not
// request a singular representation from an UPDATE/UPSERT that can yield 0 rows.
if (adminApi.includes('.upsert(payload,{onConflict:"slot_key"}).select().single()')) {
  throw new Error('finalize usa .single() después de upsert y falla cuando Supabase devuelve 0 filas');
}
if (adminApi.includes('.update(updates).eq("slot_key",slotKey).select().single()')) {
  throw new Error('PATCH usa .single() y falla cuando el espacio todavía no tiene fila');
}
if (!adminApi.includes('.maybeSingle()')) throw new Error('home-media API debe usar maybeSingle para búsquedas opcionales');
if (!adminApi.includes('home_media_3')) throw new Error('home-media API debe admitir Momento 2');

console.log('home-media tests passed');
