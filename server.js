// Servidor estático para Railway (BH Inmobiliaria)
// Sirve index.html + assets en el puerto que Railway asigna via process.env.PORT
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// En desarrollo (sin NODE_ENV=production) el CSS se sirve sin caché para ver los rebuilds de Tailwind al instante.
const EN_PRODUCCION = process.env.NODE_ENV === 'production';

// Servir archivos estáticos de esta carpeta (index.html, imágenes, etc.)
// HTML sin caché (siempre la última versión) y assets con caché largo.
app.use(express.static(__dirname, {
  etag: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', EN_PRODUCCION ? 'public, max-age=86400' : 'no-cache, must-revalidate');
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
