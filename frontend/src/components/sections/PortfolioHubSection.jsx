import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import useTypewriter from '../../hooks/useTypewriter';
import { portfolioHub } from '../../data/portfolio';

const SLIDE_INTERVAL_MS = 5000;
const TILT_X_DEG = 8; // max left/right tilt
const TILT_Y_DEG = 6; // max up/down tilt

// Pointer-driven tilt, spotlight and artwork parallax. Writes CSS custom
// properties on the card (one update per animation frame); mouse only.
function updateCardPointer(event) {
  if (event.pointerType && event.pointerType !== 'mouse') {
    return;
  }
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  window.cancelAnimationFrame(card.__tiltFrame);
  card.__tiltFrame = window.requestAnimationFrame(() => {
    card.style.setProperty('--px', x.toFixed(3));
    card.style.setProperty('--py', y.toFixed(3));
    card.style.setProperty('--ry', `${(x * TILT_X_DEG).toFixed(2)}deg`);
    card.style.setProperty('--rx', `${(-y * TILT_Y_DEG).toFixed(2)}deg`);
    card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  });
}

function resetCardPointer(event) {
  const card = event.currentTarget;
  window.cancelAnimationFrame(card.__tiltFrame);
  ['--px', '--py', '--rx', '--ry', '--mx', '--my'].forEach((name) =>
    card.style.removeProperty(name)
  );
}

function CategorySlideshow({ slides, enabled }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled || slides.length < 2) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, slides.length]);

  return (
    <span className="portfolio-category__slideshow">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          className={`portfolio-category__slide${
            index === activeIndex ? ' is-active' : ''
          }`}
          src={slide.src}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </span>
  );
}

function CategoryMedia({ category, animate }) {
  if (category.slides?.length) {
    return <CategorySlideshow slides={category.slides} enabled={animate} />;
  }
  if (category.image) {
    return (
      <span className="portfolio-category__image">
        <img src={category.image} alt="" decoding="async" />
      </span>
    );
  }
  return (
    <span className="portfolio-category__placeholder">
      <i className={category.icon}></i>
    </span>
  );
}

// How long the "leaving" animation plays before the category page opens.
const LEAVE_DURATION_MS = 450;

export default function PortfolioHubSection({ onSelectCategory }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prompt = portfolioHub.prompt.toUpperCase();
  const typedPrompt = useTypewriter([prompt], { enabled: !prefersReducedMotion });
  // The category being opened: the chosen card lifts while the rest of the
  // page sinks away, then we navigate.
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
    if (prefersReducedMotion) {
      onSelectCategory(categoryId);
    } else {
      setLeavingId(categoryId);
    }
  };

  return (
    <div className={`portfolio-hub-page${leavingId ? ' is-leaving' : ''}`}>
      {/* Decorative vertical wordmark in the page's left margin. It is
          absolutely positioned, so it never affects the card layout. */}
      <span className="portfolio-hub__wordmark" aria-hidden="true">
        {portfolioHub.title.toUpperCase()}
      </span>
      <section
        id="portfolio"
        className="section portfolio-hub"
        aria-labelledby="portfolio-hub-title"
      >
        <div className="portfolio-hub__content">
          <h2 id="portfolio-hub-title" className="sr-only">
            {portfolioHub.title}
          </h2>

          <p className="portfolio-hub__prompt">
            <span className="sr-only">{prompt}</span>
            <span className="portfolio-hub__typer" aria-hidden="true">
              {/* Invisible full text reserves the width so the line stays put. */}
              <span className="portfolio-hub__ghost">{prompt}</span>
              <span className="portfolio-hub__typed">
                {typedPrompt}
                <span className="portfolio-hub__caret">|</span>
              </span>
            </span>
          </p>

          <ul className="portfolio-hub__cards">
            {portfolioHub.categories.map((category, index) => (
              <li
                className={`portfolio-hub__item${
                  leavingId === category.id ? ' is-chosen' : ''
                }`}
                key={category.id}
                style={{ '--item-index': index }}
              >
                <a
                  className={`portfolio-category portfolio-category--${category.tone}`}
                  href={`#${category.id}`}
                  aria-describedby={`portfolio-category-${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    openCategory(category.id);
                  }}
                  onPointerMove={prefersReducedMotion ? undefined : updateCardPointer}
                  onPointerLeave={resetCardPointer}
                >
                  <span className="portfolio-category__media" aria-hidden="true">
                    <CategoryMedia
                      category={category}
                      animate={!prefersReducedMotion}
                    />
                  </span>
                  <span className="portfolio-category__panel">
                    <span className="portfolio-category__title">
                      {category.title}
                    </span>
                    <span
                      className="portfolio-category__details"
                      id={`portfolio-category-${category.id}`}
                    >
                      <span className="portfolio-category__description">
                        {category.description}
                      </span>
                      <i
                        className="ri-cursor-line portfolio-category__cue"
                        aria-hidden="true"
                      ></i>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

        </div>
      </section>
    </div>
  );
}
