import { useRef, useState } from 'react';
import {
  achievementHighlights,
  certificates,
  professionalSummary,
  showcaseProjects,
  techstackPreview,
} from '../../data/portfolio';
import SectionEyebrow from '../SectionEyebrow';
import '../../styles/toolkit.css';

const pad2 = (value) => String(value).padStart(2, '0');

const { titleLines, groups, toolkitLabel, skills } = techstackPreview;

// Bottom stat blocks, counted from the portfolio data so they stay current.
const competitionCount = achievementHighlights.filter(({ label, event }) =>
  /hackathon|competition|game jam/i.test(`${label} ${event}`)
).length;
const STATS = [
  { label: 'Projects', value: pad2(showcaseProjects.items.length) },
  { label: 'Competition', value: pad2(competitionCount) },
  { label: 'Certification', value: pad2(certificates.items.length) },
  { label: 'Years of exp', value: professionalSummary.yearsOfExperience, unit: 'YRS' },
];

/**
 * Techstack ("What I work with"), following the capabilities layout:
 *   header   - eyebrow, two-line title (second line outlined), View all tools
 *              on the right, level with the end of the divider
 *   groups   - numbered list (left) driving a detail panel (right): index,
 *              headline, description and the group's tools as tags
 *   toolkit  - bordered strip with every tool looping across (pauses on
 *              hover, static for reduced motion)
 *   stats    - Projects / Competition / Certification / Years of exp as big
 *              numbers, split by vertical dividers
 */
export default function TechstackPreviewSection({ onViewAll }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const active = groups[activeIndex];

  // Up / down arrows move through the list (focus follows).
  const onListKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (activeIndex + step + groups.length) % groups.length;
    setActiveIndex(next);
    listRef.current?.querySelectorAll('.stack-list__item')[next]?.focus();
  };

  // The strip: every tool, twice in a row; sliding by one copy loops seamlessly.
  const toolkitGroup = (copy) => (
    <ul className="stack-toolkit__group" aria-hidden={copy ? 'true' : undefined}>
      {skills.map((skill) => (
        <li key={skill.label}>{skill.label}</li>
      ))}
    </ul>
  );

  return (
    <section
      id="techstack-preview"
      className="section section-panel techstack-preview stack"
      aria-labelledby="techstack-preview-title"
      data-reveal
    >
      {/* ---- Header -------------------------------------------------------- */}
      <header className="stack__head">
        <div>
          <SectionEyebrow sectionId="techstack-preview" />
          <h2 id="techstack-preview-title" className="stack__title">
            {titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>
        <a
          href="#techstack"
          className="stack__view-all"
          onClick={(event) => {
            event.preventDefault();
            onViewAll?.();
          }}
        >
          View all tools
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </a>
      </header>

      {/* ---- Groups: list (left) + detail (right) ------------------------------ */}
      <div className="stack__split">
        <ul
          ref={listRef}
          className="stack-list"
          aria-label="Techstack groups"
          onKeyDown={onListKeyDown}
        >
          {groups.map((group, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={group.title}>
                <button
                  type="button"
                  className={`stack-list__item${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  aria-controls="stack-detail"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className="stack-list__index">{pad2(index + 1)}</span>
                  <span className="stack-list__text">
                    <span className="stack-list__title">{group.title}</span>
                    <span className="stack-list__subtitle">{group.subtitle}</span>
                  </span>
                  <span className="stack-list__ring" aria-hidden="true"></span>
                </button>
              </li>
            );
          })}
        </ul>

        <article id="stack-detail" className="stack-detail" aria-live="polite" key={activeIndex}>
          <span className="stack-detail__index">{pad2(activeIndex + 1)}</span>
          <h3 className="stack-detail__headline">{active.headline}</h3>
          <p className="stack-detail__desc">{active.description}</p>
          <ul className="stack-detail__tags" aria-label={`${active.title} tools`}>
            {active.items.map((item) => (
              <li key={item.label} title={`${item.level}: ${item.context}`}>
                <span
                  className={`stack-dot stack-dot--${item.level.toLowerCase()}`}
                  aria-hidden="true"
                ></span>
                {item.label}
                <span className="sr-only">, {item.level}</span>
              </li>
            ))}
          </ul>
          <ul className="stack-detail__legend" aria-hidden="true">
            {['Proficient', 'Intermediate', 'Familiar'].map((level) => (
              <li key={level}>
                <span className={`stack-dot stack-dot--${level.toLowerCase()}`}></span>
                {level}
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* ---- Stacks strip (looping) ------------------------------------------- */}
      <div className="stack-toolkit">
        <div className="stack-toolkit__head">
          <span className="stack-toolkit__label">{toolkitLabel}</span>
          <span className="stack-toolkit__rule" aria-hidden="true"></span>
          <span className="stack-toolkit__count">{pad2(skills.length)} tools</span>
        </div>
        <div className="stack-toolkit__marquee" aria-label={`${toolkitLabel}: all tools`}>
          <div
            className="stack-toolkit__track"
            style={{ '--marquee-duration': `${Math.max(40, skills.length * 1.8)}s` }}
          >
            {toolkitGroup(false)}
            {toolkitGroup(true)}
          </div>
        </div>
      </div>

      {/* ---- Bottom stats ------------------------------------------------------ */}
      <dl className="stack-stats" aria-label="Highlights">
        {STATS.map((stat) => (
          <div className="stack-stats__item" key={stat.label}>
            <dt className="stack-stats__label">{stat.label}</dt>
            <dd className="stack-stats__value">
              {stat.value}
              {stat.unit ? <span className="stack-stats__unit">{stat.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
