// Servidor estático para Railway (BH Inmobiliaria)
// Sirve index.html + assets en el puerto que Railway asigna via process.env.PORT
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// En desarrollo (sin NODE_ENV=production) el CSS se sirve sin caché para ver los rebuilds de Tailwind al instante.
const EN_PRODUCCION = process.env.NODE_ENV === 'production';

// Servir archivos estáticos de esta carpeta (index.html, imágenes, etc.)
// En desarrollo: todo sin caché (cambiar una foto o el CSS se ve al instante).
// En producción: HTML sin caché, CSS/JS 1 día e imágenes 30 días.
app.use(express.static(__dirname, {
  etag: true,
  setHeaders(res, filePath) {
    if (!EN_PRODUCCION) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (filePath.endsWith('.html')) {
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
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BH Inmobiliaria corriendo en puerto ${PORT}`);
});
