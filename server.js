// Servidor estático para Railway (BH Inmobiliaria)
// Sirve index.html + assets en el puerto que Railway asigna via process.env.PORT
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
// En desarrollo (sin NODE_ENV=production) todo se sirve sin caché para ver los cambios al instante.
const EN_PRODUCCION = process.env.NODE_ENV === 'production';

// ------------------------------------------------------------------
// Versionado automático de assets (?v=...)
// El HTML se sirve con la versión calculada desde el CONTENIDO real de
// cada archivo, así cada build invalida la caché de forma automática y
// no hace falta editar index.html a mano cada vez que cambia el CSS
// o una foto (si no, el navegador serviría la versión en caché).
// ------------------------------------------------------------------
const cacheVersion = new Map(); // ruta -> {mtimeMs, hash}
function versionDe(ruta) {
  try {
    const st = fs.statSync(ruta);
    const previa = cacheVersion.get(ruta);
    if (previa && previa.mtimeMs === st.mtimeMs) return previa.hash;
    const hash = crypto.createHash('md5').update(fs.readFileSync(ruta)).digest('hex').slice(0, 8);
    cacheVersion.set(ruta, { mtimeMs: st.mtimeMs, hash });
    return hash;
  } catch (_) {
    return '0';
  }
}

function versionarHtml(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (m, attr, valor) => {
    // Solo archivos locales con extensión de asset (nada de enlaces, anclas, CDNs ni data URIs)
    if (/^(https?:)?\/\//i.test(valor) || /^(data:|#|mailto:|tel:)/i.test(valor)) return m;
    const ruta = valor.split('?')[0].split('#')[0];
    if (!/\.(css|js|webp|jpe?g|png|jfif|svg|ico)$/i.test(ruta)) return m;
    const abs = path.join(__dirname, ruta.replace(/^\/+/, ''));
    if (!fs.existsSync(abs)) return m;
    return `${attr}="${ruta}?v=${versionDe(abs)}"`;
  });
}

let cacheIndex = { mtimeMs: 0, html: null };
function leerIndex() {
  const ruta = path.join(__dirname, 'index.html');
  const st = fs.statSync(ruta);
  if (!cacheIndex.html || cacheIndex.mtimeMs !== st.mtimeMs) {
    cacheIndex = { mtimeMs: st.mtimeMs, html: fs.readFileSync(ruta, 'utf8') };
  }
  return cacheIndex.html;
}

function enviarIndex(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.send(versionarHtml(leerIndex()));
}

// HTML generado al momento (para inyectar las versiones)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path === '/' || req.path.endsWith('.html')) {
    try { return enviarIndex(res); } catch (e) { return next(e); }
  }
  next();
});

// Servir archivos estáticos de esta carpeta (fotos, CSS, etc.)
// En desarrollo: todo sin caché (cambiar una foto o el CSS se ve al instante).
// En producción: CSS/JS 1 día e imágenes 30 días (la versión ?v= ya garantiza ver lo nuevo).
app.use(express.static(__dirname, {
  etag: true,
  setHeaders(res, filePath) {
    if (!EN_PRODUCCION) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// Fallback SPA: cualquier ruta devuelve index.html
app.get('*', (req, res) => {
  try { enviarIndex(res); } catch (e) { res.status(500).send('Error al cargar la página'); }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BH Inmobiliaria corriendo en puerto ${PORT}`);
});
