import { Fragment, useEffect, useRef, useState } from 'react';
import { about } from '../../data/portfolio';
import backgroundImage from '../../assets/images/profile/hero-background.jpg';

const HERO_TITLE_WORDS = ['CHRISTIAN', 'CARANDANG'];

// Renders the title words as per-character spans. Each character gets an
// index (--i) that staggers its entrance animation.
function HeroTitleLayer({ variant }) {
  let index = 0;
  return (
    <span
      className={`intro-hero__title-layer intro-hero__title-layer--${variant}`}
      aria-hidden="true"
    >
      {HERO_TITLE_WORDS.map((word, wordIndex) => (
        <Fragment key={word}>
          {wordIndex > 0 ? ' ' : null}
          <span className="intro-hero__title-word">
            {[...word].map((character) => {
              const style = { '--i': index };
              index += 1;
              return (
                <span
                  className="intro-hero__title-char"
                  style={style}
                  key={`${word}-${index}`}
                >
                  {character}
                </span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export default function IntroHero() {
  const heroRef = useRef(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !heroRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsHeroVisible(entry.isIntersecting);
    });

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="intro-hero section"
      data-reveal
    >
      <div
        className="intro-hero__media"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      ></div>
      <div className="intro-hero__scrim" aria-hidden="true"></div>
      <div className="intro-hero__content">
        {/* Outline layer underneath, solid layer on top clipped to a
            centre band that opens once the letters have landed. */}
        <h1 className="intro-hero__title" aria-label="Christian Carandang">
          <HeroTitleLayer variant="outline" />
          <HeroTitleLayer variant="fill" />
        </h1>
        <h2 className="intro-hero__descriptor">JUNIOR LEVEL DESIGNER</h2>
        <a
          className="intro-hero__cv"
          href={about.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {about.cvLabel}
        </a>
      </div>
      <a
        className={`intro-hero__scroll${isHeroVisible ? '' : ' is-hidden'}`}
        href="#about"
        aria-label="Scroll to About section"
      >
        <span className="intro-hero__scroll-mouse" aria-hidden="true">
          <span className="intro-hero__scroll-wheel"></span>
        </span>
      </a>
    </section>
  );
}
