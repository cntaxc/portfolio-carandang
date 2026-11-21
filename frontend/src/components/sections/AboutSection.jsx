import {
  about,
  achievementHighlights,
  professionalSummary,
  showcaseProjects,
} from '../../data/portfolio';
import RecommendationsCarousel from '../RecommendationsCarousel';

const { focusAreas } = professionalSummary;

const competitionCount = achievementHighlights.filter(({ label, event }) =>
  /hackathon|competition|game jam/i.test(`${label} ${event}`)
).length;

const aboutStats = [
  { label: 'Projects', value: showcaseProjects.items.length },
  { label: 'Competitions', value: competitionCount },
  {
    label: 'Years of experience',
    value: professionalSummary.yearsOfExperience,
    unit: 'YRS',
  },
];

export default function AboutSection({ onViewRecommendations, onViewOverview }) {
  return (
    <section id="about" className="about-section section" data-reveal>
      <div className="about-section__content">
        <div className="about-section__columns">
          <article className="about-section__column about-section__about">
            <div className="about-section__heading">
              <span
                className="about-section__index about-section__index--quote"
              >
                <i className="ri-message-2-line" aria-hidden="true"></i>
              </span>
              <h2>ABOUT</h2>
              {onViewOverview ? (
                <a
                  className="about-section__overview"
                  href="#background"
                  onClick={(event) => {
                    event.preventDefault();
                    onViewOverview();
                  }}
                >
                  <span className="about-section__overview-label">Overview</span>
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </a>
              ) : null}
            </div>
            <div className="about-section__copy">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="about-section__signature">
              <strong>CHRISTIAN RAPHAEL CARANDANG</strong>
              <span>College Student at University of Cabuyao</span>
            </div>
          </article>

          <article className="about-section__column about-section__focus">
            <div className="about-section__heading">
              <span
                className="about-section__index about-section__index--target"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M12 12h.01"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h2>FOCUS</h2>
            </div>
            <ul className="about-section__focus-list">
              {focusAreas.map((area) => (
                <li className="about-section__focus-item" key={area.title}>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <dl className="about-section__stats" aria-label="Career highlights">
          {aboutStats.map((stat) => (
            <div className="about-section__stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                {stat.value}
                {stat.unit ? (
                  <span className="about-section__stat-unit">{stat.unit}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        <RecommendationsCarousel
          onViewRecommendations={onViewRecommendations}
        />
      </div>
    </section>
  );
}
