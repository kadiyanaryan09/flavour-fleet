// Centralized error handler. Controllers can call next(err) to land here,
// though most handle their own try/catch for clearer per-route messages.
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong on the server.' });
}

export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}
