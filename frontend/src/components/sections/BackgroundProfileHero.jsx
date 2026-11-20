import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import formalPortrait from '../../assets/images/profile/formal-portrait.png';
import { professionalSummary, profile } from '../../data/portfolio';

// Overview header: portrait, full name, professional roles and a short bio
// with a rotating web role, set directly on the page background, plus a
// button that scrolls down to the Skills section. Location, school and years
// are left to the Education section below.

const ROLES = professionalSummary.roles;
const BIO = professionalSummary.bio;
const ROTATE_EVERY_MS = 2400;

// Split "Christian Raphael A. Carandang" into the given names and surname so
// the surname sits on its own line. A non-breaking space keeps the middle
// initial with the name before it, so a narrow screen wraps
// "Christian / Raphael A." instead of leaving "A." alone.
const nameParts = profile.name.trim().split(/\s+/);
const surname = nameParts.pop();
const givenNames = nameParts
  .map((part, index) =>
    index === 0 ? part : `${index === nameParts.length - 1 ? ' ' : ' '}${part}`
  )
  .join('');

// "A, B, C, and D" for screen readers and reduced motion.
function joinWords(words) {
  if (words.length < 2) return words[0] || '';
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`;
}

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches)
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

// Cycles through `words` in place with a slide-up fade. All words share one
// grid cell; the slot's width eases to fit the current word, so the sentence
// stays tight around it.
function RotatingWords({ words }) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(null);
  const wordRefs = useRef([]);

  useEffect(() => {
    if (reducedMotion || words.length < 2) return undefined;
    const timer = window.setInterval(() => {
      // Don't advance in a background tab.
      if (document.visibilityState === 'visible') {
        setIndex((current) => (current + 1) % words.length);
      }
    }, ROTATE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, words.length]);

  // Measure the current word (again once web fonts finish loading, and on
  // resize, since both change its width).
  useLayoutEffect(() => {
    if (reducedMotion) return undefined;
    const measure = () => {
      const element = wordRefs.current[index];
      if (element) setWidth(element.offsetWidth);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [index, reducedMotion]);

  // Reduced motion: the full list, no animation.
  if (reducedMotion) {
    return <strong className="background-profile__rotating-static">{joinWords(words)}</strong>;
  }

  const leavingIndex = (index - 1 + words.length) % words.length;
  return (
    <>
      <span className="sr-only">{joinWords(words)}</span>
      <span
        className="background-profile__rotating"
        aria-hidden="true"
        style={width ? { width: `${width}px` } : undefined}
      >
        {words.map((word, wordIndex) => (
          <span
            key={word}
            ref={(element) => {
              wordRefs.current[wordIndex] = element;
            }}
            className={`background-profile__word${
              wordIndex === index ? ' is-active' : wordIndex === leavingIndex ? ' is-leaving' : ''
            }`}
          >
            {word}
          </span>
        ))}
      </span>
    </>
  );
}

export default function BackgroundProfileHero({ onViewSkills }) {
  return (
    <section
      className="background-profile"
      aria-labelledby="background-profile-name"
      data-reveal
    >
      <figure className="background-profile__portrait">
        <img src={formalPortrait} alt="Formal portrait of Christian Raphael Carandang" />
      </figure>

      <div className="background-profile__content">
        <h1 id="background-profile-name" className="background-profile__name">
          <span>{givenNames}</span>
          <span>{surname}</span>
        </h1>

        <ul className="background-profile__roles" aria-label="Roles">
          {ROLES.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>

        {BIO ? (
          <p className="background-profile__bio">
            {BIO.before} <RotatingWords words={BIO.rotating || []} /> {BIO.after}
          </p>
        ) : null}
      </div>

      {onViewSkills ? (
        <button type="button" className="background-profile__jump" onClick={onViewSkills}>
          <span>Skills &amp; Techstack</span>
          <i className="ri-arrow-down-line" aria-hidden="true"></i>
        </button>
      ) : null}
    </section>
  );
}
