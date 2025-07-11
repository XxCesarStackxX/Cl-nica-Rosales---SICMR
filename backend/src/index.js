// backend/src/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const { authenticate, isAdmin } = require('./middlewares/auth.middleware');
const Parametro = require('./models/parametro.model');

const app = express();

// — Configuración de CORS —
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// — Seguridad HTTP —
app.use(helmet());

// — Logger de peticiones —
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// — Parsers de cuerpo —
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// — Sanitización básica contra XSS —
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach((loc) => {
    if (req[loc] && typeof req[loc] === 'object') {
      Object.keys(req[loc]).forEach((key) => {
        if (typeof req[loc][key] === 'string') {
          // eslint-disable-next-line no-param-reassign
          req[loc][key] = xss(req[loc][key]);
        }
      });
    }
  });
  next();
});

// — Limitador de peticiones para /api/auth —
const authLimiter =
  process.env.NODE_ENV === 'production'
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: 'Too many requests, please try again later.' },
      })
    : (req, res, next) => next(); // desactiva limitador en desarrollo  

// — Montaje de rutas API —
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', authenticate, isAdmin, adminRoutes);

app.get('/api/params/:key', async (req, res) => {
  try {
    const parametro = await Parametro.findOne({
      where: { atr_parametro: req.params.key },
    });
    if (!parametro) {
      return res.status(404).json({ error: 'Parameter not found' });
    }

    return res.json({ value: parametro.atr_valor });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// — Servir front-end estático —
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.get('*', (req, res, next) => {
  // Si la ruta empieza con /api, continuamos al siguiente handler
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Cualquier otra ruta devuelve el index de React
  return res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// — Handler 404 para rutas API no encontradas —
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// — Handler global de errores —
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res
    .status(err.statusCode || 500)
    .json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// — Inicio de servidor y conexión DB —
const PORT = parseInt(process.env.PORT, 10) || 5000;

sequelize
  .authenticate()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('✅ Base de datos Conectada');
    if (process.env.NODE_ENV === 'development') {
      return sequelize.sync();
    }
    return null;
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('🔃 Modelos Sincronisados');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server Corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('❌ Error en el inicio del servidor:', error);
    process.exit(1);
  });
