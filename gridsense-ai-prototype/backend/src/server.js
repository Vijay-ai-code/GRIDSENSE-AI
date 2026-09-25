// =============================================================================
// GridSense AI - Main Express API Server
// Production-structured API gateway with Helmet security, CORS, and modular routes.
// =============================================================================

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { initDb } = require('./db');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const predictionRoutes = require('./routes/predictionRoutes');
const gridRoutes = require('./routes/gridRoutes');
const alertRoutes = require('./routes/alertRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const modelRoutes = require('./routes/modelRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Security hardening with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allows flexible API usage
}));

// Cross-Origin Resource Sharing configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local dev prototype
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsing with strict size limit
app.use(express.json({ limit: '100kb' }));

// Request logging for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root API welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'GridSense AI API',
    version: '0.1.0',
    description: 'Grid Stability Risk Predictor for Renewable Energy Integration',
    status: 'ONLINE',
    docs: {
      predictions: '/api/predictions',
      grid_status: '/api/grid/status',
      grid_history: '/api/grid/history',
      alerts: '/api/alerts',
      assistant: '/api/assistant/query',
      model_info: '/api/model/info',
      health: '/api/system/health'
    }
  });
});

// Mount modular sub-routers
app.use('/api/predictions', predictionRoutes);
app.use('/api/grid', gridRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/model', modelRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/health', (req, res, next) => {
  // Alias to system health
  req.url = '/health';
  systemRoutes(req, res, next);
});

// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Initialize persistence layer and start HTTP listener
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  GridSense AI Backend Gateway running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start GridSense backend server:', err);
  process.exit(1);
});

module.exports = app;
