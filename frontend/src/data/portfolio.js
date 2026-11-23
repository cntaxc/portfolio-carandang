import lunasImage from '../assets/images/projects/lunas.png';
import OutrunLoadingBackground from '../assets/images/projects/outrun.png';
import Triggr from '../assets/images/projects/triggr.png';
import alalaybarangay from '../assets/images/projects/alalay-barangay.png';
import modelsHubBackground from '../assets/images/projects/3dbgm.jpg';
import assetsHubVideo from '../assets/video/3DModelsVideoBG.mp4';
import assetsHubPoster from '../assets/video/3DModelsVideoBG-poster.jpg';
import mutedImage from '../assets/images/projects/MutedBackground.png';
import mutedLogo from '../assets/images/logos/mutedapplogo.png';
import outrunPfp from '../assets/images/logos/outrun.png';
import lunasPfp from '../assets/images/logos/lunas.png';
import alalayBarangayPfp from '../assets/images/logos/alalay-barangay.jpg';
import triggrPfp from '../assets/images/logos/triggr.png';
import schoolPhoto from '../assets/images/logos/schoolimg.jpg';
import universityLogo from '../assets/images/logos/University-of-Cabuyao-logo.jpg';
import departmentLogoImage from '../assets/images/logos/College-of-Computing-Logo.jpg';
import sikaptalaPdf from '../assets/images/certificates/CHRISTIAN_RAPHAEL_A__CARANDANG_6a1b0d0854e849cf649d97a1.pdf';
import sikaptalaPreview from '../assets/images/certificates/previews/sikaptala-2026.jpg';
import orientationPdf from '../assets/images/certificates/PALD-PNC PRE-CE-85.492-Christian Raphael A. Carandang.pdf';
import orientationPreview from '../assets/images/certificates/previews/internship-orientation-2026.jpg';
import pantryPdf from '../assets/images/certificates/PNC_Kalikasan_Community_Pantry_Christian Raphael A. Carandang.pdf';
import pantryPreview from '../assets/images/certificates/previews/kalikasan-community-pantry-2026.jpg';
import ignitePdf from '../assets/images/certificates/Wadhwani Foundation Certificate - 69f5ac8db36cdf49a0e69dd8.pdf';
import ignitePreview from '../assets/images/certificates/previews/ignite-philippines-2026.jpg';
import generatedModels from './models.generated.json';
import generatedDownloads from './downloads.generated.json';

export const profile = {
  name: 'Christian Raphael A. Carandang',
  timeLabel: 'Local Time',
  temperatureLabel: 'Temperature',
  temperature: 28,
};

// Professional summary shared by the About and Overview sections and the AI
// assistant's knowledge base (see scripts/generate-knowledge-base.js).
export const professionalSummary = {
  headline: 'Intern Level Designer and 3D Modeler',
  roles: ['Intern Level Designer', '3D Modeler', 'Game Designer', 'Game Tester'],
  // Overview header bio: `before`, then one web role at a time (bold,
  // cycling in this order), then `after`.
  bio: {
    before:
      'Aside from being a game development enthusiast, I can also contribute on the web side through',
    rotating: ['UI/UX Design', 'Quality Assurance', 'Front-End Dev', 'IT Support'],
    after: 'to build responsive, user-friendly, and reliable digital experiences.',
  },
  location: 'Laguna, Philippines',
  // Fixed value shown in the About stats: update as experience grows.
  yearsOfExperience: '1.5',
  focusAreas: [
    {
      title: '3D Modeler',
      description: 'Create and prepare 3D assets, environments, and animations.',
    },
    {
      title: 'Game Design',
      description:
        'Shape engaging gameplay through thoughtful mechanics and level flow.',
    },
    {
      title: 'Game Tester',
      description:
        'Test gameplay, identify issues, and help refine the player experience.',
    },
    {
      title: 'UI/UX Design',
      description: 'Design clear, intuitive interfaces for interactive experiences.',
    },
  ],
};

// Top navigation links (the robot logo on the left is the Home link). Each
// id is a section on the Journey page, except Recommendations (its page).
export const navPrimary = [
  { id: 'journey', label: 'Overview', icon: 'ri-home-office-line' },
  { id: 'journey-map', label: 'Journey', icon: 'ri-route-line' },
  { id: 'projects', label: 'Project', icon: 'ri-code-s-slash-line' },
  { id: 'educations', label: 'Education', icon: 'ri-graduation-cap-line' },
  { id: 'certificates', label: 'Achievements', icon: 'ri-trophy-line' },
  { id: 'techstack-preview', label: 'Techstack', icon: 'ri-code-box-line' },
  { id: 'experiences', label: 'Experience', icon: 'ri-briefcase-4-line' },
  { id: 'recommendation', label: 'Recommendation', icon: 'ri-chat-quote-line' },
];

