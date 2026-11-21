import { useEffect } from 'react';
import formalPortrait from '../../assets/images/profile/formal-portrait.png';
import { about } from '../../data/portfolio';
import { joinWords } from '../RotatingWords';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import useTypewriter from '../../hooks/useTypewriter';
import '../../styles/home-hero.css';

// Homepage: a single full-screen "terminal / game studio" hero on a dark
// canvas with a hairline grid. Left: badge, name, subtitle (with rotating
// roles) and the action row (Press [Enter] to my journey / Resume /
// Contact). Right: the formal portrait in a tall box frame (title strip,
// photo, capability strip). Pressing Enter anywhere on the homepage (when nothing
// else has focus) starts the journey (opens the Portfolio page).

const SUBTITLE_ROLES = ['Quality Assurance', 'IT Support'];
// Typed with the sentence's full stop, so the cursor follows the last
// character typed.
const TYPED_ROLES = SUBTITLE_ROLES.map((role) => `${role}.`);
const LONGEST_TYPED_ROLE = TYPED_ROLES.reduce((longest, role) =>
  role.length > longest.length ? role : longest
);

// Types each role character by character, pauses, backspaces it, then types
// the next. An invisible copy of the longest role reserves the slot's width,
// so the sentence never re-wraps or shifts while typing or deleting.
function TypedRole() {
  const reducedMotion = usePrefersReducedMotion();
  const typed = useTypewriter(TYPED_ROLES, {
    enabled: !reducedMotion,
    typeDelay: 85,
    deleteDelay: 45,
    holdTyped: 1600,
    holdEmpty: 350,
  });

  if (reducedMotion) {
    return <strong className="home-hero__typed-static">{joinWords(SUBTITLE_ROLES)}.</strong>;
  }

  return (
    <>
      <span className="sr-only">{joinWords(SUBTITLE_ROLES)}.</span>
      <span className="home-hero__typer" aria-hidden="true">
        <span className="home-hero__typer-ghost">
          {LONGEST_TYPED_ROLE}
          <span className="home-hero__cursor">_</span>
        </span>
        <span className="home-hero__typer-text">
          {typed}
          <span className="home-hero__cursor">_</span>
        </span>
      </span>
    </>
  );
}

// True when Enter should start the journey: nothing interactive is focused.
function shouldHandleEnter(event) {
  if (event.key !== 'Enter' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  const interactive = event.target?.closest?.(
    'a, button, input, textarea, select, [contenteditable="true"], [role="dialog"]'
  );
  return !interactive && !document.querySelector('[aria-modal="true"]');
}

export default function HomeHero({ onStartJourney, onContact }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (shouldHandleEnter(event)) {
        event.preventDefault();
        onStartJourney();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartJourney]);

  return (
    <section id="home" className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__inner">
        {/* Left: copy and actions */}
        <div className="home-hero__copy">
          <p className="home-hero__meta">
            <span className="home-hero__meta-dot" aria-hidden="true"></span>
            CAN BUILD <span aria-hidden="true">{'//'}</span> GAME ASSETS, WEB DESIGN &amp; UI/UX
            DESIGN
          </p>

          <h1 id="home-hero-title" className="home-hero__title">
            <span>CHRISTIAN</span>
            <span>CARANDANG</span>
          </h1>

          <p className="home-hero__subtitle">
            Welcome stranger! here&apos;s where i showcase my skills as a college student at
            University of Cabuyao. Aside of being an creatives i enjoy also{' '}
            {/* "the" stays together with the typed role. */}
            <span className="home-hero__nowrap">
              the <TypedRole />
            </span>
          </p>

          <div className="home-hero__actions">
            <button
              type="button"
              className="home-hero__button home-hero__button--primary"
              onClick={onStartJourney}
            >
              <i className="ri-play-fill" aria-hidden="true"></i>
              <span>Press</span>
              <kbd className="home-hero__key">ENTER</kbd>
              <span>to my journey</span>
            </button>
            <a
              className="home-hero__button"
              href={about.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resume (opens the PDF in a new tab)"
            >
              <i className="ri-file-user-line" aria-hidden="true"></i>
              <span>Resume</span>
            </a>
            <a
              className="home-hero__button"
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                onContact();
              }}
            >
              <i className="ri-mail-line" aria-hidden="true"></i>
              <span>Contact</span>
            </a>
          </div>
        </div>

        {/* Right: portrait in a tall box frame */}
        <figure className="home-hero__badge" aria-label="Formal portrait of Christian Carandang">
          <span className="home-hero__frame" aria-hidden="true">
            <span className="home-hero__corner home-hero__corner--tl"></span>
            <span className="home-hero__corner home-hero__corner--tr"></span>
            <span className="home-hero__corner home-hero__corner--bl"></span>
            <span className="home-hero__corner home-hero__corner--br"></span>
          </span>
          <span className="home-hero__window">
            <span className="home-hero__window-bar" aria-hidden="true">
              <span>ctiancrndng.dev</span>
              <span className="home-hero__window-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </span>
            <span className="home-hero__portrait">
              <img src={formalPortrait} alt="" />
            </span>
            <span className="home-hero__capability">
              <span className="home-hero__capability-label">CAPABILITY</span>
              <span className="home-hero__capability-value">INTERN LEVEL DESIGNS</span>
            </span>
          </span>
        </figure>
      </div>
    </section>
  );
}
