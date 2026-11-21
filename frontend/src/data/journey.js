// "My Journey" tree (the page behind PRESS [ENTER] TO MY JOURNEY): my core
// learning journey and career direction, left to right:
//   Education -> my skills -> Web Development / Game Development (each
//   skill feeds its field) -> Internship (both fields lead there).
// Selecting a node shows its details in the inspector. Skill levels and
// counts are pulled from portfolio.js, so they stay in sync with the site.
//
// Node fields:
//   shape      - 'diamond' (stages: education, fields, internship) or
//                'circle' (capabilities)
//   category   - type shown in the inspector (Education, Field, Capability, ...)
//   x, y       - position in the tree's world, in % of its width/height
//   label      - 'bottom' (default) or 'top': where the name sits
//   links      - ids of the nodes this one leads to
//   tags       - short chips shown in the inspector
//   action     - optional button: { label, target } opens a section of the
//                site

import { education, modelShowcase, showcaseProjects, skills } from './portfolio';

const school = education.featured;

// "Good" / "Learning" / ... for a skill name listed on the Skills cards.
const skillLevelLabels = { veryGood: 'Very Good', good: 'Good', learning: 'Learning' };
function skillLevel(name) {
  for (const group of skills.groups) {
    for (const [level, list] of Object.entries(group.levels)) {
      if (list.includes(name)) return skillLevelLabels[level] || level;
    }
  }
  return null;
}
const levelLine = (names) =>
  names
    .map((name) => [name, skillLevel(name)])
    .filter(([, level]) => level)
    .map(([name, level]) => `${name}: ${level}`);

const projectTitles = (ids) =>
  showcaseProjects.items.filter((project) => ids.includes(project.id)).map((project) => project.title);

const webProjects = projectTitles(['lunas', 'alalay-barangray']);
const gameProjects = projectTitles(['outrun', 'muted', 'triggr']);

