// Vercel serverless function: /api/chat (the portfolio AI assistant).
// Logic lives in _lib/chat-handler.js. Needs ANTHROPIC_API_KEY in the Vercel
// project's environment variables (type: Secret). Rate limiting uses the
// Supabase variables too when they are set.
'use strict';

const { createChatHandler } = require('./_lib/chat-handler.js');

module.exports = createChatHandler();
