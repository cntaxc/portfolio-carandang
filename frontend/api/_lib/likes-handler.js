// Likes for the free downloadable assets: /api/likes
//
//   GET  /api/likes?visitor=<id>
//        -> { counts: { "<assetId>": 12, ... }, liked: ["<assetId>", ...] }
//   POST /api/likes  { "assetId": "...", "visitorId": "...", "liked": true|false }
//        -> { assetId, liked, count }
//
// A visitor is an anonymous random id the browser keeps in localStorage. One
// like per visitor per asset (enforced by the table's primary key). The
// visitor id and IP are stored only as salted SHA-256 hashes.
//
// Storage: Supabase table `asset_likes` and view `asset_like_counts` (see
// docs/supabase-setup.sql), using the same SUPABASE_URL / SUPABASE_SECRET_KEY
// as the recommendations API. For local development without Supabase,
// `allowMemoryStore` keeps likes in memory instead.
'use strict';

const { createHash } = require('node:crypto');

const ASSET_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VISITOR_ID = /^[A-Za-z0-9-]{16,64}$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 40; // like/unlike toggles per visitor IP per window

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body !== 'string') return req.body;
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) return null;
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
  } catch (error) {
    return null;
  }
}

function queryParam(req, name) {
  if (req.query && typeof req.query[name] === 'string') return req.query[name];
  try {
    return new URL(req.url || '', 'http://localhost').searchParams.get(name) || '';
  } catch (error) {
    return '';
  }
}

function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0];
  return first.trim() || String(req.headers?.['x-real-ip'] || '') ||
    req.socket?.remoteAddress || 'unknown';
}

// ---------------------------------------------------------------------------
// Stores

function createSupabaseStore({ supabaseUrl, secretKey, fetchImpl }) {
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
    return response.status === 204 || response.status === 201 ? null : response.json();
  }

  return {
    async counts() {
      const rows = await database('asset_like_counts?select=asset_id,likes');
      return Object.fromEntries(rows.map((row) => [row.asset_id, Number(row.likes) || 0]));
    },
    async likedBy(visitorHash) {
      const rows = await database(`asset_likes?select=asset_id&visitor_hash=eq.${visitorHash}`);
      return rows.map((row) => row.asset_id);
    },
    async setLiked(assetId, visitorHash, ipHash, liked) {
      if (liked) {
        await database('asset_likes', {
          method: 'POST',
          prefer: 'resolution=ignore-duplicates,return=minimal',
          body: { asset_id: assetId, visitor_hash: visitorHash, ip_hash: ipHash },
        });
      } else {
        await database(
          `asset_likes?asset_id=eq.${assetId}&visitor_hash=eq.${visitorHash}`,
          { method: 'DELETE', prefer: 'return=minimal' }
        );
      }
    },
    async countFor(assetId) {
      const rows = await database(`asset_like_counts?select=likes&asset_id=eq.${assetId}`);
      return rows.length ? Number(rows[0].likes) || 0 : 0;
    },
  };
}

function createMemoryStore() {
  const likes = new Map(); // assetId -> Set(visitorHash)
  const setFor = (assetId) => {
    if (!likes.has(assetId)) likes.set(assetId, new Set());
    return likes.get(assetId);
  };
  return {
    async counts() {
      return Object.fromEntries([...likes].map(([id, visitors]) => [id, visitors.size]));
    },
    async likedBy(visitorHash) {
      return [...likes].filter(([, visitors]) => visitors.has(visitorHash)).map(([id]) => id);
    },
    async setLiked(assetId, visitorHash, ipHash, liked) {
      if (liked) setFor(assetId).add(visitorHash);
      else setFor(assetId).delete(visitorHash);
    },
    async countFor(assetId) {
      return likes.get(assetId)?.size || 0;
    },
  };
}

// ---------------------------------------------------------------------------

/**
 * Creates the request handler. Dependencies are injectable for tests;
 * `allowMemoryStore` is for the local dev server only.
 */
function createLikesHandler({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  allowMemoryStore = false,
} = {}) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const secretKey = String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const salt = String(env.IP_HASH_SALT || secretKey || 'local-dev');
  const store =
    supabaseUrl && secretKey
      ? createSupabaseStore({ supabaseUrl, secretKey, fetchImpl })
      : allowMemoryStore
        ? createMemoryStore()
        : null;
  const hash = (value) => createHash('sha256').update(`${salt}:${value}`).digest('hex');
  const recent = new Map(); // ipHash -> timestamps

  function isRateLimited(ipHash) {
    const since = now() - RATE_LIMIT_WINDOW_MS;
    const times = (recent.get(ipHash) || []).filter((time) => time > since);
    const limited = times.length >= RATE_LIMIT_MAX;
    if (!limited) times.push(now());
    recent.set(ipHash, times);
    return limited;
  }

  return async function handler(req, res) {
    if (!store) {
      console.error('Likes API is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY.');
      sendJson(res, 503, { error: 'Likes are temporarily unavailable.' });
      return;
    }

    try {
      if (req.method === 'GET') {
        const visitorId = queryParam(req, 'visitor');
        const [counts, liked] = await Promise.all([
          store.counts(),
          VISITOR_ID.test(visitorId) ? store.likedBy(hash(visitorId)) : [],
        ]);
        sendJson(res, 200, { counts, liked });
        return;
      }

      if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        sendJson(res, 405, { error: 'Method not allowed.' });
        return;
      }

      const body = await readBody(req);
      const assetId = typeof body?.assetId === 'string' ? body.assetId : '';
      const visitorId = typeof body?.visitorId === 'string' ? body.visitorId : '';
      if (!ASSET_ID.test(assetId) || !VISITOR_ID.test(visitorId) || typeof body?.liked !== 'boolean') {
        sendJson(res, 400, { error: 'Invalid like request.' });
        return;
      }

      const ipHash = hash(clientIp(req));
      if (isRateLimited(ipHash)) {
        sendJson(res, 429, { error: 'Too many likes at once. Please try again in a few minutes.' });
        return;
      }

      await store.setLiked(assetId, hash(visitorId), ipHash, body.liked);
      sendJson(res, 200, { assetId, liked: body.liked, count: await store.countFor(assetId) });
    } catch (error) {
      console.error('Likes API error:', error.message);
      sendJson(res, 500, { error: 'Likes are temporarily unavailable.' });
    }
  };
}

module.exports = { createLikesHandler };
