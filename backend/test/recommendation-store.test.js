import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRecommendationStore } from '../lib/recommendation-store.js';

async function createTemporaryStore(t) {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'portfolio-recommendations-')
  );
  t.after(() => rm(directory, { force: true, recursive: true }));

  const filePath = path.join(directory, 'recommendations.json');
  const store = createRecommendationStore({ filePath });
  await store.init();

  return { filePath, store };
}

function createRecord(overrides = {}) {
  return {
    id: 'recommendation-1',
    author: 'Test Author',
    role: 'Lead Developer',
    organization: 'Test Organization',
    context: 'Test context',
    message: 'A recommendation for testing.',
    publishedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('creates the data file and persists published recommendations', async (t) => {
  const { filePath, store } = await createTemporaryStore(t);
  const recommendation = createRecord();

  await store.create(recommendation);

  const persisted = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(persisted.version, 2);
  assert.deepEqual(persisted.recommendations, [recommendation]);
  assert.deepEqual(await store.listPublished(), [recommendation]);
});

test('returns published recommendations in newest-first order', async (t) => {
  const { store } = await createTemporaryStore(t);

  await store.create(
    createRecord({
      id: 'older',
      publishedAt: '2026-01-01T00:00:00.000Z',
    })
  );
  await store.create(
    createRecord({
      id: 'newer',
      publishedAt: '2026-02-01T00:00:00.000Z',
    })
  );

  const published = await store.listPublished();
  assert.deepEqual(
    published.map((recommendation) => recommendation.id),
    ['newer', 'older']
  );
});

test('drops malformed records when loading the data file', async (t) => {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'portfolio-recommendations-')
  );
  t.after(() => rm(directory, { force: true, recursive: true }));

  const filePath = path.join(directory, 'recommendations.json');
  await writeFile(
    filePath,
    JSON.stringify({
      version: 2,
      recommendations: [
        createRecord({ id: 'valid' }),
        createRecord({ id: 'missing-message', message: '   ' }),
        { id: 'incomplete' },
        'not-an-object',
      ],
    }),
    'utf8'
  );

  const store = createRecommendationStore({ filePath });
  await store.init();

  const published = await store.listPublished();
  assert.deepEqual(
    published.map((recommendation) => recommendation.id),
    ['valid']
  );

  const persisted = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(persisted.recommendations.length, 1);
});

test('picks up changes made to the data file outside the server', async (t) => {
  const { filePath, store } = await createTemporaryStore(t);
  await store.create(createRecord({ id: 'keep' }));
  await store.create(createRecord({ id: 'remove-me' }));

  // Simulate a hand edit (or the management script) while the server runs.
  const external = createRecommendationStore({ filePath });
  await external.init();
  assert.equal((await external.remove('remove-me')).id, 'remove-me');

  assert.deepEqual(
    (await store.listPublished()).map((recommendation) => recommendation.id),
    ['keep']
  );
});

test('keeps serving the previous data if a hand edit breaks the file', async (t) => {
  const { filePath, store } = await createTemporaryStore(t);
  await store.create(createRecord({ id: 'still-here' }));
  const originalError = console.error;
  console.error = () => {};
  t.after(() => {
    console.error = originalError;
  });

  await writeFile(filePath, '{ not valid json', 'utf8');

  assert.deepEqual(
    (await store.listPublished()).map((recommendation) => recommendation.id),
    ['still-here']
  );
});

test('removes one recommendation or clears all of them', async (t) => {
  const { store } = await createTemporaryStore(t);
  await store.create(createRecord({ id: 'a' }));
  await store.create(createRecord({ id: 'b' }));

  assert.equal(await store.remove('missing'), null);
  assert.equal((await store.remove('a')).id, 'a');
  assert.equal(await store.clear(), 1);
  assert.deepEqual(await store.listPublished(), []);
});

test('keeps entries published before the role field existed', async (t) => {
  const { store } = await createTemporaryStore(t);
  const { role, ...legacy } = createRecord({ id: 'legacy-1' });
  assert.ok(role);
  await store.create(legacy);
  const [saved] = await store.listPublished();
  assert.equal(saved.id, 'legacy-1');
  assert.equal(saved.role, '');
});
