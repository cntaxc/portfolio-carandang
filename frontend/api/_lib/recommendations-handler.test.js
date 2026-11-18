// Run with: node --test api/
// Exercises the Vercel recommendations function against an in-memory fake of
// the Supabase REST API, so no database or network is needed.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecommendationsHandler } from './recommendations-handler.js';

const ENV = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
};

function createFakeSupabase() {
  const rows = [];
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    const { pathname, searchParams } = new URL(url);
    assert.equal(pathname, '/rest/v1/recommendations');
    assert.equal(options.headers.apikey, ENV.SUPABASE_SECRET_KEY);
    const json = (status, body) => ({
      ok: status < 400,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    });

    if (options.method === 'POST') {
      const row = JSON.parse(options.body);
      rows.push(row);
      return json(201, [row]);
    }

    let result = rows.slice();
    const ipFilter = searchParams.get('ip_hash');
    if (ipFilter) {
      const since = searchParams.get('published_at').replace('gte.', '');
      result = result.filter(
        (row) =>
          row.ip_hash === ipFilter.replace('eq.', '') &&
          row.published_at >= since
      );
    }
    result.sort((a, b) => b.published_at.localeCompare(a.published_at));
    const columns = searchParams.get('select').split(',');
    return json(
      200,
      result.map((row) =>
        Object.fromEntries(columns.map((column) => [column, row[column]]))
      )
    );
  };
  return { rows, calls, fetchImpl };
}

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(payload) {
      this.body = JSON.parse(payload);
    },
  };
}

async function call(handler, { method = 'GET', body, ip = '203.0.113.7' } = {}) {
  const res = createResponse();
  await handler({ method, body, headers: { 'x-forwarded-for': ip } }, res);
  return res;
}

const validBody = {
  name: 'Ana Reyes',
  organization: 'Kamote Studios',
  context: 'Game jam teammate',
  message: 'Reliable and creative developer.',
};

test('publishes a valid recommendation and lists it', async () => {
  const db = createFakeSupabase();
  const handler = createRecommendationsHandler({ env: ENV, fetchImpl: db.fetchImpl });

  const created = await call(handler, { method: 'POST', body: validBody });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.recommendation.author, 'Ana Reyes');
  assert.ok(created.body.recommendation.publishedAt);

  const listed = await call(handler);
  assert.equal(listed.statusCode, 200);
  assert.equal(listed.body.recommendations.length, 1);
  assert.equal(listed.headers['cache-control'], 'no-store');
});

test('never exposes the stored IP hash, and never stores the raw IP', async () => {
  const db = createFakeSupabase();
  const handler = createRecommendationsHandler({ env: ENV, fetchImpl: db.fetchImpl });
  await call(handler, { method: 'POST', body: validBody, ip: '198.51.100.23' });

  assert.match(db.rows[0].ip_hash, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(db.rows).includes('198.51.100.23'));
  const listed = await call(handler);
  assert.equal('ip_hash' in listed.body.recommendations[0], false);
});

test('rejects profanity with 422 and stores nothing', async () => {
  const db = createFakeSupabase();
  const handler = createRecommendationsHandler({ env: ENV, fetchImpl: db.fetchImpl });
  const res = await call(handler, {
    method: 'POST',
    body: { ...validBody, message: 'Galing mo pero g4g0 ka' },
  });
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.rejected, true);
  assert.equal(db.rows.length, 0);
});

test('rejects missing or too-long fields with 400', async () => {
  const db = createFakeSupabase();
  const handler = createRecommendationsHandler({ env: ENV, fetchImpl: db.fetchImpl });
  assert.equal((await call(handler, { method: 'POST', body: { name: 'A' } })).statusCode, 400);
  assert.equal(
    (await call(handler, { method: 'POST', body: { ...validBody, message: 'x'.repeat(2001) } }))
      .statusCode,
    400
  );
  assert.equal((await call(handler, { method: 'POST', body: '{bad json' })).statusCode, 400);
  assert.equal(db.rows.length, 0);
});

test('rate-limits to 5 submissions per 15 minutes per visitor', async () => {
  const db = createFakeSupabase();
  let clock = Date.parse('2026-11-18T10:00:00Z');
  const handler = createRecommendationsHandler({
    env: ENV,
    fetchImpl: db.fetchImpl,
    now: () => clock,
  });

  for (let i = 0; i < 5; i += 1) {
    clock += 1000;
    assert.equal((await call(handler, { method: 'POST', body: validBody })).statusCode, 201);
  }
  assert.equal((await call(handler, { method: 'POST', body: validBody })).statusCode, 429);
  // A different visitor is unaffected.
  assert.equal(
    (await call(handler, { method: 'POST', body: validBody, ip: '192.0.2.99' })).statusCode,
    201
  );
  // After the window passes, the first visitor can post again.
  clock += 16 * 60 * 1000;
  assert.equal((await call(handler, { method: 'POST', body: validBody })).statusCode, 201);
});

test('only GET and POST are allowed', async () => {
  const db = createFakeSupabase();
  const handler = createRecommendationsHandler({ env: ENV, fetchImpl: db.fetchImpl });
  const res = await call(handler, { method: 'DELETE' });
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'GET, POST');
});

test('returns 503 without leaking details when not configured', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const handler = createRecommendationsHandler({ env: {}, fetchImpl: () => assert.fail() });
    const res = await call(handler);
    assert.equal(res.statusCode, 503);
    assert.ok(!JSON.stringify(res.body).includes('SUPABASE'));
  } finally {
    console.error = originalError;
  }
});

test('returns 500 with a generic message when the database fails', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const handler = createRecommendationsHandler({
      env: ENV,
      fetchImpl: async () => ({ ok: false, status: 500, text: async () => 'db down' }),
    });
    const res = await call(handler);
    assert.equal(res.statusCode, 500);
    assert.ok(!JSON.stringify(res.body).includes('db down'));
  } finally {
    console.error = originalError;
  }
});
