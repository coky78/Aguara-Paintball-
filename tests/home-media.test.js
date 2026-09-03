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
console.log('home-media tests passed');
