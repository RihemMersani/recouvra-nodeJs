const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', require('./routes/views.routes'));

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