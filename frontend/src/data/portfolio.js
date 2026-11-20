import lunasImage from '../assets/images/projects/lunas.png';
import OutrunLoadingBackground from '../assets/images/projects/outrun.png';
import Triggr from '../assets/images/projects/triggr.png';
import alalaybarangay from '../assets/images/projects/alalay-barangay.png';
import modelsHubBackground from '../assets/images/projects/3dbgm.jpg';
import mutedImage from '../assets/images/projects/MutedBackground.png';
import mutedLogo from '../assets/images/logos/mutedapplogo.png';
import outrunPfp from '../assets/images/logos/outrun.png';
import lunasPfp from '../assets/images/logos/lunas.png';
import alalayBarangayPfp from '../assets/images/logos/alalay-barangay.jpg';
import triggrPfp from '../assets/images/logos/triggr.png';
import schoolPhoto from '../assets/images/logos/schoolimg.jpg';
import universityLogo from '../assets/images/logos/University-of-Cabuyao-logo.jpg';
import departmentLogoImage from '../assets/images/logos/College-of-Computing-Logo.jpg';
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

export const navPrimary = [
  { id: 'home', label: 'Home', icon: 'ri-home-4-line' },
  { id: 'about', label: 'About', icon: 'ri-user-3-line' },
  { id: 'projects', label: 'Projects', icon: 'ri-code-s-slash-line' },
];

export const navSecondary = [
  { id: 'portfolio', label: 'Portfolio', icon: 'ri-layout-grid-line' },
  { id: 'background', label: 'Overview', icon: 'ri-user-3-line' },
  { id: 'techstack', label: 'Techstack', icon: 'ri-code-box-line' },
  {
    id: 'recommendation',
    label: 'Recommendations',
    icon: 'ri-chat-quote-line',
  },
];

export const homeSectionIds = [
  'home',
  'about',
  'projects',
  'contact',
  'aichatbot',
];

export const projectListSectionIds = ['projectlist'];

export const portfolioSectionIds = ['portfolio', 'arcade'];

export const modelSectionIds = ['models'];

// Views under the "Portfolio" nav item (shown as active while one is open).
// Overview (#background) is also reachable from the hub but has its own nav
// item, so it isn't listed here.
export const assetSectionIds = ['assets'];

export const portfolioViews = ['portfolio', 'projectlist', 'models', 'assets'];

export const backgroundSectionIds = [
  'educations',
  'certificates',
  'skills',
  'techstack-preview',
  'experiences',
];

export const techstackSectionIds = ['techstack'];

export const recommendationSectionIds = [
  'recommendation',
  'recommendation-form',
  'published-recommendations',
];

export const about = {
  title: 'About Me',
  heading: "Hi! I'm Christian",
  eyebrow: 'About Me',
  icon: 'ri-information-line',
  cvLabel: 'MY RESUME',
  cvUrl: '/Christian-Raphael-Carandang-Resume.pdf',
  mailUrl: 'mailto:carandangchristianra@gmail.com',
  paragraphs: [
    "Hello! I'm Christian Raphael A. Carandang, a passionate Computer Science student who enjoys exploring the creative and technical sides of technology. I'm particularly interested in 3D modeling, animation, C# programming, and visual design, where I get to combine creativity with problem-solving to bring ideas to life.",
    "I enjoy working on hands-on projects that allow me to develop my skills, experiment with new technologies, and turn concepts into meaningful digital experiences. I'm always eager to learn, take on new challenges, and collaborate with others who share the same passion for creating innovative and engaging projects.",
  ],
};

