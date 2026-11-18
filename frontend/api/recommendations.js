// Vercel serverless function: /api/recommendations
// Logic lives in _lib/recommendations-handler.js (files under _lib are not
// deployed as separate endpoints). Needs SUPABASE_URL and SUPABASE_SECRET_KEY
// in the Vercel project's environment variables.
import { createRecommendationsHandler } from './_lib/recommendations-handler.js';

export default createRecommendationsHandler();
