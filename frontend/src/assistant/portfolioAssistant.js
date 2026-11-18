// Portfolio assistant that runs entirely in the browser: no AI model, no API
// key, no cost. It matches a question to a topic (or to a specific project,
// skill, 3D model or organization) and answers from the knowledge base that
// scripts/generate-knowledge-base.js builds from src/data/portfolio.js, so the
// answers always match what the site shows.
//
//   const { text, context } = answerQuestion('What did he study?', context);
//
// `context` remembers the last project discussed, so follow-ups like
// "what tools did it use?" work. Pass back the context from the last answer.
import knowledgeBase from '../data/knowledge-base.generated.json';

const kb = knowledgeBase;
const firstName = kb.identity.name.split(' ')[0];
const email = kb.contact.email;

// ---------------------------------------------------------------------------
// Text matching

function normalize(text) {
  const cleaned = String(text || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9#+./&' -]/g, ' ')
    .replace(/\.(?![a-z0-9])/g, ' ') // sentence periods, but keep "next.js"
    .replace(/\s+/g, ' ')
    .trim();
  return ` ${cleaned} `;
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "skill*" matches words starting with "skill"; "git" matches only "git".
function termPattern(term) {
  const prefix = term.endsWith('*');
  const body = escapeRegExp(prefix ? term.slice(0, -1) : term);
  return new RegExp(`(?:^|[^a-z0-9#+.])${body}${prefix ? '' : '(?![a-z0-9#+])'}`);
}

function compileTerms(terms) {
  return terms.map((term) => ({ term, pattern: termPattern(term) }));
}

// Multi-word phrases are stronger evidence than single words.
function score(question, compiledTerms) {
  return compiledTerms.reduce(
    (total, { term, pattern }) =>
      pattern.test(question) ? total + (term.includes(' ') ? 2 : 1) : total,
    0
  );
}

const matches = (question, compiledTerms) => score(question, compiledTerms) > 0;

// ---------------------------------------------------------------------------
// Topics. On a tie, the topic listed first wins, so specific topics beat
// general ones ("what did Christian study" is about education, not identity).

const TOPICS = {
  contact: [
    'contact*', 'email*', 'e-mail', 'mail', 'reach', 'hire', 'hiring', 'recruit*',
    'availab*', 'message him', 'connect', 'linkedin', 'github account', 'his github',
    'resume', 'cv', 'social*', 'phone', 'call him', 'get in touch', 'talk to him',
    'website', 'collab*', 'work with him', 'commission*', 'link', 'links', 'profile*',
  ],
  achievements: [
    'achiev*', 'award*', 'won', 'win*', 'hackathon*', 'competition*', 'compet*',
    'rank*', 'accomplish*', 'recogni*', 'contest*', 'prize*', 'honor*', 'certific*',
  ],
  education: [
    'stud*', 'school*', 'college', 'universit*', 'degree', 'course', 'educat*',
    'graduat*', 'major*', 'senior high', 'shs', 'stem', 'academ*', 'campus',
    'alma mater', 'bachelor*', 'computer science', 'cabuyao', 'liceo', 'pamantasan',
    'pnc', 'year level',
  ],
  models: [
    '3d', 'model*', 'blender', 'asset*', 'character*', 'vehicle*', 'prop', 'props',
    'environment*', 'low poly', 'lowpoly', 'mesh*', 'sculpt*', 'car', 'cars',
  ],
  experience: [
    'experienc*', 'worked', 'work history', 'job*', 'employ*', 'organization*',
    'organisation*', 'org', 'orgs', 'volunteer*', 'officer', 'director', 'intern',
    'internship*', 'immersion', 'leadership', 'club*', 'member*', 'position*',
    'how long', 'years', 'involve*', 'extracurricular*', 'affiliat*', 'events',
  ],
  projects: [
    'project*', 'built', 'build*', 'made', 'make', 'creat*', 'game', 'games',
    'app', 'apps', 'application*', 'developed', 'software', 'released', 'itch',
    'his work', 'work samples', 'portfolio piece*', 'shipped',
  ],
  skills: [
    'skill*', 'strong*', 'strength*', 'good at', 'best at', 'tech', 'technolog*',
    'stack', 'language*', 'programming', 'tool*', 'expert*', 'proficien*', 'know',
    'knows', 'capab*', 'abilit*', 'framework*', 'can he', 'coding', 'code',
    'experience with', 'familiar', 'level',
  ],
  roles: [
    'what does he do', 'what he does', 'role', 'roles', 'job title', 'title',
    'profession*', 'speciali*', 'focus*', 'designer', 'developer', 'career',
    'occupation', 'what kind of',
  ],
  location: [
    'where is he', 'where does he', 'based', 'live', 'lives', 'locat*', 'from where',
    'where from', 'city', 'country', 'address', 'philippines', 'laguna', 'hometown',
  ],
  assistant: [
    'who are you', 'what are you', 'what can you', 'are you a', 'are you an',
    'are you real', 'your name', 'help', 'how does this work', 'what can i ask',
    'chatgpt', 'bot',
  ],
  identity: [
    'who is', "who's", 'whos', 'about him', 'about christian', 'introduc*',
    'himself', 'background', 'bio', 'summary', 'overview', 'tell me about him',
    'describe him', 'christian', 'carandang',
  ],
  thanks: ['thank*', 'thx', 'ty', 'salamat', 'appreciate*'],
  greeting: [
    'hi', 'hello', 'hey', 'hiya', 'yo', 'sup', 'good morning', 'good afternoon',
    'good evening', 'kumusta', 'musta',
  ],
  goodbye: ['bye', 'goodbye', 'see you', 'see ya'],
};

const TOPIC_TERMS = Object.fromEntries(
  Object.entries(TOPICS).map(([topic, terms]) => [topic, compileTerms(terms)])
);

// "Does he know X?" / "Has he used X?" names a specific technology.
const SPECIFIC_SKILL_ASK = compileTerms([
  'know', 'knows', 'familiar with', 'good at', 'good with', 'experience with',
  'use', 'used', 'uses', 'can he', 'does he code in', 'worked with',
]);

const FOLLOW_UP = compileTerms([
  'it', 'its', "it's", 'that', 'this', 'that project', 'this project', 'the game',
  'the project', 'more', 'details',
]);

// ---------------------------------------------------------------------------
// Entities: specific projects, skills, tools, 3D models and organizations.

const canonical = (value) =>
  String(value).toLowerCase().replace(/\.js$/, '').replace(/[^a-z0-9#+]/g, '');

const SKILL_ALIASES = {
  'HTML/CSS': ['html', 'css', 'html/css'],
  JavaScript: ['javascript', 'js'],
  React: ['react', 'react.js', 'reactjs'],
  'Next.js': ['next.js', 'nextjs', 'next js'],
  'Tailwind CSS': ['tailwind', 'tailwind css'],
  'Lua Script': ['lua', 'lua script'],
  'C#': ['c#', 'c sharp', 'csharp'],
  'Node.js': ['node', 'node.js', 'nodejs'],
  PostgreSQL: ['postgresql', 'postgres'],
  'GML (GameMaker Language)': ['gml', 'gamemaker language'],
  'ONNX Runtime': ['onnx', 'onnx runtime'],
  'Paint.NET': ['paint.net', 'paintnet'],
  'Antigravity IDE': ['antigravity', 'antigravity ide'],
  'VS Code': ['vs code', 'vscode', 'vsc', 'visual studio code'],
};

// Tool names used in projects that are spelled differently in the skills list.
const TOOL_TO_SKILL = { vsc: 'vscode', reactjs: 'react' };

const skillEntries = [];
for (const category of kb.skills) {
  for (const item of category.items) {
    // "3D Game"/"2D Game" are categories of work, not things people ask about
    // by name (and "3D" is about the 3D models).
    if (/^\dD Game$/.test(item.name)) continue;
    const existing = skillEntries.find((entry) => entry.name === item.name);
    if (existing) {
      existing.categories.push(category.category);
      continue;
    }
    skillEntries.push({
      ...item,
      categories: [category.category],
      terms: compileTerms(SKILL_ALIASES[item.name] || [item.name.toLowerCase()]),
    });
  }
}

const skillCanonicals = new Set(skillEntries.map((skill) => canonical(skill.name)));
const toolSkillKey = (tool) => TOOL_TO_SKILL[canonical(tool)] || canonical(tool);

// Project tools that aren't in the skills list (e.g. "Prisma ORM").
const toolEntries = [];
for (const project of kb.projects) {
  for (const tool of project.tools || []) {
    if (skillCanonicals.has(toolSkillKey(tool))) continue;
    if (toolEntries.some((entry) => entry.name === tool)) continue;
    toolEntries.push({ name: tool, terms: compileTerms([tool.toLowerCase(), tool.split(' ')[0].toLowerCase()]) });
  }
}

const projectEntries = kb.projects.map((project) => {
  const name = project.name.toLowerCase();
  const terms = [name];
  if (name.includes(' ')) terms.push(name.split(' ')[0]);
  return { project, terms: compileTerms(terms) };
});

// Longest names first so "Police Sedan" wins over "Police".
const modelEntries = kb.models3d.byCategory
  .flatMap(({ category, models }) => models.map((name) => ({ name, category })))
  .sort((a, b) => b.name.length - a.name.length)
  .map((model) => ({ ...model, terms: compileTerms([model.name.toLowerCase()]) }));

const modelCategoryEntries = kb.models3d.byCategory.map((group) => ({
  group,
  terms: compileTerms(
    {
      Character: ['character*', 'people', 'person*', 'npc*'],
      Props: ['prop', 'props', 'object*', 'item*'],
      Environment: ['environment*', 'scenery', 'trees', 'street*'],
      Vehicle: ['vehicle*', 'car', 'cars', 'transport*'],
    }[group.category] || [group.category.toLowerCase()]
  ),
}));

const GENERIC_ORG_WORDS = new Set([
  'university', 'cabuyao', 'laguna', 'junior', 'education', 'consortium',
  'philippines', 'institute', 'technology', 'school', 'college', 'club',
]);

const organizationEntries = [...new Set(kb.experience.map((item) => item.organization))].map(
  (organization) => {
    const words = organization.split(/[^A-Za-z]+/).filter(Boolean);
    const terms = words
      .filter(
        (word) =>
          (word.length >= 3 && word === word.toUpperCase()) ||
          (word.length >= 5 && !GENERIC_ORG_WORDS.has(word.toLowerCase()))
      )
      .map((word) => word.toLowerCase());
    return { organization, terms: compileTerms(terms) };
  }
);

const SKILL_CATEGORY_TERMS = {
  FRONTEND: ['frontend', 'front-end', 'front end', 'ui development', 'web development'],
  BACKEND: ['backend', 'back-end', 'back end', 'server', 'database*'],
  'GAME DEVELOPMENT': ['game dev', 'game development', 'game engine*', 'gamedev'],
  '3D & CREATIVE TOOLS': ['creative tool*', 'design tool*', 'creative software', 'art tool*'],
  'DEVELOPMENT TOOLS': ['dev tool*', 'development tool*', 'devops', 'version control', 'ide', 'ides'],
};
const skillCategoryEntries = kb.skills.map((category) => ({
  category,
  terms: compileTerms(SKILL_CATEGORY_TERMS[category.category] || [category.category.toLowerCase()]),
}));

// ---------------------------------------------------------------------------
// Answer helpers

const LEVELS = ['Proficient', 'Intermediate', 'Familiar'];

function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const firstSentence = (text) => (text.match(/^.*?[.!?](\s|$)/) || [text])[0].trim();

function describeProject(project) {
  const description = project.description || '';
  if (description.toLowerCase().startsWith(project.name.toLowerCase())) {
    return description;
  }
  return `${project.name}: ${description.charAt(0).toUpperCase()}${description.slice(1)}`;
}

function projectsUsing(skillName) {
  const key = canonical(skillName);
  return kb.projects.filter((project) =>
    (project.tools || []).some((tool) => toolSkillKey(tool) === key || canonical(tool) === key)
  );
}

const pageHint = (where) => `See ${where} on this site for more.`;

// ---------------------------------------------------------------------------
// Answers

const answers = {
  identity() {
    const school = kb.education[0];
    return [
      `${kb.identity.name} is an ${kb.identity.headline} based in ${kb.identity.location}. ` +
        `He works across ${joinList(kb.identity.roles)} roles and has ${kb.identity.yearsOfExperience} years of experience.`,
      school
        ? `He's currently taking a ${school.program} at ${joinList(school.institutions)} (${school.years}).`
        : '',
      `Focus areas: ${joinList(kb.focusAreas.map((area) => area.title))}.`,
    ]
      .filter(Boolean)
      .join('\n\n');
  },

  roles() {
    return [
      `${firstName} is an ${kb.identity.headline}, working as a ${joinList(kb.identity.roles)}.`,
      'His focus areas:',
      ...kb.focusAreas.map((area) => `- ${area.title}: ${area.description}`),
    ].join('\n');
  },

  education() {
    return [
      `Here's ${firstName}'s education:`,
      ...kb.education.map(
        (item) =>
          `- ${item.level}: ${item.program === item.level ? '' : `${item.program}, `}` +
          `${joinList(item.institutions)} (${item.years})`
      ),
    ].join('\n');
  },

  skills(askedAboutSomethingSpecific = false) {
    const all = skillEntries;
    const proficient = all.filter((skill) => skill.level === 'Proficient').map((s) => s.name);
    const intermediate = all.filter((skill) => skill.level === 'Intermediate').map((s) => s.name);
    return [
      askedAboutSomethingSpecific
        ? `I don't see that on ${firstName}'s skills list. Here's what he does list:`
        : '',
      `${firstName}'s strongest skills (Proficient): ${joinList(proficient)}.`,
      `He's also at an Intermediate level in ${joinList(intermediate)}.`,
      `Ask about a specific tool (like "Is he good at React?") or an area such as frontend, backend or game development. ${pageHint('More → Techstack')}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  },

  skillCategory(category) {
    const items = [...category.items].sort(
      (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
    );
    const label = category.category.toLowerCase().replace('3d', '3D');
    return [
      `${firstName}'s ${label} skills:`,
      ...items.map((item) => `- ${item.name} (${item.level}): ${item.context}`),
    ].join('\n');
  },

  skill(skill) {
    const used = projectsUsing(skill.name).map((project) => project.name);
    return [
      `${firstName} lists ${skill.name} at a${skill.level === 'Intermediate' ? 'n' : ''} ${skill.level} level (${skill.context}).`,
      used.length ? `He used it in ${joinList(used)}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  },

  tool(tool) {
    const used = projectsUsing(tool.name).map((project) => project.name);
    return `${tool.name} isn't on ${firstName}'s skills list, but he used it in ${joinList(used)}.`;
  },

  projects() {
    return [
      `${firstName} has worked on ${kb.projects.length} projects:`,
      ...kb.projects.map(
        (project) =>
          `- ${project.name} (${project.status}): ${project.role}. ${firstSentence(describeProject(project).replace(/^[^:]+: /, ''))}`
      ),
      '',
      `Ask about any of them by name for details. ${pageHint('Portfolio → Developed Software')}`,
    ].join('\n');
  },

  project(project) {
    return [
      describeProject(project),
      '',
      `- ${firstName}'s role: ${project.role}`,
      `- Type: ${project.category.charAt(0)}${project.category.slice(1).toLowerCase()}`,
      `- Platforms: ${joinList(project.platforms || [])}`,
      `- Built with: ${joinList(project.tools || [])}`,
      `- Status: ${project.status}${project.url ? ` (${project.url})` : ''}`,
    ].join('\n');
  },

  experience() {
    return [
      `${firstName} has ${kb.identity.yearsOfExperience} years of experience. His roles so far:`,
      ...kb.experience.map((item) => `- ${item.position}, ${item.organization} (${item.year})`),
      '',
      `Ask about an organization (like DEVCON) for details. ${pageHint('More → Overview')}`,
    ].join('\n');
  },

  organization(organization) {
    const roles = kb.experience.filter((item) => item.organization === organization);
    return [
      `${firstName}'s experience with ${organization}:`,
      ...roles.map(
        (item) => `- ${item.position} (${item.year}): ${item.summary}`
      ),
    ].join('\n');
  },

  achievements() {
    return [
      `${firstName}'s achievements:`,
      ...kb.achievements.map(
        (item) =>
          `- ${item.result.charAt(0)}${item.result.slice(1).toLowerCase()} at ${item.event.replace(/[!.]+$/, '')}` +
          `${item.project ? `, with ${item.project}` : ''}${item.url ? ` (${item.url})` : ''}`
      ),
    ].join('\n');
  },

  models() {
    return [
      `${firstName} has made ${kb.models3d.total} 3D models:`,
      ...kb.models3d.byCategory.map(
        (group) => `- ${group.category} (${group.count}): ${joinList(group.models)}`
      ),
      '',
      'You can view and rotate each one under Portfolio → 3D Models.',
    ].join('\n');
  },

  modelCategory(group) {
    return `${firstName}'s ${group.category.toLowerCase()} models (${group.count}): ${joinList(group.models)}. You can rotate each one under Portfolio → 3D Models.`;
  },

  model(model) {
    return `Yes, ${model.name} is one of ${firstName}'s 3D models (${model.category}). You can view and rotate it under Portfolio → 3D Models.`;
  },

  contact() {
    return [
      `You can reach ${firstName} here:`,
      `- Email: ${email}`,
      kb.contact.linkedin ? `- LinkedIn: ${kb.contact.linkedin}` : null,
      kb.contact.github ? `- GitHub: ${kb.contact.github}` : null,
      kb.contact.resume ? `- Resume: ${kb.contact.resume}` : null,
      '',
      'Or send a message through the Contact form on this site.',
    ]
      .filter((line) => line !== null)
      .join('\n');
  },

  location() {
    return `${firstName} is based in ${kb.identity.location}.`;
  },

  assistant() {
    return (
      `I'm ${firstName}'s portfolio assistant. I answer from the information on this site, so I can tell you about ` +
      `his background, education, skills, projects, experience, achievements, 3D models and how to contact him.`
    );
  },

  thanks() {
    return "You're welcome! Anything else you'd like to know about Christian?";
  },

  greeting() {
    return `Hi! I'm ${firstName}'s portfolio assistant. Ask me about his projects, skills, education, experience, 3D models, or how to contact him.`;
  },

  goodbye() {
    return `Thanks for visiting! You can always reach ${firstName} at ${email}.`;
  },

  fallback() {
    return (
      `Sorry, I don't have an answer for that. I can only answer questions about ${firstName}'s portfolio, ` +
      `like his projects, skills, education, experience, achievements and 3D models.\n\n` +
      `For anything else, you can email him at ${email}.`
    );
  },
};

// ---------------------------------------------------------------------------

function findAll(question, entries) {
  return entries.filter((entry) => matches(question, entry.terms));
}

/**
 * Answers a visitor's question.
 * @param {string} rawQuestion
 * @param {{ project?: string }} [context] context returned by the previous answer
 * @returns {{ text: string, topic: string, context: { project?: string } }}
 */
export function answerQuestion(rawQuestion, context = {}) {
  const question = normalize(rawQuestion);
  const scores = Object.fromEntries(
    Object.entries(TOPIC_TERMS).map(([topic, terms]) => [topic, score(question, terms)])
  );
  const reply = (topic, text, project = context.project) => ({
    text,
    topic,
    context: { project },
  });

  // Specific things mentioned by name come first.
  const projects = findAll(question, projectEntries).map((entry) => entry.project);
  if (projects.length) {
    return reply(
      'project',
      projects.slice(0, 3).map(answers.project).join('\n\n'),
      projects[projects.length - 1].name
    );
  }

  // "What's his GitHub?" is about contact, not the GitHub skill.
  if (scores.contact && !scores.skills) {
    return reply('contact', answers.contact());
  }

  const organizations = findAll(question, organizationEntries);
  if (organizations.length) {
    return reply(
      'organization',
      organizations.map((entry) => answers.organization(entry.organization)).join('\n\n')
    );
  }

  const skills = findAll(question, skillEntries);
  if (skills.length) {
    return reply('skill', skills.slice(0, 4).map(answers.skill).join('\n\n'));
  }

  const tools = findAll(question, toolEntries);
  if (tools.length) {
    return reply('tool', tools.map(answers.tool).join('\n\n'));
  }

  const skillCategories = findAll(question, skillCategoryEntries);
  if (skillCategories.length && scores.projects <= scores.skills) {
    return reply('skills', skillCategories.map((entry) => answers.skillCategory(entry.category)).join('\n\n'));
  }

  const models = [];
  for (const model of modelEntries) {
    // Skip "Police" when "Police Sedan" already matched.
    if (models.some((found) => found.name.toLowerCase().includes(model.name.toLowerCase()))) continue;
    if (matches(question, model.terms)) models.push(model);
  }
  if (models.length) {
    return reply('model', models.slice(0, 4).map(answers.model).join('\n'));
  }

  const modelCategories = findAll(question, modelCategoryEntries);
  if (modelCategories.length && scores.models) {
    return reply('models', modelCategories.map((entry) => answers.modelCategory(entry.group)).join('\n\n'));
  }

  // Follow-up about the last project ("what tools did it use?").
  const project = kb.projects.find((item) => item.name === context.project);
  const best = Object.keys(TOPICS).reduce(
    (top, topic) => (scores[topic] > scores[top] ? topic : top),
    Object.keys(TOPICS)[0]
  );
  if (
    project &&
    matches(question, FOLLOW_UP) &&
    (!scores[best] || best === 'projects' || best === 'skills')
  ) {
    return reply('project', answers.project(project));
  }

  if (!scores[best]) {
    return reply('fallback', answers.fallback());
  }

  // "Hi, what did he study?" -> answer the question, not just the greeting.
  const SMALL_TALK = ['greeting', 'thanks', 'goodbye'];
  if (SMALL_TALK.includes(best)) {
    const other = Object.keys(TOPICS).find(
      (topic) => !SMALL_TALK.includes(topic) && scores[topic] > 0
    );
    if (other) {
      return reply(other, answers[other]());
    }
  }

  if (best === 'skills') {
    return reply('skills', answers.skills(matches(question, SPECIFIC_SKILL_ASK)));
  }

  return reply(best, answers[best]());
}

export const ASSISTANT_SUGGESTIONS = [
  'Who is Christian?',
  'What did he study?',
  'What are his strongest skills?',
  'How can I contact him?',
];
