// =============================================================================
// GridSense AI - Centralized Error Handler Middleware
// Ensures clean, uniform error responses without leaking sensitive internals.
// =============================================================================

function errorHandler(err, req, res, next) {
  console.error('[API Error]', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: err.name || 'ServerError',
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
