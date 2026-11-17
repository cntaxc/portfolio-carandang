#!/usr/bin/env node
// Scans public/models for .glb files and writes src/data/models.generated.json.
// Runs automatically before `npm start` and `npm run build` (see package.json),
// so dropping a new model into public/models and restarting is enough.
//
// Category comes from the filename suffix (case-insensitive):
//   *_Character.glb            -> Character
//   *_Prop(s).glb              -> Props
//   *_Enviroment.glb / *_Environment.glb -> Environment
//   *_Vehicle(s).glb           -> Vehicle
// Files without a known suffix get `category: null`; set one in
// `modelOverrides` in src/data/portfolio.js.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(ROOT, 'public', 'models');
const OUTPUT = path.join(ROOT, 'src', 'data', 'models.generated.json');

const CATEGORY_SUFFIXES = [
  { pattern: /_characters?$/i, category: 'Character' },
  { pattern: /_props?$/i, category: 'Props' },
  { pattern: /_envi(?:ron|r)o?ments?$/i, category: 'Environment' },
  { pattern: /_vehicles?$/i, category: 'Vehicle' },
];

// "MangDodong_Character" -> "Mang Dodong", "Police_Patrol_Vehicles" ->
// "Police Patrol", "VintagePC_Props" -> "Vintage PC", "spaceship" -> "Spaceship".
function toDisplayName(baseName) {
  return baseName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function describe(fileName) {
  const stem = fileName.replace(/\.glb$/i, '');
  const match = CATEGORY_SUFFIXES.find(({ pattern }) => pattern.test(stem));
  const baseName = match ? stem.replace(match.pattern, '') : stem;

  return {
    id: stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    file: fileName,
    title: toDisplayName(baseName),
    category: match ? match.category : null,
  };
}

const files = fs.existsSync(MODELS_DIR)
  ? fs
      .readdirSync(MODELS_DIR)
      .filter((name) => /\.glb$/i.test(name))
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
  : [];

const manifest = files.map(describe);
const next = `${JSON.stringify(manifest, null, 2)}\n`;
const previous = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';

// Only write when something changed, so the dev server doesn't reload needlessly.
if (next !== previous) {
  fs.writeFileSync(OUTPUT, next);
}

const uncategorized = manifest.filter((model) => !model.category);
console.log(
  `[models] ${manifest.length} model(s) found in public/models` +
    (uncategorized.length
      ? `; no category suffix: ${uncategorized.map((m) => m.file).join(', ')}`
      : '')
);
