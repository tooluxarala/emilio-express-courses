export function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${err.stack || err.message}`);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    status: statusCode,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: message
  });
}