// The homepage is a single full-screen hero.
export const homeSectionIds = ['home'];

// The Journey page (#journey): the intro, the level tree, the About content
// (About card + Projects), then Education, Achievements, Techstack and
// Experiences. Links to any of these open the Journey and scroll there.
export const journeySectionIds = [
  'journey',
  'journey-map',
  'projects',
  'educations',
  'certificates',
  'techstack-preview',
  'experiences',
];

// Numbered index on the left of the Journey page, in page order.
export const journeyIndex = [
  { id: 'journey', label: 'Overview' },
  { id: 'journey-map', label: 'My Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'educations', label: 'Education' },
  { id: 'certificates', label: 'Achievements' },
  { id: 'techstack-preview', label: 'Techstack' },
  { id: 'experiences', label: 'Experiences' },
];

// Small "NN / LABEL" eyebrows above section titles on the Journey page. The
// number is the section's position in journeyIndex; the label is set here.
export const sectionEyebrows = {
  'journey-map': 'College expedition',
  educations: 'Schools',
  certificates: 'Milestone',
  'techstack-preview': 'Techstack',
  experiences: 'Leardership & Organization',
};

// Old links to the removed Overview page land on the matching Journey section.
export const sectionAliases = {
  arcade: 'portfolio', // Grapple now launches from Quick actions
  about: 'journey', // the bio now sits in the Overview intro
  background: 'educations',
  moreinfos: 'educations',
  skills: 'techstack-preview',
};

// Contact (#contact) and the AI assistant (#aichatbot) each have their own
// page, like Recommendations. They're not in the top navigation; buttons and
// links around the site open them.
export const contactSectionIds = ['contact'];
export const aiSectionIds = ['aichatbot'];

export const projectListSectionIds = ['projectlist'];

export const portfolioSectionIds = ['portfolio'];

export const modelSectionIds = ['models'];

// Views under the "Portfolio" nav item (shown as active while one is open).
export const assetSectionIds = ['assets'];

export const portfolioViews = ['portfolio', 'projectlist', 'models', 'assets'];


export const techstackSectionIds = ['techstack'];

export const recommendationSectionIds = [
  'recommendation',
  'recommendation-form',
  'published-recommendations',
];

// Resume PDF in public/, used by the hero's "My Resume" button and the CV
// shortcut. The file name has spaces and a comma, so the URL is encoded.
const RESUME_FILE = 'CARANDANG, CHRISTIAN RAPHAEL CV.pdf';
const RESUME_URL = `${process.env.PUBLIC_URL || ''}/${encodeURIComponent(RESUME_FILE)}`;

// Right-side action buttons in the top navigation. `href` = a file opened in
// a new tab (the resume PDF); otherwise `id` is the page to open.
export const navActions = [
  { id: 'resume', label: 'Resume', icon: 'ri-file-user-line', href: RESUME_URL },
  { id: 'contact', label: 'Contact Christian', icon: 'ri-mail-send-line' },
];

export const about = {
  title: 'About Me',
  heading: "Hi! I'm Christian",
  eyebrow: 'About Me',
  icon: 'ri-information-line',
  cvLabel: 'MY RESUME',
  cvUrl: RESUME_URL,
  mailUrl: 'mailto:carandangchristianra@gmail.com',
  paragraphs: [
    "Hello! I'm Christian Raphael A. Carandang, a Computer Science student at the University of Cabuyao with a passion for both game development and web development. I enjoy creating interactive experiences, whether it's building 3D environments, designing game mechanics, developing user interfaces, or building responsive websites. Through projects like OUTRUN, MUTED, and TRIGGR, I've gained experience in 3D modeling, game design, UI development, and programming. I've also worked on Alalay Barangay and contributed to the front-end development of LUNAS, which placed 8th overall at SIKAPTala 2026.",
    "I'm passionate about combining creativity and technical skills to build engaging digital experiences. I'm currently seeking an internship where I can further develop my skills in either game development or web development, collaborate with experienced teams, and contribute to meaningful projects.",
  ],
};

export const floatingActions = {
  actions: [
    { id: 'contact', label: 'Contact', icon: 'ri-mail-line', url: 'mailto:carandangchristianra@gmail.com' },
    { id: 'cv', label: 'CV', icon: 'ri-download-2-line', url: RESUME_URL },
    { id: 'github', label: 'GitHub', icon: 'ri-github-line', url: 'https://github.com/cntaxc' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-line', url: 'https://www.linkedin.com/in/christian-carandang-b30015334/' },
  ],
};

export const showcaseProjects = {
  title: 'PROJECTS',
  eyebrow: 'Things I\'ve built',
  // Filter tabs in the Projects section (by each item's `type`).
  filters: [
    { id: 'all', label: 'All titles' },
    { id: 'game', label: 'Games' },
    { id: 'web', label: 'Web / UI' },
  ],
  items: [
    {
      id: 'outrun',
      type: 'game', // Projects filter: 'game' or 'web'
      title: 'OUTRUN',
      published: true,
      category: 'SCHOOL PROJECT',
      role: 'UI Designer, Front-End Developer & 3D Artist',
      badge: 'SOFTWARE EXPO CANDIDATE',
      description:
        'a 2.5D isometric chase game set in a dense city. Ride through traffic, manage battery and durability, and stay ahead of a police pursuit that grows stronger the longer you survive.',
      platforms: ['PC', 'Mobile'],
      tools: [
        { label: 'Unity', icon: 'ri-instance-line' },
        { label: 'Blender', icon: 'ri-blender-line' },
        { label: 'VSC', icon: 'ri-code-box-line' },
      ],
      image: OutrunLoadingBackground,
      logo: outrunPfp,
      url: 'https://ninesixfour.itch.io/outrun',
    },
    {
      id: 'muted',
      type: 'game', // Projects filter: 'game' or 'web'
      title: 'MUTED',
      published: false,
      category: 'BSCS THESIS',
      role: 'Junior Programmer & 3D Artist',
      description:
        'MUTED is a 3D interactive PC game that allows players to complete six spacecraft repair missions using real-time hand gestures through a webcam. Powered by computer vision and AI-based gesture recognition, the game translates physical hand movements into in-game actions, creating a touchless and immersive gameplay experience. It also integrates CNN and CNN+GRU models to evaluate gesture recognition accuracy, stability, and responsiveness during live gameplay.',
      platforms: ['PC'],
      tools: [
        { label: 'Unity', icon: 'ri-instance-line' },
        { label: 'Blender', icon: 'ri-blender-line' },
        { label: 'Python', icon: 'ri-code-s-slash-line' },
        { label: 'ONNX Runtime', icon: 'ri-cpu-line' },
        { label: 'VSC', icon: 'ri-code-box-line' },
      ],
      image: mutedImage,
      logo: mutedLogo,
      url: '#',
    },
    {
      id: 'triggr',
      type: 'game', // Projects filter: 'game' or 'web'
      title: 'TRIGGR',
      published: false,
      category: 'SCHOOL PROJECT',
      role: 'Game UI Designer',
      description:
        'A multiplayer first person shooting game. This game is made for entertainment and school project purposes only.',
      platforms: ['PC'],
      tools: [
        { label: 'Unity', icon: 'ri-instance-line' },
        { label: 'VSC', icon: 'ri-code-box-line' },
      ],
      image: Triggr,
      logo: triggrPfp,
      url: '#',
    },
    {
      id: 'lunas',
      type: 'web', // Projects filter: 'game' or 'web'
      title: 'LUNAS',
      published: true,
      category: 'HACKATHON',
      role: 'Junior Front-End Developer',
      badge: 'HACKATHON',
      description:
        'Lunas is a secure, web-based emergency medical information platform that gives licensed medical professionals instant access to a patient\'s critical health data via a QR code — even when the patient is unconscious or unable to speak.',
      platforms: ['PC'],
      tools: [
        { label: 'React.js', icon: 'ri-reactjs-line' },
        { label: 'Next.js', icon: 'ri-css3-line' },
        { label: 'TypeScript', icon: 'ri-code-s-slash-line' },
        { label: 'Tailwind CSS', icon: 'ri-server-line' },
        { label: 'PostgreSQL', icon: 'ri-server-line' },
        { label: 'Prisma ORM', icon: 'ri-server-line' },
        { label: 'VSC', icon: 'ri-code-box-line' },
      ],
      image: lunasImage,
      logo: lunasPfp,
      url: 'https://lunas.software/',
    },
    {
      id: 'alalay-barangray',
      type: 'web', // Projects filter: 'game' or 'web'
      title: 'Alalay Barangay',
      published: true,
      category: 'SCHOOL PROJECT',
      role: 'UI/UX Designer',
      description:
        'A unique feature of this system is that it has a text-to-speech assistant that would read the labels of the required fields that users need to enter.',
      tools: [
        { label: 'Figma', icon: 'ri-layout-4-line' },
        { label: 'React.js', icon: 'ri-reactjs-line' },
        { label: 'VSC', icon: 'ri-code-box-line' },
      ],
      platforms: ['PC'],
      image: alalaybarangay,
      logo: alalayBarangayPfp,
      url: 'https://angelitoflordeliza.github.io/alalay-barangay-ui/',
    },
  ],
};

export const techstackLevels = ['Proficient', 'Intermediate', 'Familiar'];

const techstackSkillMeta = {
  'HTML/CSS': { level: 'Proficient', context: 'Semantic, responsive interfaces' },
  JavaScript: { level: 'Proficient', context: 'Interactive frontend behavior' },
  React: { level: 'Intermediate', context: 'Component-driven interfaces' },
  'Next.js': { level: 'Familiar', context: 'Full-stack React applications' },
  'React Native': { level: 'Familiar', context: 'Cross-platform mobile apps' },
  'Tailwind CSS': { level: 'Familiar', context: 'Utility-first UI development' },
  USS: { level: 'Intermediate', context: 'Unity Style Sheets for game interfaces' },
  'UI Toolkit': { level: 'Intermediate', context: 'Unity interface construction' },
  'Lua Script': { level: 'Familiar', context: 'Gameplay scripting and systems' },
  'C#': { level: 'Proficient', context: 'Unity gameplay and tooling' },
  Unity: { level: 'Proficient', context: 'Game development and prototyping' },
  GameMaker: { level: 'Familiar', context: '2D game development' },
  Godot: { level: 'Familiar', context: 'Game prototypes and experiments' },
  Photon: { level: 'Intermediate', context: 'Multiplayer networking' },
  GDScript: { level: 'Familiar', context: 'Godot gameplay scripting' },
  'GML (GameMaker Language)': {
    level: 'Familiar',
    context: 'GameMaker gameplay scripting',
  },
  '3D Game': { level: 'Intermediate', context: '3D game design and development' },
  '2D Game': { level: 'Intermediate', context: '2D game design and development' },
  'ONNX Runtime': { level: 'Familiar', context: 'On-device AI inference' },
  Blender: { level: 'Proficient', context: '3D modeling and asset preparation' },
  Blockbench: { level: 'Familiar', context: 'Low-poly 3D modeling and texturing' },
  'Paint.NET': { level: 'Familiar', context: 'Texture and image editing' },
  GIMP: { level: 'Familiar', context: 'Image editing and texture work' },
  Photopea: { level: 'Familiar', context: 'Browser-based image editing' },
  Shoebox: { level: 'Familiar', context: 'Sprite sheet preparation' },
  Audacity: { level: 'Intermediate', context: 'Audio editing' },
  Canva: { level: 'Proficient', context: 'Quick visual assets' },
  Figma: { level: 'Proficient', context: 'UI/UX design and prototyping' },
  'Antigravity IDE': { level: 'Intermediate', context: 'Development workflow' },
  Eclipse: { level: 'Intermediate', context: 'Java development' },
  Git: { level: 'Intermediate', context: 'Version control' },
  GitHub: { level: 'Proficient', context: 'Collaboration and repositories' },
  'VS Code': { level: 'Intermediate', context: 'Primary code editor' },
  Docker: { level: 'Intermediate', context: 'Containerized deployment' },
  Vercel: { level: 'Intermediate', context: 'Frontend deployment' },
  'Unity Version Control': { level: 'Familiar', context: 'Version control for Unity projects' },
};

const techstackCategories = [
  {
    title: 'FRONTEND',
    tags: [
      'HTML/CSS',
      'JavaScript',
      'React',
      'Next.js',
      'React Native',
      'Tailwind CSS',
      'USS',
      'UI Toolkit',
      'Lua Script',
      'C#',
    ],
  },
  {
    title: 'GAME DEVELOPMENT',
    tags: [
      'Unity',
      'GameMaker',
      'Godot',
      'Photon',
      'GDScript',
      'GML (GameMaker Language)',
      '3D Game',
      '2D Game',
      'ONNX Runtime',
    ],
  },
  {
    title: '3D & CREATIVE TOOLS',
    tags: [
      'Blender',
      'Blockbench',
      'Paint.NET',
      'GIMP',
      'Photopea',
      'Shoebox',
      'Audacity',
      'Canva',
      'Figma',
    ],
  },
  {
    title: 'DEVELOPMENT TOOLS',
    tags: [
      'Antigravity IDE',
      'Eclipse',
      'Git',
      'GitHub',
      'VS Code',
      'Docker',
      'Vercel',
      'Unity Version Control',
    ],
  },
];

export const techstack = {
  title: 'TECHSTACK',
  categories: techstackCategories.map((category) => ({
    title: category.title,
    items: category.tags.map((label) => ({
      label,
      ...(techstackSkillMeta[label] ?? {
        level: 'Intermediate',
        context: 'Project experience',
      }),
    })),
  })),
};

const techstackPreviewSkills = Array.from(
  new Map(
    techstack.categories
      .flatMap((category) => category.items)
      .map((item) => [item.label, item])
  ).values()
);

// Techstack section on the Journey page ("What I work with"):
//   header  - eyebrow, two-line title, View all tools
//   groups  - left list / right detail panel; one per techstack category
//             above (same order), with the copy below and that category's
//             tools as tags
//   toolkit - looping strip of every tool (each once)
//   stats   - Projects / Competition / Certification / Years of exp,
//             counted from the data below (see TechstackPreviewSection)
const techstackGroupCopy = [
  {
    title: 'Frontend & UI',
    subtitle: 'Interfaces, layouts, game UI',
    headline: 'Building the interface',
    description:
      'I turn designs into responsive, accessible screens: web layouts in React and Next.js, and in-game interfaces with Unity UI Toolkit and USS.',
  },
  {
    title: 'Game Development',
    subtitle: 'Engines, gameplay, multiplayer',
    headline: 'Making it playable',
    description:
      'From prototype to playable build: gameplay systems in Unity, Godot and GameMaker, multiplayer with Photon, and on-device AI with ONNX Runtime.',
  },
  {
    title: '3D & Creative',
    subtitle: 'Models, textures, audio, design',
    headline: 'Crafting the assets',
    description:
      'I model, texture and prepare low-poly assets, edit sprites and audio, and design the UI mockups before anything gets built.',
  },
  {
    title: 'Dev Tools & Workflow',
    subtitle: 'Version control, editors, deploy',
    headline: 'Shipping it cleanly',
    description:
      'Git and GitHub for every project, containerised setups with Docker, and quick deploys on Vercel, so work stays tracked and easy to ship.',
  },
];

export const techstackPreview = {
  titleLines: ['What I', 'work with'],
  toolkitLabel: 'Stacks',
  skills: techstackPreviewSkills,
  groups: techstack.categories.map((category, index) => ({
    ...techstackGroupCopy[index],
    items: category.items,
  })),
};

// Skills on the Overview page (above the Techstack): craft and technical
// skills only, no job titles or tools. Each group lists its skills per level;
// a level with no skills is hidden in that card until you add some.
// Levels, highest first. `tone` picks the white indicator style in skills.css.
// A level with no skills in a card is simply left out of that card.
export const skillLevels = {
  veryGood: { label: 'Very Good', tone: 'bright' },
  good: { label: 'Good', tone: 'solid' },
  learning: { label: 'Learning', tone: 'hollow' },
};

export const skills = {
  title: 'Skills',
  subtitle: 'The craft behind my work, grouped by how confident I am in each skill.',
  groups: [
    {
      title: '3D Art',
      icon: 'ri-shapes-line',
      context: 'Modeling, unwrapping and rigging assets for real-time games.',
      levels: {
        veryGood: [],
        good: ['Low-Poly', '3D Low-Poly Environment', 'Low-Poly Props', 'UV Unwrapping'],
        learning: [
          'High-Poly',
          '3D Soft Surfaces',
          '3D High-Poly Vehicle',
          'Rigging',
          'Animation',
          'PS1 Texture',
        ],
      },
    },
    {
      title: 'Game Design',
      icon: 'ri-map-2-line',
      context: 'Shaping how a game plays, flows and feels.',
      levels: {
        veryGood: [],
        good: ['Player Flow', 'Game Balancing'],
        learning: ['Pacing', 'Narrative Design'],
      },
    },
    {
      title: 'Game Testing & QA',
      icon: 'ri-bug-line',
      context: 'Finding, reporting and verifying issues before players do.',
      levels: {
        veryGood: [],
        good: ['Playtesting', 'Feedback', 'Bug Reporting'],
        learning: ['Documentation', 'Test Case', 'Regression Testing'],
      },
    },
    {
      title: 'Web & UI',
      icon: 'ri-layout-4-line',
      context: 'Designing and building interfaces for the web.',
      levels: {
        veryGood: [],
        good: ['UI/UX Design', 'Wireframing', 'Prototyping'],
        learning: ['Responsive Layout', 'Front-End Development'],
      },
    },
  ],
};

export const experiences = {
  title: 'Experiences',
  items: [
    {
      position: 'Procurement and Vendor Negotiator',
      date: 'Jul 2026 – Present',
      company: 'DEVCON Laguna',
      type: 'Organization',
      summary:
        'Negotiating and establishing mutually beneficial supplier agreements.',
      description:
        "I'm responsible for negotiating and establishing mutually beneficial agreements between buyers and suppliers when acquiring goods or services. My role goes beyond simple price negotiations, covering pricing structures, delivery schedules, quality standards, payment terms, and service level agreements (SLAs) to ensure that both parties reach a fair and effective agreement.",
    },
    {
      position: 'Student Volunteer',
      date: '2026',
      company: 'DEVCON Laguna',
      type: 'Organization',
      summary: 'Assisted with student navigation and workshop lab routing.',
      description:
        'Guided students to their designated seating areas and directed attendees to the computer laboratories for their workshops.',
    },
    {
      position: 'Logistics Director',
      date: '2025',
      company: 'Junior Blockchain Education Consortium of the Philippines - Laguna',
      type: 'Organization',
      summary: 'Coordinated event procurement, inventory, and transportation.',
      description:
        'I coordinated suppliers, managed inventory, and handled transportation to procure food, strengthening my organization and coordination skills.',
    },
    {
      position: 'Logistics Lead',
      date: 'Mar 2024 – May 2025',
      company: 'AWS Cloud Club - University of Cabuyao',
      type: 'Organization',
      summary: 'Led booth setup, merchandise inventory, and event logistics.',
      description:
        'I organized event booths, managed merchandise inventory, tracked available stock, and coordinated logistical preparations to keep event operations running smoothly.',
    },
    {
      position: 'Volunteer',
      date: '2024',
      company: 'Junior Blockchain Education Consortium of the Philippines - Dangals',
      type: 'Organization',
      summary: 'Helped run an event booth in a fast-paced environment.',
      description:
        'Volunteered as a booth assistant during event, improving communication, teamwork, and efficiency in fast-paced environments.',
    },
    {
      position: 'Data Encoder',
      date: 'Jan 2024',
      company: 'CITECH: Cabuyao Institute of Technology',
      type: 'Work Immersion',
      summary: 'Managed student registration and grade records.',
      description:
        'Accurately encoded and managed student registrations and grades, ensuring data integrity and efficiency.',
    },
  ],
};

// The cards under the main achievement. A slot without a `title` shows as a
// placeholder and isn't counted in the Techstack "Certification" stat.
//   title    - what it was for, as printed on the certificate
//   type     - kind of certificate (the tag): Participation, Attendance...
//   issuer   - issuing organization
//   date     - as printed on the certificate
//   badge    - optional Remix icon class or image path
//   pdf      - imported PDF from assets/images/certificates (opens in a new tab)
//   preview  - imported image of the PDF's first page (certificates/previews)
//   pages, fileSize - shown on the card
export const certificates = {
  title: 'Certificates',
  items: [
    {
      id: 1,
      title: 'SIKAPTala 2026: Virtual Hackathon',
      type: 'Participation',
      issuer: 'De La Salle University-Dasmariñas, CICS Student Government',
      date: 'May 31, 2026',
      badge: 'ri-code-s-slash-line',
      pdf: sikaptalaPdf,
      preview: sikaptalaPreview,
      pages: 2,
      fileSize: '1.2 MB',
    },
    {
      id: 2,
      title: 'Internship Onboarding Orientation 2026',
      type: 'Attendance',
      issuer: 'University of Cabuyao (Pamantasan ng Cabuyao)',
      date: 'Nov 10, 2026',
      badge: 'ri-briefcase-4-line',
      pdf: orientationPdf,
      preview: orientationPreview,
      pages: 1,
      fileSize: '208 KB',
    },
    {
      id: 3,
      title: 'PNC Kalikasan Community Pantry',
      type: 'Involvement',
      issuer: 'University of Cabuyao (Pamantasan ng Cabuyao)',
      date: 'Sep 9–10, 2026',
      badge: 'ri-leaf-line',
      pdf: pantryPdf,
      preview: pantryPreview,
      pages: 1,
      fileSize: '203 KB',
    },
    {
      id: 4,
      title: 'Ignite Philippines',
      type: 'Completion · 42 hours',
      issuer: 'Wadhwani Foundation',
      date: 'May 2, 2026',
      badge: 'ri-lightbulb-line',
      pdf: ignitePdf,
      preview: ignitePreview,
      pages: 1,
      fileSize: '35 KB',
    },
  ],
};

export const achievementHighlights = [
  {
    id: 'rank-8-overall',
    title: 'RANK 8',
    subtitle: 'OVERALL',
    label: '01 HACKATHON',
    event: 'SIKAPTala 2026: The National CS & IT Competition!',
    projectTitle: 'LUNAS',
    description:
      "Lunas is a secure, web-based emergency medical information platform that gives licensed medical professionals instant access to a patient's critical health data via a QR code — even when the patient is unconscious or unable to speak.",
    image: lunasImage,
    url: 'https://lunas.software/',
  },
];

// Education on the Overview page: one featured college card plus a short
// list of other schools (name and years only).
//
// Images: imported from src/assets/images/logos (see the imports at the top).
// A path in public/ also works, e.g. photo: '/images/education/campus.jpg'.
// Set a value to null to show a neutral placeholder instead (it also shows if
// an image fails to load).
const EDUCATION_FEATURED = {
  level: 'Undergraduate',
  school: 'University of Cabuyao',
  schoolLocalName: 'Pamantasan ng Cabuyao',
  program: 'Bachelor of Science in Computer Science',
  department: 'College of Computing Studies', // hidden while empty
  description:
    'Pursuing a Bachelor of Science in Computer Science at the University of Cabuyao (Pamantasan ng Cabuyao), one of the leading local colleges and universities in the Philippines.',
  years: '2023 – 2027',
  location: 'Cabuyao City, Laguna',
  photo: schoolPhoto, // campus or building photo, landscape
  schoolLogo: universityLogo, // square image; shown as a circle (round seals)
  departmentLogo: departmentLogoImage, // square image; shown as a circle
  // Map card beside the education cards (a keyless Google Maps embed).
  map: {
    query: 'University of Cabuyao, Cabuyao City, Laguna, Philippines',
    label: 'Cabuyao City, Laguna, Philippines',
    zoom: 15,
  },
};

const EDUCATION_OTHERS = [
  {
    level: 'Senior High School · STEM',
    school: 'Pamantasan ng Cabuyao',
    years: '2021 – 2023',
  },
  {
    level: 'Junior High School',
    school: 'Liceo De Cabuyao / Liceo De Calamba',
    years: '2016 – 2021',
  },
];

export const education = {
  title: 'Education',
  othersTitle: 'Other schools',
  featured: EDUCATION_FEATURED,
  others: EDUCATION_OTHERS,
  // Flat list (newest first) for the profile hero and the portfolio assistant.
  items: [
    {
      date: EDUCATION_FEATURED.years,
      level: EDUCATION_FEATURED.level,
      school: EDUCATION_FEATURED.program,
      institutions: [EDUCATION_FEATURED.school],
      description: EDUCATION_FEATURED.description,
    },
    ...EDUCATION_OTHERS.map((item) => ({
      date: item.years,
      level: item.level,
      school: item.level,
      institutions: item.school.split(' / '),
    })),
  ],
};

// Portfolio hub categories. Set `image` to an imported image to replace the
// placeholder artwork behind a card, or `slides` to rotate several images.
export const portfolioHub = {
  title: 'Portfolio',
  prompt: 'Select a category',
  // Page header (same layout as the Techstack section).
  eyebrow: 'Portfolio // Select a category',
  titleLines: ['Selected', 'work'],
  intro:
    'Everything I have built and shared in one place: games and apps I developed, the 3D models behind them, and free assets you can download for your own projects.',
  categories: [
    {
      id: 'projectlist',
      title: 'Developed Software',
      description:
        'Games, web and mobile apps I have designed and built, from published titles to personal projects.',
      icon: 'ri-code-s-slash-line',
      image: null,
      // Project background artwork (not logos), cycled every 5 seconds.
      slides: showcaseProjects.items
        .filter((project) => project.image)
        .map((project) => ({ src: project.image, alt: project.title })),
      tone: 'software',
    },
    {
      id: 'models',
      title: '3D Model Projects',
      description:
        'Interactive 3D model showcase. Drag any model to rotate it and inspect it from every angle.',
      icon: 'ri-box-3-line',
      image: modelsHubBackground,
      tone: 'models',
    },
    {
      id: 'assets',
      title: 'Download Free Assets',
      description:
        'Free 3D models from my projects. Preview them in 3D, then download them for your own games and scenes.',
      icon: 'ri-download-2-line',
      image: null,
      video: assetsHubVideo,
      // The video's first frame: shown while it loads, and for reduced motion.
      poster: assetsHubPoster,
      tone: 'overview',
    },
  ],
};

// 3D model showcase.
// Cards are generated from every .glb in public/models: the list is written to
// models.generated.json by scripts/generate-model-manifest.js before each
// `npm start` / `npm run build`. The filename suffix sets the category
// (_Character, _Props, _Environment, _Vehicle) and the rest becomes the title.
//
// `modelOverrides` (keyed by filename) can change any field:
//   title, category, description, or `focus`: the names of the objects to
//   show when a file contains a whole scene (everything else is hidden).
const modelOverrides = {
  'GoCart_Vehicle.glb': { title: 'GoCart' },
  // Kamote's rig has no "Kamote" mesh; its character mesh is "Character".
  'Kamote_Character.glb': { title: 'Delivery Rider', focus: ['Character'] },
  'BlueCar_Vehicle.glb': { title: 'Purple Car' },
  'WheelChair_Vehicles.glb': {
    title: 'Wheelchair',
    focus: ['WELCHER_W/HOOMAN'],
  },
  'Jeep_Vehicles.glb': { focus: ['[OUTRUN] Jeep_1'] },
  'Police_Patrol_Vehicles.glb': { focus: ['[OUTRUN] Police_Patrol'] },
  'Police_Sedan_Vehicles.glb': { focus: ['[OUTRUN] Police_Sedan'] },
  'Sedan_Vehicles.glb': { focus: ['Sedan_1'] },
  'Truck_Vehicles.glb': { focus: ['[OUTRUN] Truck_2'] },
  'NoParking_Environment.glb': { focus: ['NoParking'] },
  'Poste_Environment.glb': { focus: ['ElectricPole_1'] },
  'Sorbetero_Environment.glb': { focus: ['Vendor_1'] },
  'Basyo_Props.glb': { focus: ['WaterGalon'] },
  'Gasul_Props.glb': { focus: ['GASUL'] },
};

const MODEL_CATEGORIES = ['Character', 'Props', 'Environment', 'Vehicle'];

// Defaults applied to every model in a category (a per-file override wins).
// Each *_Character.glb contains every character variant on one shared rig
// (meshes named "Racer", "Police", "_Marites", ...), so a character card
// shows only the mesh named after its file. Files without such a mesh fall
// back to showing everything (with a console warning).
const categoryDefaults = {
  Character: (file) => {
    const name = file.replace(/_characters?\.glb$/i, '');
    return { focus: [name, `_${name}`] };
  },
};

// Free downloadable assets ("Download Free Assets by Christian").
// Each entry has two files in public/models:
//   file     - the .glb shown in the 3D preview (kept out of the 3D Model
//              Projects gallery)
//   download - the native Blender .blend file visitors download
// `id` is the key the Like button stores in public.asset_likes (lowercase
// letters, digits and dashes). Keep it stable once published, or that asset's
// like count starts again from zero.
const FREE_ASSET_ENTRIES = [
  {
    id: 'dummy-no-rigs',
    file: 'Dummy (No Rigs).glb',
    download: 'Lowpoly_Dummy (Without Rig).blend',
    title: 'Dummy (No Rigs)',
    category: 'Character',
    // The .glb holds a whole scene; the preview shows just this dummy.
    focus: ['Dummy (w/out rig)'],
    description:
      'A low-poly base dummy character as a static mesh, saved as a native Blender file. Use it as a stand-in, a scale reference, or a starting point for your own rig.',
    includes: [
      'Native Blender .blend file (Blender 3.0 or newer)',
      'Static low-poly character mesh, no armature',
      'Export to FBX or glTF for Unity, Godot and three.js',
    ],
  },
  {
    id: 'dummy-with-rigs',
    file: 'Dummy (With Rigs).glb',
    download: 'Lowpoly_Dummy (With Rig).blend',
    title: 'Dummy (With Rigs)',
    category: 'Character',
    focus: ['Dummy (w/rig)'],
    description:
      'The same low-poly dummy with a 65-bone humanoid armature (metarig), saved as a native Blender file and ready for you to pose and animate.',
    includes: [
      'Native Blender .blend file (Blender 3.0 or newer)',
      'Low-poly character mesh plus a 65-bone humanoid armature',
      'Export to FBX or glTF for Unity, Godot and three.js',
    ],
  },
];

const FREE_ASSET_FILES = new Set(FREE_ASSET_ENTRIES.map((entry) => entry.file));

export const modelShowcase = {
  eyebrow: 'Portfolio / 3D Models',
  title: '3D MODELS',
  subtitle: 'My 3D Assets used in projects and self projects.',
  categories: MODEL_CATEGORIES,
  pageSize: 9,
  items: generatedModels.filter((model) => !FREE_ASSET_FILES.has(model.file)).map((model) => {
    const override = modelOverrides[model.file] || {};
    const category = MODEL_CATEGORIES.includes(override.category || model.category)
      ? override.category || model.category
      : 'Props';
    const defaults = categoryDefaults[category]?.(model.file) || {};
    const merged = { ...model, ...defaults, ...override };
    return {
      ...merged,
      category,
      model: `models/${model.file}`,
      description:
        merged.description || `${category === 'Props' ? 'Prop' : category} model.`,
    };
  }),
};

// ---------------------------------------------------------------------------
// Free downloadable assets: the list itself is FREE_ASSET_ENTRIES, above the
// 3D model showcase.

function formatFileSize(bytes) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export const freeAssets = {
  eyebrow: 'Portfolio / Free Assets',
  title: 'Download Free Assets by Christian',
  subtitle:
    'Free 3D models from my projects as native Blender (.blend) files. Preview them here, then download and use them in your own scenes.',
  items: FREE_ASSET_ENTRIES.map((entry) => {
    if (!generatedModels.some((item) => item.file === entry.file)) {
      throw new Error(`Free asset preview "${entry.file}" was not found in public/models.`);
    }
    if (!(entry.download in generatedDownloads)) {
      throw new Error(`Free asset download "${entry.download}" was not found in public/models.`);
    }
    // Spaces and brackets in file names are escaped for the URL; the
    // downloaded file keeps its original name.
    const previewPath = `models/${encodeURIComponent(entry.file)}`;
    return {
      id: entry.id,
      title: entry.title,
      category: entry.category,
      model: previewPath,
      focus: entry.focus,
      download: `${process.env.PUBLIC_URL || ''}/models/${encodeURIComponent(entry.download)}`,
      downloadName: entry.download,
      format: 'BLEND',
      size: formatFileSize(generatedDownloads[entry.download]),
      description: entry.description,
      includes: entry.includes,
    };
  }),
};