export const floatingActions = {
  actions: [
    { id: 'contact', label: 'Contact', icon: 'ri-mail-line', url: 'mailto:carandangchristianra@gmail.com' },
    { id: 'cv', label: 'CV', icon: 'ri-download-2-line', url: '/Christian-Raphael-Carandang-Resume.pdf' },
    { id: 'github', label: 'GitHub', icon: 'ri-github-line', url: 'https://github.com/cntaxc' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-line', url: 'https://www.linkedin.com/in/christian-carandang-b30015334/' },
  ],
};

export const showcaseProjects = {
  title: 'PROJECTS',
  eyebrow: 'Things I\'ve built',
  items: [
    {
      id: 'outrun',
      title: 'OUTRUN',
      published: true,
      category: 'SCHOOL PROJECT',
      role: 'UI Designer & 3D Artist',
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
      title: 'MUTED',
      published: false,
      category: 'SCHOOL PROJECT',
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
      title: 'LUNAS',
      published: true,
      category: 'HACKATHON',
      role: 'Front-End Developer',
      badge: 'HACKATHON',
      description:
        'Lunas is a secure, web-based emergency medical information platform that gives licensed medical professionals instant access to a patient\'s critical health data via a QR code — even when the patient is unconscious or unable to speak.',
      platforms: ['PC'],
      tools: [
        { label: 'React.js', icon: 'ri-reactjs-line' },
        { label: 'Next.js', icon: 'ri-css3-line' },
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
  JavaScript: { level: 'Intermediate', context: 'Interactive frontend behavior' },
  React: { level: 'Intermediate', context: 'Component-driven interfaces' },
  'Next.js': { level: 'Familiar', context: 'Full-stack React applications' },
  'Tailwind CSS': { level: 'Familiar', context: 'Utility-first UI development' },
  USS: { level: 'Intermediate', context: 'Unity Style Sheets for game interfaces' },
  'UI Toolkit': { level: 'Intermediate', context: 'Unity interface construction' },
  'Lua Script': { level: 'Familiar', context: 'Gameplay scripting and systems' },
  'C#': { level: 'Intermediate', context: 'Unity gameplay and tooling' },
  Java: { level: 'Intermediate', context: 'Backend and academic development' },
  PHP: { level: 'Familiar', context: 'Backend web development' },
  Python: { level: 'Familiar', context: 'Scripting, AI experiments and tooling' },
  'Node.js': { level: 'Familiar', context: 'APIs and server-side JavaScript' },
  Laravel: { level: 'Familiar', context: 'PHP web applications' },
  PostgreSQL: { level: 'Familiar', context: 'Relational data modeling' },
  MySQL: { level: 'Familiar', context: 'Relational databases' },
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
  'Paint.NET': { level: 'Intermediate', context: 'Texture and image editing' },
  Shoebox: { level: 'Intermediate', context: 'Sprite sheet preparation' },
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
};

const techstackCategories = [
  {
    title: 'FRONTEND',
    tags: [
      'HTML/CSS',
      'JavaScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'USS',
      'UI Toolkit',
      'Lua Script',
      'C#',
    ],
  },
  {
    title: 'BACKEND',
    tags: [
      'Java',
      'PHP',
      'Python',
      'Node.js',
      'Laravel',
      'PostgreSQL',
      'MySQL',
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

export const techstackPreview = {
  title: 'TECHSTACK',
  subtitle: 'The languages, frameworks and tools I work with most.',
  visibleCount: 12,
  rotationInterval: 4000,
  skills: techstackPreviewSkills,
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
      date: '2026',
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
      position: 'Logistics Officer',
      date: '2024 - 2025',
      company: 'AWS Cloud Club - University of Cabuyao',
      type: 'Organization',
      summary: 'Supported supplier, inventory, and booth operations.',
      description:
        'I handled suppliers, managed inventory, and oversaw booth operations, improving my organization and coordination skills.',
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
      date: '2023',
      company: 'CITECH: Cabuyao Institute of Technology',
      type: 'Work Immersion',
      summary: 'Managed student registration and grade records.',
      description:
        'Accurately encoded and managed student registrations and grades, ensuring data integrity and efficiency.',
    },
  ],
};

export const certificates = {
  title: 'Certificates',
  items: [
    { id: 1, name: 'React Fundamentals', issuer: 'Coursera', date: '2024' },
    { id: 2, name: 'Web Development', issuer: 'Udemy', date: '2024' },
    { id: 3, name: 'UI/UX Design', issuer: 'Figma Academy', date: '2023' },
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
