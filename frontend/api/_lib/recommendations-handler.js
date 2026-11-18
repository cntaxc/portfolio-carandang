// Recommendations API for the Vercel deployment, backed by Supabase (Postgres).
//
//   GET  /api/recommendations  -> published recommendations, newest first
//   POST /api/recommendations  -> validate, profanity-check, rate-limit, save
//
// Security model:
// - Only this server code talks to the database. It authenticates with the
//   Supabase secret key from the SUPABASE_SECRET_KEY environment variable,
//   which lives in Vercel's server settings and is never sent to browsers.
// - The table has Row Level Security enabled with no public policies (see
//   docs/supabase-setup.sql), so the public Supabase URL alone can't read or
//   write it.
// - Visitor IPs are stored only as a salted SHA-256 hash, used for the rate
//   limit, and are never returned by the API.
//
// Mirrors the Express backend in backend/server.js (same limits and messages).

'use strict';

const { createHash, randomUUID } = require('node:crypto');
const {
  findProfaneFields,
  PROFANITY_REJECTION_MESSAGE,
} = require('./profanity-filter.js');

const TABLE = 'recommendations';
const PUBLIC_COLUMNS = 'id,author,role,organization,context,message,published_at';
const MAX_RESULTS = 200;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const FIELD_LIMITS = {
  name: 100,
  role: 100,
  organization: 120,
  context: 160,
  message: 2000,
};

function normalizeSingleLine(value) {
  return typeof value === 'string'
    ? value.replace(/[\r\n]+/g, ' ').trim()
    : '';
}

function readFields(body) {
  const source =
    body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  return {
    name: normalizeSingleLine(source.name),
    role: normalizeSingleLine(source.role),
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

function parseBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      return null;
    }
  }
  return body;
}

function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || '').split(',')[0];
  return first.trim() || String(req.headers?.['x-real-ip'] || '') || 'unknown';
}

function toPublicRecord(row) {
  return {
    id: row.id,
    author: row.author,
    role: row.role || '',
    organization: row.organization,
    context: row.context,
    message: row.message,
    publishedAt: new Date(row.published_at).toISOString(),
  };
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/**
 * Creates the request handler. `env` and `fetchImpl` are injectable so the
 * handler can be tested without a real database.
 */
function createRecommendationsHandler({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
} = {}) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const secretKey = String(
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || ''
  ).trim();
  const ipSalt = String(env.IP_HASH_SALT || secretKey);

  // New-style Supabase secret keys (sb_secret_...) go in the apikey header
  // only; legacy service_role keys are JWTs and also need Authorization.
  const authHeaders = secretKey.startsWith('sb_')
    ? { apikey: secretKey }
    : { apikey: secretKey, Authorization: `Bearer ${secretKey}` };

  async function database(path, { method = 'GET', body, prefer } = {}) {
    const response = await fetchImpl(`${supabaseUrl}/rest/v1/${path}`, {
      method,
      headers: {
        ...authHeaders,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Supabase ${method} ${path} -> ${response.status} ${detail}`);
    }
    return response.status === 204 ? null : response.json();
  }

  async function listPublished() {
    const rows = await database(
      `${TABLE}?select=${PUBLIC_COLUMNS}&order=published_at.desc&limit=${MAX_RESULTS}`
    );
    return rows.map(toPublicRecord);
  }

  async function isRateLimited(ipHash) {
    const since = new Date(now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const rows = await database(
      `${TABLE}?select=id&ip_hash=eq.${ipHash}&published_at=gte.${encodeURIComponent(
        since
      )}&limit=${RATE_LIMIT_MAX}`
    );
    return rows.length >= RATE_LIMIT_MAX;
  }

  return async function handler(req, res) {
    if (!supabaseUrl || !secretKey) {
      console.error(
        'Recommendations API is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY.'
      );
      sendJson(res, 503, { error: 'Recommendations are temporarily unavailable.' });
      return;
    }

    try {
      if (req.method === 'GET') {
        sendJson(res, 200, { recommendations: await listPublished() });
        return;
      }

      if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        sendJson(res, 405, { error: 'Method not allowed.' });
        return;
      }

      const body = parseBody(req.body);
      if (body === null) {
        sendJson(res, 400, { error: 'Request must contain valid JSON.' });
        return;
      }

      const fields = readFields(body);
      if (!fieldsAreValid(fields)) {
        sendJson(res, 400, {
          error:
            'Please provide a name, role, organization or company, work or project context, and recommendation within the allowed lengths.',
        });
        return;
      }

      const profaneFields = findProfaneFields(fields);
      if (profaneFields.length) {
        console.warn(
          `Recommendation rejected by the profanity filter (fields: ${profaneFields.join(', ')}).`
        );
        sendJson(res, 422, { error: PROFANITY_REJECTION_MESSAGE, rejected: true });
        return;
      }

      const ipHash = createHash('sha256')
        .update(`${ipSalt}:${clientIp(req)}`)
        .digest('hex');
      if (await isRateLimited(ipHash)) {
        sendJson(res, 429, {
          error: 'Too many recommendations. Please try again later.',
        });
        return;
      }

      const [row] = await database(TABLE, {
        method: 'POST',
        prefer: 'return=representation',
        body: {
          id: randomUUID(),
          author: fields.name,
          role: fields.role,
          organization: fields.organization,
          context: fields.context,
          message: fields.message,
          published_at: new Date(now()).toISOString(),
          ip_hash: ipHash,
        },
      });
      sendJson(res, 201, { recommendation: toPublicRecord(row) });
    } catch (error) {
      console.error('Recommendations API error:', error.message);
      sendJson(res, 500, {
        error: 'Recommendations are temporarily unavailable. Please try again later.',
      });
    }
  };
}

module.exports = { createRecommendationsHandler };
