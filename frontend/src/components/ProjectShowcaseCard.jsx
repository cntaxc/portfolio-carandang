import { useCallback, useEffect, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { showcaseProjects } from '../data/portfolio';

// Project showcase carousel (Overview intro, right side): auto-slides through
// the showcase projects; ‹ › and the dots switch manually; hovering or
// focusing it pauses the slideshow. Clicking the active slide opens the
// project's link (new tab), or the Developed Software page when it has none.

const SLIDE_MS = 4500;
const PROJECTS = showcaseProjects.items;
const isRealLink = (url) => typeof url === 'string' && /^https?:\/\//.test(url);

export default function ProjectShowcaseCard({ onOpenProjects }) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const project = PROJECTS[index];

  const go = useCallback((step) => {
    setIndex((current) => (current + step + PROJECTS.length) % PROJECTS.length);
  }, []);

  // Auto-advance (restarts after every change, so a manual pick gets a full
  // slide's time). Paused while hovered/focused, with reduced motion, or in
  // a background tab.
  useEffect(() => {
    if (reducedMotion || isPaused || PROJECTS.length < 2) return undefined;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') go(1);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, isPaused, reducedMotion, go]);

  const openProject = () => {
    if (isRealLink(project.url)) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else {
      onOpenProjects?.();
    }
  };

  const hasLink = isRealLink(project.url);

  return (
    <section
      className={`showcase-card${isPaused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="Project showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <span className="journey__corner journey__corner--tl" aria-hidden="true"></span>
      <span className="journey__corner journey__corner--tr" aria-hidden="true"></span>
      <span className="journey__corner journey__corner--bl" aria-hidden="true"></span>
      <span className="journey__corner journey__corner--br" aria-hidden="true"></span>

      <div className="showcase-card__bar" aria-hidden="true">
        <span>showcase.exe</span>
        <span>
          {String(index + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Active slide: the whole picture is the link to the project */}
      <button
        type="button"
        className="showcase-card__slide"
        onClick={openProject}
        aria-label={`${project.title}: ${hasLink ? 'open the project (new tab)' : 'view in developed software'}`}
        key={project.id}
      >
        <span className="showcase-card__media">
          <img src={project.image} alt="" />
        </span>
        <span className="showcase-card__shade" aria-hidden="true"></span>
        <span className="showcase-card__info">
          <span className="showcase-card__tags">
            <span className={`showcase-card__status${project.published ? ' is-live' : ''}`}>
              <span className="showcase-card__status-dot" aria-hidden="true"></span>
              {project.published ? 'LIVE' : 'PRIVATE BUILD'}
            </span>
            <span className="showcase-card__category">{project.category}</span>
          </span>
          <span className="showcase-card__title-row">
            {project.logo ? (
              <img className="showcase-card__logo" src={project.logo} alt="" />
            ) : null}
            <span className="showcase-card__title">{project.title}</span>
          </span>
          <span className="showcase-card__role">{project.role}</span>
        </span>
        <span className="showcase-card__open" aria-hidden="true">
          {hasLink ? 'OPEN' : 'DETAILS'}
          <i className={hasLink ? 'ri-arrow-right-up-line' : 'ri-arrow-right-line'}></i>
        </span>
      </button>

      {/* Progress of the current slide */}
      <span className="showcase-card__progress" aria-hidden="true">
        <span
          key={`${project.id}-${isPaused}-${reducedMotion}`}
          className="showcase-card__progress-fill"
          style={{ animationDuration: `${SLIDE_MS}ms` }}
        ></span>
      </span>

      <div className="showcase-card__controls">
        <button type="button" className="showcase-card__arrow" onClick={() => go(-1)} aria-label="Previous project">
          <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
        </button>
        <div className="showcase-card__dots" role="tablist" aria-label="Choose a project">
          {PROJECTS.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={item.title}
              className={`showcase-card__dot${dotIndex === index ? ' is-active' : ''}`}
              onClick={() => setIndex(dotIndex)}
            ></button>
          ))}
        </div>
        <button type="button" className="showcase-card__arrow" onClick={() => go(1)} aria-label="Next project">
          <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
        </button>
      </div>
    </section>
  );
}
