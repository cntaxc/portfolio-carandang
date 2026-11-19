// Run with: npm run test:api
// Tests /api/likes with a fake Supabase (or the in-memory store), so no
// database or network is needed.
'use strict';

const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const test = require('node:test');
const { createLikesHandler } = require('./likes-handler.js');

const VISITOR_A = '11111111-2222-4333-8444-555555555555';
const VISITOR_B = '99999999-8888-4777-8666-555555555555';

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(chunk) {
      if (chunk) this.body += chunk;
    },
    json() {
      return JSON.parse(this.body);
    },
  };
}

async function call(handler, { method = 'GET', url = '/api/likes', body, ip = '203.0.113.5', raw = false } = {}) {
  const headers = { 'x-forwarded-for': ip };
  const req = raw
    ? Object.assign(Readable.from([Buffer.from(JSON.stringify(body))]), { method, url, headers })
    : { method, url, body, headers };
  const res = createResponse();
  await handler(req, res);
  return res;
}

const like = (handler, assetId, visitorId, liked = true, ip) =>
  call(handler, { method: 'POST', body: { assetId, visitorId, liked }, ip });

// Minimal fake of the Supabase REST endpoints the handler uses.
function fakeSupabase() {
  const rows = [];
  const fetchImpl = async (url, options = {}) => {
    const { pathname, searchParams } = new URL(url);
    const table = pathname.split('/').pop();
    const eq = (name) => searchParams.get(name)?.replace(/^eq\./, '');
    const ok = (data, status = 200) => ({ ok: true, status, json: async () => data, text: async () => '' });
    if (options.method === 'POST') {
      const row = JSON.parse(options.body);
      if (!rows.some((r) => r.asset_id === row.asset_id && r.visitor_hash === row.visitor_hash)) rows.push(row);
      return ok(null, 201);
    }
    if (options.method === 'DELETE') {
      for (let i = rows.length - 1; i >= 0; i -= 1) {
        if (rows[i].asset_id === eq('asset_id') && rows[i].visitor_hash === eq('visitor_hash')) rows.splice(i, 1);
      }
      return ok(null, 204);
    }
    if (table === 'asset_like_counts') {
      const counts = {};
      for (const r of rows) counts[r.asset_id] = (counts[r.asset_id] || 0) + 1;
      const all = Object.entries(counts).map(([asset_id, likes]) => ({ asset_id, likes }));
      return ok(eq('asset_id') ? all.filter((r) => r.asset_id === eq('asset_id')) : all);
    }
    return ok(rows.filter((r) => r.visitor_hash === eq('visitor_hash')).map((r) => ({ asset_id: r.asset_id })));
  };
  return { rows, fetchImpl };
}

const SUPABASE_ENV = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_x' };

test('like, count and unlike with Supabase; one like per visitor', async () => {
  const db = fakeSupabase();
  const handler = createLikesHandler({ env: SUPABASE_ENV, fetchImpl: db.fetchImpl });

  assert.equal((await like(handler, 'gocart-vehicle', VISITOR_A)).json().count, 1);
  assert.equal((await like(handler, 'gocart-vehicle', VISITOR_A)).json().count, 1, 'double like ignored');
  assert.equal((await like(handler, 'gocart-vehicle', VISITOR_B)).json().count, 2);

  const listed = (await call(handler, { url: `/api/likes?visitor=${VISITOR_A}` })).json();
  assert.deepEqual(listed.counts, { 'gocart-vehicle': 2 });
  assert.deepEqual(listed.liked, ['gocart-vehicle']);

  const unliked = (await like(handler, 'gocart-vehicle', VISITOR_A, false)).json();
  assert.deepEqual(unliked, { assetId: 'gocart-vehicle', liked: false, count: 1 });
});

test('never stores raw visitor ids or IPs', async () => {
  const db = fakeSupabase();
  const handler = createLikesHandler({ env: SUPABASE_ENV, fetchImpl: db.fetchImpl });
  await like(handler, 'vintagepc-props', VISITOR_A, true, '198.51.100.77');
  const stored = JSON.stringify(db.rows);
  assert.ok(!stored.includes(VISITOR_A));
  assert.ok(!stored.includes('198.51.100.77'));
  assert.match(db.rows[0].visitor_hash, /^[a-f0-9]{64}$/);
});

test('rejects invalid requests', async () => {
  const handler = createLikesHandler({ env: {}, allowMemoryStore: true });
  for (const body of [
    {},
    { assetId: 'Bad Id!', visitorId: VISITOR_A, liked: true },
    { assetId: 'gocart-vehicle', visitorId: 'short', liked: true },
    { assetId: 'gocart-vehicle', visitorId: VISITOR_A, liked: 'yes' },
  ]) {
    assert.equal((await call(handler, { method: 'POST', body })).statusCode, 400, JSON.stringify(body));
  }
  assert.equal((await call(handler, { method: 'DELETE' })).statusCode, 405);
});

test('rate-limits rapid toggling per IP', async () => {
  const handler = createLikesHandler({ env: {}, allowMemoryStore: true, now: () => 1000 });
  let last;
  for (let i = 0; i < 41; i += 1) last = await like(handler, 'gocart-vehicle', VISITOR_A, i % 2 === 0);
  assert.equal(last.statusCode, 429);
  assert.equal((await like(handler, 'gocart-vehicle', VISITOR_B, true, '192.0.2.9')).statusCode, 200);
});

test('works with a raw request body (local dev server) and the memory store', async () => {
  const handler = createLikesHandler({ env: {}, allowMemoryStore: true });
  const res = await call(handler, {
    method: 'POST',
    raw: true,
    body: { assetId: 'sorbetero-environment', visitorId: VISITOR_A, liked: true },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().count, 1);
});

test('returns 503 in production when the database is not configured', async (t) => {
  const { error } = console;
  console.error = () => {};
  t.after(() => {
    console.error = error;
  });
  const handler = createLikesHandler({ env: {} });
  assert.equal((await call(handler)).statusCode, 503);
});
