#!/usr/bin/env node
// Builds the assistant's knowledge base from the site's own data, so the
// assistant can never disagree with what the portfolio shows.
//
//   src/data/portfolio.js (+ src/data/models.generated.json)
//     -> src/data/knowledge-base.generated.json  (browser assistant)
//     -> api/_lib/knowledge-base.json             (optional Claude /api/chat)
//
// Runs automatically before `npm start` and `npm run build` (package.json).
// Images are not needed, so image imports are replaced with null.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'portfolio.js');
const MODELS_FILE = path.join(ROOT, 'src', 'data', 'models.generated.json');
// Same JSON in two places: the browser assistant (src/) and the optional
// Claude-powered /api/chat function (api/_lib/).
const OUTPUTS = [
  path.join(ROOT, 'src', 'data', 'knowledge-base.generated.json'),
  path.join(ROOT, 'api', '_lib', 'knowledge-base.json'),
];
const SITE_URL = process.env.PORTFOLIO_SITE_URL || 'https://portfolio-carandang.vercel.app';

async function loadPortfolioData() {
  let source = fs.readFileSync(DATA_FILE, 'utf8');
  const models = fs.existsSync(MODELS_FILE) ? fs.readFileSync(MODELS_FILE, 'utf8') : '[]';

  source = source.replace(
    /^import (\w+) from ['"][^'"]+\.(png|jpe?g|gif|webp|svg)['"];?$/gm,
    'const $1 = null;'
  );
  source = source.replace(
    /^import (\w+) from ['"]\.\/models\.generated\.json['"];?$/m,
    `const $1 = ${models.trim()};`
  );
  const downloadsFile = path.join(ROOT, 'src', 'data', 'downloads.generated.json');
  const downloads = fs.existsSync(downloadsFile) ? fs.readFileSync(downloadsFile, 'utf8') : '{}';
  source = source.replace(
    /^import (\w+) from ['"]\.\/downloads\.generated\.json['"];?$/m,
    `const $1 = ${downloads.trim()};`
  );
  const leftover = source.match(/^import .*$/m);
  if (leftover) {
    throw new Error(`Unsupported import in portfolio.js: ${leftover[0]}`);
  }

  const tempFile = path.join(os.tmpdir(), `portfolio-data-${process.pid}-${Date.now()}.mjs`);
  fs.writeFileSync(tempFile, source);
  try {
    return await import(pathToFileURL(tempFile).href);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
}

const compact = (value) => {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => item !== undefined);
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)])
      .filter(([, item]) => item !== undefined && item !== null && item !== '' &&
        !(Array.isArray(item) && item.length === 0));
    return Object.fromEntries(entries);
  }
  return value;
};

function buildKnowledgeBase(data) {
  const {
    profile,
    professionalSummary,
    about,
    floatingActions,
    showcaseProjects,
    techstack,
    experiences,
    achievementHighlights,
    education,
    modelShowcase,
  } = data;

  const action = (id) => floatingActions.actions.find((item) => item.id === id);
  const modelsByCategory = modelShowcase.categories.map((category) => {
    const items = modelShowcase.items.filter((item) => item.category === category);
    return { category, count: items.length, models: items.map((item) => item.title) };
  });

  return compact({
    identity: {
      name: profile.name,
      headline: professionalSummary.headline,
      roles: professionalSummary.roles,
      location: professionalSummary.location,
      yearsOfExperience: professionalSummary.yearsOfExperience,
      about: about.paragraphs,
    },
    focusAreas: professionalSummary.focusAreas,
    education: education.items.map((item) => ({
      level: item.level,
      program: item.school,
      institutions: item.institutions,
      years: item.date,
      note: item.description,
    })),
    experience: experiences.items.map((item) => ({
      position: item.position,
      organization: item.company,
      year: item.date,
      type: item.type,
      summary: item.summary,
      details: item.description,
    })),
    skills: techstack.categories.map((category) => ({
      category: category.title,
      items: category.items.map((item) => ({
        name: item.label,
        level: item.level,
        context: item.context,
      })),
    })),
    skillLevelsMeaning: 'Proficient > Intermediate > Familiar',
    projects: showcaseProjects.items.map((project) => ({
      name: project.title,
      status: project.published ? 'Released' : 'Unreleased',
      category: project.category,
      role: project.role,
      timeline: project.timeline,
      platforms: project.platforms,
      tools: (project.tools || []).map((tool) => tool.label),
      description: project.description,
      url: project.url && project.url !== '#' ? project.url : undefined,
    })),
    achievements: achievementHighlights.map((item) => ({
      result: [item.title, item.subtitle].filter(Boolean).join(' '),
      category: item.label,
      event: item.event,
      project: item.projectTitle,
      url: item.url,
    })),
    models3d: {
      total: modelShowcase.items.length,
      byCategory: modelsByCategory,
      note: 'Interactive 3D models can be viewed and rotated on the 3D Models page.',
    },
    contact: {
      email: about.mailUrl.replace(/^mailto:/, ''),
      github: action('github')?.url,
      linkedin: action('linkedin')?.url,
      resume: `${SITE_URL}${about.cvUrl}`,
      website: SITE_URL,
    },
  });
}

(async () => {
  const knowledgeBase = buildKnowledgeBase(await loadPortfolioData());
  const next = `${JSON.stringify(knowledgeBase, null, 2)}\n`;
  for (const output of OUTPUTS) {
    const previous = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
    if (next !== previous) {
      fs.writeFileSync(output, next);
    }
  }
  console.log(
    `[knowledge] ${knowledgeBase.projects.length} projects, ` +
      `${knowledgeBase.experience.length} experiences, ` +
      `${knowledgeBase.skills.reduce((n, c) => n + c.items.length, 0)} skills, ` +
      `${knowledgeBase.models3d.total} 3D models -> src/data/knowledge-base.generated.json`
  );
})().catch((error) => {
  console.error('[knowledge] failed:', error.message);
  process.exit(1);
});
