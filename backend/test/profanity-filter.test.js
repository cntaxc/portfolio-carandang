import assert from 'node:assert/strict';
import test from 'node:test';
import {
  containsProfanity,
  findProfaneFields,
} from '../lib/profanity-filter.js';

const blocked = [
  // English
  'fuck you',
  'What the FUCK',
  'f4ck y0u',
  'fvck this',
  'f*ck',
  'f.u.c.k',
  'f u c k you',
  'fuuuuuck',
  'youfuckingidiot',
  '@ssh0le',
  'a$$hole',
  'b1tch',
  'sh1t',
  '$h!t happens',
  '(f4ck)',
  'bullsh1t',
  'motherfucker',
  'Fúck',
  // Tagalog / Filipino
  'tangina',
  't4ng1n4',
  'tangina mo',
  'Tang ina mo',
  'putang ina',
  'puta ng ina mo',
  'p0t4ng1n4',
  'gago ka',
  'g4g0',
  'Gago!',
  'bobo',
  'b0b0',
  'ang bobo mo',
  'tanga',
  't@ng@',
  'ulol',
  'tarantado',
  'pakyu',
  'punyeta',
  'hayop ka',
  'kingina',
  't a n g i n a',
  // Spanish
  'pendejo',
  'mierda',
];

const allowed = [
  'Christian is a dedicated and reliable developer.',
  'Graduated magna cum laude with a BS in Computer Science.',
  'We worked together at Scunthorpe United on a class project.',
  'An assassin-level debugger who can assess any problem.',
  'He helped me pass the assignment and assisted the whole team.',
  'Ang batang inaasahan ng lahat.',
  'Salamat po, naku po ang galing!',
  'Built a cocktail ordering app and a peacock-themed UI.',
  'Shiitake mushroom inventory system',
  'F. K. Santos, Project Lead',
  'Released version 2.0.1 in 2024 with 100% uptime.',
  'Contact: hello@example.com, #teamwork',
  'Kamote Studios',
  'Hackathon',
  'Tanghalian meeting at the office',
  'Bobby Reyes',
  'Great work on the class assignment!',
  'Ta nga, sige.',
];

for (const text of blocked) {
  test(`blocks: ${JSON.stringify(text)}`, () => {
    assert.equal(containsProfanity(text), true);
  });
}

for (const text of allowed) {
  test(`allows: ${JSON.stringify(text)}`, () => {
    assert.equal(containsProfanity(text), false);
  });
}

test('handles empty and non-string input', () => {
  assert.equal(containsProfanity(''), false);
  assert.equal(containsProfanity('   '), false);
  assert.equal(containsProfanity(undefined), false);
  assert.equal(containsProfanity(42), false);
});

test('reports which fields contain profanity', () => {
  assert.deepEqual(
    findProfaneFields({
      name: 'Juan Dela Cruz',
      organization: 'Gago Corp',
      context: 'Hackathon',
      message: 'Great teammate, f4ck yeah!',
    }),
    ['organization', 'message']
  );
  assert.deepEqual(
    findProfaneFields({
      name: 'Juan Dela Cruz',
      organization: 'Acme',
      context: 'Hackathon',
      message: 'Great teammate!',
    }),
    []
  );
});

test('stays fast on long, adversarial input', () => {
  const started = Date.now();
  containsProfanity('1!|'.repeat(700));
  containsProfanity('a '.repeat(1000));
  assert.ok(Date.now() - started < 500);
});

test('Vercel API copy of the filter is up to date', async () => {
  const { readFile } = await import('node:fs/promises');
  const { SOURCE, TARGET, toCommonJs } = await import(
    '../scripts/sync-profanity-filter.js'
  );
  const copy = await readFile(TARGET, 'utf8').catch(() => null);
  // The backend Docker image has no frontend folder; only check when present.
  if (copy !== null) {
    assert.equal(
      copy,
      toCommonJs(await readFile(SOURCE, 'utf8')),
      'Run `npm --prefix backend run sync:filter`'
    );
  }
});
