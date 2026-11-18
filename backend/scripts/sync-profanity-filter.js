#!/usr/bin/env node
// Writes a CommonJS copy of lib/profanity-filter.js to
// frontend/api/_lib/profanity-filter.js for the Vercel serverless function
// (Vercel loads plain .js functions as CommonJS).
//
//   npm --prefix backend run sync:filter
//
// A backend test fails if the copy is out of date.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SOURCE = new URL('../lib/profanity-filter.js', import.meta.url);
export const TARGET = new URL(
  '../../frontend/api/_lib/profanity-filter.js',
  import.meta.url
);

const EXPORT_PATTERN = /^export (const|let|function|async function|class) (\w+)/gm;

export function toCommonJs(source) {
  const names = [...source.matchAll(EXPORT_PATTERN)].map((match) => match[2]);
  const body = source.replace(EXPORT_PATTERN, '$1 $2');
  return (
    '// GENERATED from backend/lib/profanity-filter.js.\n' +
    '// Do not edit: run `npm --prefix backend run sync:filter` instead.\n' +
    "'use strict';\n\n" +
    `${body.trimEnd()}\n\n` +
    `module.exports = { ${names.join(', ')} };\n`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = await readFile(SOURCE, 'utf8');
  await writeFile(TARGET, toCommonJs(source));
  console.log(`Wrote ${fileURLToPath(TARGET)}`);
}
