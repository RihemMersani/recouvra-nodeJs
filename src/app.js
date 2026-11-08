const express = require('express');
const app = express();

app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.send('API Recouvra is running...');
});

// Route de santé (pour le test health.test.js)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- LA LIGNE CRUCIALE ---
app.use('/api', require('./routes/index'));

// Middleware de gestion des erreurs (si vous l'avez)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;