// Vercel serverless function: /api/recommendations
// Logic lives in _lib/recommendations-handler.js (files under _lib are not
// deployed as separate endpoints). Needs SUPABASE_URL and SUPABASE_SECRET_KEY
// in the Vercel project's environment variables. CommonJS on purpose: Vercel
// loads plain .js functions as CommonJS.
'use strict';

const { createRecommendationsHandler } = require('./_lib/recommendations-handler.js');

module.exports = createRecommendationsHandler();
