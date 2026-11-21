import { useEffect, useRef, useState } from 'react';
import { navActions, navPrimary } from '../data/portfolio';
import PixelRobot from './PixelRobot';

// The GRAPPLE robot in the corner is the Home link: it bobs while idle, and a
// click takes you back to the top of the homepage while the robot launches up
// out of the top of the window and drops back into place with a bounce.
function RobotMascot({ onClick }) {
  const [isFlying, setIsFlying] = useState(false);
  return (
    <button
      type="button"
      className={`top-navigation__robot${isFlying ? ' is-flying' : ''}`}
      aria-label="Home"
      title="Home"
      onClick={() => {
        setIsFlying(true);
        onClick?.();
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === 'nav-robot-flight') setIsFlying(false);
      }}
    >
      <span className="top-navigation__robot-body">
        <PixelRobot className="top-navigation__robot-sprite" />
        <span className="top-navigation__robot-flame" aria-hidden="true"></span>
      </span>
    </button>
  );
}

// Scrolled further than this (px), the bar gets its dark background.
const SCROLL_THRESHOLD = 12;

/**
 * Edge-to-edge top navigation bar, flush with the top of the viewport:
 *   left   - GRAPPLE robot = Home (back to the top of the homepage)
 *   center - section links (About … Recommendations)
 *   right  - Resume (PDF, new tab) and Contact Christian action buttons
 * Below 1360px the section links move into a "Menu" dropdown; on phones the
 * two action buttons become icon-only.
 */
export default function TopNavigation({ activeSection, activeView, onNavigate }) {
  // Transparent at the very top; dark glass once the page has scrolled.
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    // At most one check per animation frame while scrolling.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update(); // also correct after page switches that jump the scroll position
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  // Section links follow the scroll-spy (the section in view). A link that
  // opens its own page (Recommendation, Contact) is active on
  // that page. "Overview" (#journey) shares its id with the Journey page, so
  // it must not match the page name, or it would stay lit everywhere.
  const isActive = (id) =>
    id === activeSection || (id === activeView && activeView !== 'journey');

  const go = (event, id) => {
    event.preventDefault();
    setIsMenuOpen(false);
    onNavigate(id);
  };

  const link = (item, className) => (
    <a
      key={item.id}
      className={`${className}${isActive(item.id) ? ' is-active' : ''}`}
      href={`#${item.id}`}
      aria-current={isActive(item.id) ? 'page' : undefined}
      onClick={(event) => go(event, item.id)}
    >
      {className === 'top-navigation__menu-link' ? (
        <i className={item.icon} aria-hidden="true"></i>
      ) : null}
      <span>{item.label}</span>
    </a>
  );

  return (
    <header
      ref={headerRef}
      className={`top-navigation${isScrolled ? ' is-scrolled' : ''}`}
    >
      <nav className="top-navigation__bar" aria-label="Main navigation">
        <div className="top-navigation__brand">
          <RobotMascot
            onClick={() => {
              setIsMenuOpen(false);
              onNavigate('home');
            }}
          />
        </div>

        {/* Section links (wide screens) */}
        <div className="top-navigation__center">
          {navPrimary.map((item) => link(item, 'top-navigation__link'))}
        </div>

        {/* Section links in a dropdown (narrower screens) */}
        <div className="top-navigation__menu">
          <button
            type="button"
            className={`top-navigation__menu-toggle${isMenuOpen ? ' is-open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls="top-navigation-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <i className={isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} aria-hidden="true"></i>
            <span>Menu</span>
          </button>
          {isMenuOpen ? (
            <div id="top-navigation-menu" className="top-navigation__menu-panel">
              {navPrimary.map((item) => link(item, 'top-navigation__menu-link'))}
            </div>
          ) : null}
        </div>

        {/* Right: action buttons */}
        <div className="top-navigation__actions">
          {navActions.map((item, index) => {
            const className = `top-navigation__action${
              index === navActions.length - 1 ? ' top-navigation__action--primary' : ''
            }${!item.href && isActive(item.id) ? ' is-active' : ''}`;
            const content = (
              <>
                <i className={item.icon} aria-hidden="true"></i>
                <span className="top-navigation__action-label">{item.label}</span>
              </>
            );
            // A file (the resume PDF): opens in a new tab.
            if (item.href) {
              return (
                <a
                  key={item.id}
                  className={className}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.label} (opens in a new tab)`}
                  title={item.label}
                >
                  {content}
                </a>
              );
            }
            // A page (Contact): in-app navigation.
            return (
              <a
                key={item.id}
                className={className}
                href={`#${item.id}`}
                aria-label={item.label}
                title={item.label}
                aria-current={isActive(item.id) ? 'page' : undefined}
                onClick={(event) => go(event, item.id)}
              >
                {content}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
