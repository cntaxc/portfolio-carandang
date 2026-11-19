// Vercel serverless function: /api/likes (likes on the free downloadable
// assets). Logic lives in _lib/likes-handler.js. Uses the same SUPABASE_URL
// and SUPABASE_SECRET_KEY environment variables as /api/recommendations.
'use strict';

const { createLikesHandler } = require('./_lib/likes-handler.js');

module.exports = createLikesHandler();
