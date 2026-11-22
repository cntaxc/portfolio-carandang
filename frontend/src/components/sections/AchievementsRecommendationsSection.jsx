import { useState } from 'react';
import SectionEyebrow from '../SectionEyebrow';
import CertificationCard from '../CertificationCard';
import { achievementHighlights, certificates } from '../../data/portfolio';
import '../../styles/certifications.css';

export default function AchievementsRecommendationsSection() {
  const [activeAchievementIndex, setActiveAchievementIndex] = useState(0);
  const activeAchievement = achievementHighlights[activeAchievementIndex];
  const hasMultipleAchievements = achievementHighlights.length > 1;

  const moveAchievement = (offset) => {
    setActiveAchievementIndex(
      (index) =>
        (index + offset + achievementHighlights.length) %
        achievementHighlights.length
    );
  };

  const FeatureCard = activeAchievement.url ? 'a' : 'article';

  return (
    <section
      id="certificates"
      className="section section-panel section-panel--achievements achievements-recommendations"
      data-reveal
    >
      <div className="achievements-recommendations__head">
        <div className="split-section__heading">
          <SectionEyebrow sectionId="certificates" />
          <h2>Achievements</h2>
        </div>
      </div>

      <div className="achievement-column">
        <FeatureCard
          key={activeAchievement.id}
          className={`achievement-feature-card${
            activeAchievement.url ? ' is-clickable' : ''
          }`}
          href={activeAchievement.url || undefined}
          target={activeAchievement.url ? '_blank' : undefined}
          rel={activeAchievement.url ? 'noreferrer' : undefined}
          aria-label={
            activeAchievement.url
              ? `Open ${activeAchievement.projectTitle} project website`
              : undefined
          }
        >
          <article className="achievement-feature-card__milestone">
            <span className="achievement-highlight__label">
              {activeAchievement.label}
            </span>
            <span className="achievement-highlight__rank">
              <strong>{activeAchievement.title}</strong>
              <span>{activeAchievement.subtitle}</span>
            </span>
            <div className="achievement-highlight__event">
              {activeAchievement.event}
            </div>
            <div className="achievement-highlight__project-details">
              <strong>{activeAchievement.projectTitle}</strong>
              <p>{activeAchievement.description}</p>
            </div>
          </article>

          <div className="achievement-feature-card__preview">
            {activeAchievement.image ? (
              <img
                className="achievement-highlight__image"
                src={activeAchievement.image}
                alt="Lunas website and device mockups"
              />
            ) : (
              <span
                className="achievement-feature-card__empty-preview"
                aria-hidden="true"
              >
                <i className="ri-image-line"></i>
              </span>
            )}
          </div>
        </FeatureCard>

        {hasMultipleAchievements ? (
          <div className="achievement-carousel-controls">
            <button
              type="button"
              className="icon-btn"
              onClick={() => moveAchievement(-1)}
              aria-label="Previous achievement"
            >
              <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
            </button>
            <div
              className="achievement-carousel-controls__dots"
              role="group"
              aria-label="Choose an achievement"
            >
              {achievementHighlights.map((achievement, index) => (
                <button
                  key={achievement.id}
                  type="button"
                  className={`recommendations__dot${
                    index === activeAchievementIndex ? ' is-active' : ''
                  }`}
                  onClick={() => setActiveAchievementIndex(index)}
                  aria-label={`Show achievement ${index + 1}`}
                  aria-current={
                    index === activeAchievementIndex ? 'true' : undefined
                  }
                ></button>
              ))}
            </div>
            <span className="achievement-carousel-controls__count">
              {String(activeAchievementIndex + 1).padStart(2, '0')} /{' '}
              {String(achievementHighlights.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => moveAchievement(1)}
              aria-label="Next achievement"
            >
              <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
            </button>
          </div>
        ) : null}

        {/* Certifications: part of Achievements, directly under the highlight */}
        <ul className="cert-grid" aria-label="Certifications">
          {certificates.items.map((certificate, index) => (
            <CertificationCard
              key={certificate.id}
              certificate={certificate}
              number={index + 1}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
