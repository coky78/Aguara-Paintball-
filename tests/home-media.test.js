const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const mediaPublic = fs.readFileSync('media-public.js', 'utf8');
const adminMedia = fs.readFileSync('admin-media.js', 'utf8');
const adminApi = fs.readFileSync('api/admin-media.js', 'utf8');

for (const key of ['home_media_1','home_media_2','home_media_3','home_media_4']) {
  if (!adminMedia.includes(key)) throw new Error(`admin-media.js no contiene ${key}`);
  if (!adminApi.includes(key)) throw new Error(`api/admin-media.js no contiene ${key}`);
  if (!mediaPublic.includes(key)) throw new Error(`media-public.js no contiene ${key}`);
}
if (!index.includes('id="homeMediaGrid"')) throw new Error('index.html no tiene el contenedor de medios de portada');
if (!mediaPublic.includes('homeMediaGrid')) throw new Error('media-public.js no renderiza los medios de portada');
console.log('home-media tests passed');
