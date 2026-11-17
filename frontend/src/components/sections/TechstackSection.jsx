import { useState } from 'react';
import BackButton from '../BackButton';
import SectionHeading from '../SectionHeading';
import { techstack, techstackLevels } from '../../data/portfolio';

const levelFilters = ['All', ...techstackLevels];
const levelRatings = {
  Proficient: 3,
  Intermediate: 2,
  Familiar: 1,
};

export default function TechstackSection({ onBack }) {
  const [activeLevel, setActiveLevel] = useState('All');

  const filteredCategories = techstack.categories
    .map((category) => ({
      ...category,
      items:
        activeLevel === 'All'
          ? category.items
          : category.items.filter((item) => item.level === activeLevel),
    }))
    .filter((category) => category.items.length > 0);

  const visibleSkillCount = filteredCategories.reduce(
    (total, category) => total + category.items.length,
    0
  );

  return (
    <section
      id="techstack"
      className="section section-panel section-panel--techstack"
      aria-label={techstack.title}
      data-reveal
    >
      <div className="page-topbar">
        <BackButton onClick={onBack} />
      </div>

      <SectionHeading
        title={techstack.title}
        action={
          <div
            className="techstack-filters"
            role="group"
            aria-label="Filter technologies by proficiency"
          >
            {levelFilters.map((level) => {
              const isActive = activeLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  className={`techstack-filter${isActive ? ' is-active' : ''}`}
                  data-level={level === 'All' ? undefined : level.toLowerCase()}
                  aria-pressed={isActive}
                  onClick={() => setActiveLevel(level)}
                >
                  {level !== 'All' ? (
                    <span className="techstack-filter__dot" aria-hidden="true"></span>
                  ) : null}
                  <span>{level}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <p className="sr-only" role="status">
        Showing {visibleSkillCount} technologies filtered by {activeLevel}.
      </p>

      {filteredCategories.length ? (
        <div className="techstack-grid" key={activeLevel}>
          {filteredCategories.map((category) => (
            <article key={category.title} className="techstack-card">
              <h3 className="techstack-card__title">{category.title}</h3>
              <ul className="techstack-skill-list">
                {category.items.map((item) => {
                  const rating = levelRatings[item.level] ?? 0;

                  return (
                    <li
                      key={`${category.title}-${item.label}`}
                      className="techstack-skill-row"
                      data-level={item.level.toLowerCase()}
                    >
                      <span className="techstack-skill-row__name">{item.label}</span>
                      <span className="techstack-skill-row__level">
                        <span className="techstack-level-bar" aria-hidden="true">
                          {[1, 2, 3].map((step) => (
                            <span
                              key={step}
                              className={`techstack-level-circle${
                                step <= rating ? ' is-filled' : ''
                              }`}
                            />
                          ))}
                        </span>
                        <span className="techstack-skill-row__level-label">
                          {item.level}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <p className="techstack-empty">
          No technologies match this proficiency level.
        </p>
      )}
    </section>
  );
}
