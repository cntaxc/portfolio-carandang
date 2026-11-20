import SectionHeading from '../SectionHeading';
import { skillLevels, skills } from '../../data/portfolio';
import '../../styles/skills.css';

// Skills on the Overview page: one card per craft area, with the skills as
// pills grouped under a white level dot (Good, Learning, ...). Levels
// with no skills are left out. Content lives in `skills` in
// src/data/portfolio.js.

const LEVEL_KEYS = Object.keys(skillLevels); // highest first

// Only the levels that actually have skills somewhere get a legend entry.
const USED_LEVELS = LEVEL_KEYS.filter((key) =>
  skills.groups.some((group) => group.levels[key]?.length)
);

function LevelLabel({ level }) {
  return (
    <span className={`skills-dot-label skills-tone--${skillLevels[level].tone}`}>
      <span className="skills-dot" aria-hidden="true"></span>
      {skillLevels[level].label}
    </span>
  );
}

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="section section-panel section-panel--skills"
      aria-label={skills.title}
      data-reveal
    >
      <div className="skills-header">
        <div className="skills-header__text">
          <SectionHeading title={skills.title} />
          {skills.subtitle ? <p className="skills-header__subtitle">{skills.subtitle}</p> : null}
        </div>
        <ul className="skills-legend" aria-label="Levels">
          {USED_LEVELS.map((key) => (
            <li key={key}>
              <LevelLabel level={key} />
            </li>
          ))}
        </ul>
      </div>

      <div className="skills-grid">
        {skills.groups.map((group) => (
          <article className="skills-card" key={group.title}>
            <header className="skills-card__header">
              <i className={group.icon} aria-hidden="true"></i>
              <h3>{group.title}</h3>
            </header>

            {LEVEL_KEYS.filter((key) => group.levels[key]?.length).map((key) => (
              <div className={`skills-group skills-tone--${skillLevels[key].tone}`} key={key}>
                <LevelLabel level={key} />
                <ul className="skills-pills" aria-label={`${group.title}: ${skillLevels[key].label}`}>
                  {group.levels[key].map((skill) => (
                    <li className="skills-pill" key={skill}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
