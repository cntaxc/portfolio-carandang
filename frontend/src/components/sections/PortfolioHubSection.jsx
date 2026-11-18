import { useEffect, useState } from 'react';
import BackButton from '../BackButton';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import useTypewriter from '../../hooks/useTypewriter';
import { portfolioHub } from '../../data/portfolio';

const SLIDE_INTERVAL_MS = 5000;

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

export default function PortfolioHubSection({ onBack, onSelectCategory }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prompt = portfolioHub.prompt.toUpperCase();
  const typedPrompt = useTypewriter([prompt], { enabled: !prefersReducedMotion });

  return (
    <div className="portfolio-hub-page">
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
          <div className="page-topbar">
            <BackButton onClick={onBack} />
          </div>

          <h2 id="portfolio-hub-title" className="sr-only">
            {portfolioHub.title}
          </h2>

          <ul className="portfolio-hub__cards">
            {portfolioHub.categories.map((category) => (
              <li className="portfolio-hub__item" key={category.id}>
                <a
                  className={`portfolio-category portfolio-category--${category.tone}`}
                  href={`#${category.id}`}
                  aria-describedby={`portfolio-category-${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelectCategory(category.id);
                  }}
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
        </div>
      </section>
    </div>
  );
}