export const journeyLevels = [
  // ---- Root ---------------------------------------------------------------
  {
    id: 'origin',
    title: 'Education',
    subtitle: school.school,
    shape: 'diamond',
    category: 'Education',
    icon: 'ri-graduation-cap-line',
    x: 9,
    y: 50,
    links: ['frontend', 'uiux', 'quality', 'modeling', 'design'],
    summary: school.description,
    highlights: [
      school.program,
      `${school.department} · ${school.years}`,
      ...education.others.map((other) => `${other.level}: ${other.school}`),
    ],
    tags: [school.school, school.location],
    action: { label: 'Open education', target: 'educations' },
  },

  // ---- Fields --------------------------------------------------------------
  {
    id: 'web',
    title: 'Web Development',
    shape: 'diamond',
    category: 'Field',
    icon: 'ri-global-line',
    x: 66,
    y: 26,
    links: ['internship'],
    summary:
      'Designing and building web interfaces people enjoy using, from wireframes to responsive front-ends and full web apps.',
    highlights: [
      `Projects: ${webProjects.join(', ')}`,
      'Focus: Front-End Dev, UI/UX Design, Quality Assurance',
    ],
    tags: ['React.js', 'Next.js', 'Tailwind CSS', 'Figma'],
    action: { label: 'View developed software', target: 'projectlist' },
  },
  {
    id: 'game',
    title: 'Game Development',
    shape: 'diamond',
    category: 'Field',
    icon: 'ri-gamepad-line',
    x: 66,
    y: 74,
    links: ['internship'],
    summary:
      'Making games playable and fun: designing levels, building low-poly worlds and testing until it feels right.',
    highlights: [
      `Projects: ${gameProjects.join(', ')}`,
      'Focus: 3D Modeling / Low-Poly, Game Design, Quality Assurance',
    ],
    tags: ['Unity', 'Blender', 'C#', 'Godot'],
    action: { label: 'Open portfolio', target: 'portfolio' },
  },

  // ---- Web skills (feed Web Development) ----------------------------------------
  {
    id: 'frontend',
    title: 'Front-End Dev',
    shape: 'circle',
    category: 'Capability · Web',
    icon: 'ri-code-s-slash-line',
    x: 36,
    y: 12,
    links: ['web'],
    summary: 'Turning designs into responsive, accessible pages and components.',
    highlights: levelLine(['Front-End Development', 'Responsive Layout']),
    tags: ['HTML/CSS', 'JavaScript', 'React.js', 'Next.js', 'Tailwind CSS'],
    action: { label: 'View techstack', target: 'techstack' },
  },
  {
    id: 'uiux',
    title: 'UI/UX Design',
    shape: 'circle',
    category: 'Capability · Web',
    icon: 'ri-layout-4-line',
    x: 36,
    y: 31,
    links: ['web'],
    summary: 'Wireframing, prototyping and designing clear, intuitive interfaces.',
    highlights: levelLine(['UI/UX Design', 'Wireframing', 'Prototyping']),
    tags: ['Figma', 'Canva', 'Wireframes', 'Prototypes'],
    action: { label: 'View techstack', target: 'techstack-preview' },
  },

  // ---- Shared skill (feeds both fields) -------------------------------------
  {
    id: 'quality',
    title: 'Quality Assurance',
    shape: 'circle',
    category: 'Capability · Web & Game',
    icon: 'ri-shield-check-line',
    x: 36,
    y: 50,
    links: ['web', 'game'],
    summary:
      'Making sure web apps and games work as intended: planning test cases, re-testing after changes and documenting issues clearly, on both sides of my work.',
    highlights: [
      ...levelLine(['Test Case', 'Regression Testing', 'Documentation']),
      `Web: ${webProjects.join(', ')} · Games: ${gameProjects.join(', ')}`,
    ],
    tags: ['Test cases', 'Regression testing', 'Documentation', 'Bug tracking'],
    action: { label: 'View techstack', target: 'techstack-preview' },
  },

  // ---- Game skills (feed Game Development) ----------------------------------------
  {
    id: 'modeling',
    title: '3D Modeling / Low-Poly',
    shape: 'circle',
    category: 'Capability · Game',
    icon: 'ri-shapes-line',
    x: 36,
    y: 69,
    links: ['game'],
    summary: `Low-poly characters, props, vehicles and environments for real-time games (${modelShowcase.items.length} models in my gallery).`,
    highlights: levelLine(['Low-Poly', '3D Low-Poly Environment', 'Low-Poly Props', 'UV Unwrapping', 'Rigging']),
    tags: ['Blender', 'Blockbench', 'Low-poly'],
    action: { label: 'Open 3D model projects', target: 'models' },
  },
  {
    id: 'design',
    title: 'Game Design',
    shape: 'circle',
    category: 'Capability · Game',
    icon: 'ri-map-2-line',
    x: 36,
    y: 88,
    links: ['game'],
    summary:
      'Shaping how a game plays, flows and feels: designing player flow, balancing challenge and pacing the experience.',
    highlights: levelLine(['Player Flow', 'Game Balancing', 'Pacing', 'Narrative Design']),
    tags: ['Player flow', 'Game balancing', 'Pacing', 'Level design'],
    action: { label: 'View techstack', target: 'techstack-preview' },
  },

  // ---- Next quest -----------------------------------------------------------
  {
    id: 'internship',
    title: 'Internship',
    shape: 'diamond',
    category: 'Next Quest',
    icon: 'ri-flag-2-line',
    x: 93,
    y: 50,
    links: [],
    summary:
      'Seeking an OJT / internship in Level Design, 3D Art or Game Design, where I can learn from a real team and ship real work.',
    highlights: ['Level Design', '3D Art', 'Game Design'],
    tags: ['OJT', 'Internship', 'Open to work'],
    action: { label: 'Contact me', target: 'contact' },
  },
];

export const journeyLevelsById = Object.fromEntries(
  journeyLevels.map((level) => [level.id, level])
);

// Parent ids for each node (reverse of `links`).
export const journeyParents = journeyLevels.reduce((parents, level) => {
  level.links.forEach((childId) => {
    (parents[childId] = parents[childId] || []).push(level.id);
  });
  return parents;
}, {});
