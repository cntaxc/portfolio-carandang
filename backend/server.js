// Portfolio backend: stores and serves recommendations.
//
//   GET  /health               -> service status
//   GET  /api/recommendations  -> published recommendations, newest first
//   POST /api/recommendations  -> validate, profanity-check and publish

import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  findProfaneFields,
  PROFANITY_REJECTION_MESSAGE,
} from './lib/profanity-filter.js';
import { createRecommendationStore } from './lib/recommendation-store.js';

const port = Number(process.env.PORT || 8000);
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedDevelopmentOrigin = /^http:\/\/(localhost|127\.0\.0\.1):3\d{3}$/;
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const recommendationDataFile =
  process.env.RECOMMENDATIONS_DATA_FILE?.trim() ||
  path.join(moduleDirectory, 'data', 'recommendations.json');

const FIELD_LIMITS = {
  name: 100,
  organization: 120,
  context: 160,
  message: 2000,
};

function normalizeSingleLine(value) {
  return typeof value === 'string'
    ? value.replace(/[\r\n]+/g, ' ').trim()
    : '';
}

function readRecommendationFields(body) {
  const source =
    body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  return {
    name: normalizeSingleLine(source.name),
    organization: normalizeSingleLine(source.organization),
    context: normalizeSingleLine(source.context),
    message: typeof source.message === 'string' ? source.message.trim() : '',
  };
}

function fieldsAreValid(fields) {
  return Object.entries(FIELD_LIMITS).every(
    ([field, limit]) => fields[field] && fields[field].length <= limit
  );
}

const recommendationStore = createRecommendationStore({
  filePath: recommendationDataFile,
});

try {
  await recommendationStore.init();
} catch (error) {
  console.error(
    `Recommendation data could not be initialized at ${recommendationDataFile}:`,
    error.message
  );
  process.exit(1);
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// In development the React dev server proxies /api, but direct calls from a
// local dev origin are also allowed. Production is same-origin behind Nginx.
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (!isDevelopment || !origin) {
    next();
    return;
  }

  if (!allowedDevelopmentOrigin.test(origin)) {
    res.status(403).json({ error: 'Origin is not allowed.' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: '12kb', type: 'application/json' }));

const recommendationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many recommendations. Please try again later.' },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, recommendationStoreReady: true });
});

app.get('/api/recommendations', async (_req, res) => {
  try {
    const recommendations = await recommendationStore.listPublished();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ recommendations });
  } catch (error) {
    console.error('Published recommendations could not be loaded:', error);
    res.status(500).json({ error: 'Unable to load recommendations.' });
  }
});

app.post('/api/recommendations', recommendationLimiter, async (req, res) => {
  const fields = readRecommendationFields(req.body);

  if (!fieldsAreValid(fields)) {
    res.status(400).json({
      error:
        'Please provide a name, organization, work or project context, and recommendation within the allowed lengths.',
    });
    return;
  }

  const profaneFields = findProfaneFields(fields);
  if (profaneFields.length) {
    // Auto-rejected: never stored, so it cannot reach the published list.
    console.warn(
      `Recommendation rejected by the profanity filter (fields: ${profaneFields.join(
        ', '
      )}).`
    );
    res.status(422).json({ error: PROFANITY_REJECTION_MESSAGE, rejected: true });
    return;
  }

  try {
    const published = await recommendationStore.create({
      id: randomUUID(),
      author: fields.name,
      organization: fields.organization,
      context: fields.context,
      message: fields.message,
      publishedAt: new Date().toISOString(),
    });
    res.status(201).json({ recommendation: published });
  } catch (error) {
    console.error('Recommendation could not be published:', error);
    res.status(500).json({
      error: 'Recommendation could not be published. Please try again later.',
    });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request is too large.' });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'Request must contain valid JSON.' });
    return;
  }

  console.error('Backend request failed:', error.message);
  res.status(500).json({ error: 'Unable to process the request.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio backend listening on port ${port}.`);
});
