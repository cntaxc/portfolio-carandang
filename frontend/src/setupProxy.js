// Create React App dev-server hook.
// - /api/chat is served right here by the same handler Vercel runs
//   (api/chat.js), so the AI assistant works in local development. It reads
//   ANTHROPIC_API_KEY from frontend/.env.local (never exposed to the browser:
//   only REACT_APP_* variables reach the bundle).
// - /api/likes (free asset likes) is served here too, in memory unless the
//   Supabase variables are set.
// - Every other /api request is forwarded to the backend: in Docker at
//   http://backend:8000 (API_PROXY_TARGET in docker-compose.yml), locally :8000.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  try {
    // eslint-disable-next-line global-require
    const chatHandler = require('../api/chat.js');
    app.post('/api/chat', (req, res) => {
      chatHandler(req, res).catch((error) => {
        console.error('Local /api/chat failed:', error);
        if (!res.headersSent) {
          res.statusCode = 503;
          res.end();
        }
      });
    });
  } catch (error) {
    console.warn('AI assistant endpoint not available locally:', error.message);
  }

  try {
    // Likes on the free assets: the same handler Vercel runs. Uses Supabase
    // when SUPABASE_URL / SUPABASE_SECRET_KEY are set, otherwise memory.
    // eslint-disable-next-line global-require
    const { createLikesHandler } = require('../api/_lib/likes-handler.js');
    const likesHandler = createLikesHandler({ allowMemoryStore: true });
    app.all('/api/likes', (req, res) => {
      likesHandler(req, res).catch((error) => {
        console.error('Local /api/likes failed:', error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end();
        }
      });
    });
  } catch (error) {
    console.warn('Likes endpoint not available locally:', error.message);
  }

  app.use(
    createProxyMiddleware({
      pathFilter: '/api',
      target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};
