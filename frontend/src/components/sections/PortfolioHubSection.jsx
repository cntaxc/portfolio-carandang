import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { freeAssets, modelShowcase, portfolioHub, showcaseProjects } from '../../data/portfolio';
import '../../styles/portfolio-hub.css';

const SLIDE_INTERVAL_MS = 5000;
// How long the "leaving" animation plays before the category page opens.
const LEAVE_DURATION_MS = 420;

const pad2 = (value) => String(value).padStart(2, '0');

// Item count shown on each card.
const COUNTS = {
  projectlist: [showcaseProjects.items.length, 'projects'],
  models: [modelShowcase.items.length, 'models'],
  assets: [freeAssets.items.length, 'assets'],
};

// Projects: the project artwork, cross-fading every 5 seconds.
function CategorySlideshow({ slides, enabled }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, slides.length]);

  return (
    <span className="hub-card__slideshow">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          className={`hub-card__slide${index === activeIndex ? ' is-active' : ''}`}
          src={slide.src}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </span>
  );
}

// Download Free Assets: a silent looping clip over its poster. Reduced motion
// keeps it paused on the first frame.
function CategoryVideo({ src, poster, animate }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    // React sets `muted` only as a property. The file has an audio track, so
    // set the default too, or some browsers refuse to autoplay it.
    video.defaultMuted = true;
    video.muted = true;
    if (animate) {
      // Rejected when autoplay is blocked (e.g. Low Power Mode): poster stays.
      video.play()?.catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [animate]);

  return (
    <span className="hub-card__video-frame">
      <video
        ref={videoRef}
        className="hub-card__video"
        src={src}
        poster={poster}
        autoPlay={animate}
        loop
        muted
        playsInline
        preload={animate ? 'auto' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />
    </span>
  );
}

function CategoryMedia({ category, animate }) {
  if (category.video) {
    return <CategoryVideo src={category.video} poster={category.poster} animate={animate} />;
  }
  if (category.slides?.length) {
    return <CategorySlideshow slides={category.slides} enabled={animate} />;
  }
  if (category.image) {
    return <img className="hub-card__image" src={category.image} alt="" decoding="async" />;
  }
  return (
    <span className="hub-card__placeholder">
      <i className={category.icon}></i>
    </span>
  );
}

/**
 * Portfolio hub (#portfolio), in the same style as the rest of the site:
 *   header - eyebrow, two-line title (second line outlined), intro, divider
 *   cards  - one per category: framed artwork, index, title, description,
 *            item count and an "Open" cue; the chosen card lifts while the
 *            rest fades, then the category page opens
 */
export default function PortfolioHubSection({ onSelectCategory }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [leavingId, setLeavingId] = useState(null);
  // Latest callback in a ref, so parent re-renders don't restart the timer.
  const onSelectRef = useRef(onSelectCategory);
  onSelectRef.current = onSelectCategory;

  useEffect(() => {
    if (!leavingId) return undefined;
    const timer = window.setTimeout(() => onSelectRef.current(leavingId), LEAVE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [leavingId]);

  const openCategory = (categoryId) => {
    if (leavingId) return; // already on the way out
    if (prefersReducedMotion) onSelectCategory(categoryId);
    else setLeavingId(categoryId);
  };

  return (
    <div className={`hub-page${leavingId ? ' is-leaving' : ''}`}>
      <section id="portfolio" className="section hub" aria-labelledby="portfolio-hub-title">
        {/* ---- Header ------------------------------------------------------ */}
        <header className="hub__head">
          <div>
            <p className="hub__eyebrow">
              <span className="hub__eyebrow-dot" aria-hidden="true"></span>
              {portfolioHub.eyebrow}
            </p>
            <h2 id="portfolio-hub-title" className="hub__title">
              {portfolioHub.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          <p className="hub__intro">{portfolioHub.intro}</p>
        </header>

        {/* ---- Category cards ------------------------------------------------ */}
        <ul className="hub__cards">
          {portfolioHub.categories.map((category, index) => {
            const [count, unit] = COUNTS[category.id] || [];
            return (
              <li
                key={category.id}
                className={`hub__item${leavingId === category.id ? ' is-chosen' : ''}`}
                style={{ '--item-index': index }}
              >
                <a
                  className="hub-card"
                  href={`#${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    openCategory(category.id);
                  }}
                >
                  <span
                    className={`hub-card__media${category.video ? ' hub-card__media--video' : ''}`}
                    aria-hidden="true"
                  >
                    <CategoryMedia category={category} animate={!prefersReducedMotion} />
                    {/* The video plays clear: no tint over it. */}
                    {category.video ? null : <span className="hub-card__shade"></span>}
                    <span className="hub-card__corner hub-card__corner--tl"></span>
                    <span className="hub-card__corner hub-card__corner--tr"></span>
                    <span className="hub-card__corner hub-card__corner--bl"></span>
                    <span className="hub-card__corner hub-card__corner--br"></span>
                    <span className="hub-card__index">{pad2(index + 1)}</span>
                  </span>

                  <span className="hub-card__body">
                    <span className="hub-card__title">{category.title}</span>
                    <span className="hub-card__desc">{category.description}</span>
                    <span className="hub-card__foot">
                      {count !== undefined ? (
                        <span className="hub-card__count">
                          <strong>{pad2(count)}</strong> {unit}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      <span className="hub-card__open">
                        Open
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </span>
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
