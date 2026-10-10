// Servidor estático para Railway (BH Inmobiliaria)
// Sirve index.html + assets en el puerto que Railway asigna via process.env.PORT
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos de esta carpeta (index.html, imágenes, etc.)
app.use(express.static(__dirname, { maxAge: '1d' }));

// Fallback SPA: cualquier ruta devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BH Inmobiliaria corriendo en puerto ${PORT}`);
});
