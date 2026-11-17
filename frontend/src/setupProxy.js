// Create React App dev-server hook: forwards /api requests to the backend.
// In Docker the backend is reachable at http://backend:8000 (set via
// API_PROXY_TARGET in docker-compose.yml); locally it defaults to :8000.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware({
      pathFilter: '/api',
      target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};
