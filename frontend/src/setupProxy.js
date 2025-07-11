// frontend/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_TARGET = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

module.exports = function(app) {
  // Proxy para los endpoints de autenticación
  app.use(
    '/auth',
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/auth': '/api/auth' }
    })
  );

  // Proxy para los parámetros del sistema
  app.use(
    '/params',
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/params': '/api/params' }
    })
  );
};
