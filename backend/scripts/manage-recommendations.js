#!/usr/bin/env node
// Manage stored recommendations (moderation).
//
//   npm run recommendations -- list               show every recommendation
//   npm run recommendations -- delete <id> [...]  delete by id (from `list`)
//   npm run recommendations -- clear --yes        delete everything
//
// In Docker, run it inside the backend container:
//   docker compose exec backend npm run recommendations -- list
//
// It edits the same data file the server uses (RECOMMENDATIONS_DATA_FILE,
// default ./data/recommendations.json). The running server notices the file
// changed and serves the new data on its next request; open browser tabs pick
// it up within a minute (or on refresh).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRecommendationStore } from '../lib/recommendation-store.js';

const backendDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const filePath =
  process.env.RECOMMENDATIONS_DATA_FILE?.trim() ||
  path.join(backendDirectory, 'data', 'recommendations.json');

const [command = 'list', ...args] = process.argv.slice(2);
const store = createRecommendationStore({ filePath });

function truncate(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

async function list() {
  const recommendations = await store.listPublished();
  console.log(`Data file: ${store.filePath}`);
  if (!recommendations.length) {
    console.log('No recommendations stored.');
    return;
  }
  console.log(`${recommendations.length} recommendation(s), newest first:\n`);
  for (const item of recommendations) {
    console.log(`id:      ${item.id}`);
    console.log(`date:    ${item.publishedAt}`);
    console.log(`author:  ${item.author} (${item.organization})`);
    console.log(`context: ${item.context}`);
    console.log(`message: ${truncate(item.message.replace(/\s+/g, ' '), 160)}\n`);
  }
}

async function remove(ids) {
  if (!ids.length) {
    console.error('Usage: npm run recommendations -- delete <id> [<id> ...]');
    process.exitCode = 1;
    return;
  }
  for (const id of ids) {
    const removed = await store.remove(id);
    if (removed) {
      console.log(`Deleted ${id} (${removed.author}).`);
    } else {
      console.error(`No recommendation with id ${id}.`);
      process.exitCode = 1;
    }
  }
}

async function clear(flags) {
  if (!flags.includes('--yes')) {
    console.error(
      'This deletes every recommendation. Re-run with --yes to confirm:\n' +
        '  npm run recommendations -- clear --yes'
    );
    process.exitCode = 1;
    return;
  }
  const count = await store.clear();
  console.log(`Deleted ${count} recommendation(s).`);
}

const commands = { list, delete: remove, clear };

if (!commands[command]) {
  console.error(
    `Unknown command "${command}". Use: list | delete <id> [...] | clear --yes`
  );
  process.exitCode = 1;
} else {
  try {
    await store.init();
    await commands[command](args);
  } catch (error) {
    console.error(`Failed: ${error.message}`);
    process.exitCode = 1;
  }
}
