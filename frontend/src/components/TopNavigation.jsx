import { useEffect, useRef, useState } from 'react';
import {
  backgroundSectionIds,
  navAction,
  navPrimary,
  navSecondary,
  portfolioViews,
  recommendationSectionIds,
} from '../data/portfolio';
import '../styles/fancy-button.css';

// Small copy of src/assets/images/logos/portfolioLogo.png (served from public/).
const LOGO_SRC = `${process.env.PUBLIC_URL || ''}/portfolioLogo-180.png`;

/**
 * Edge-to-edge top navigation bar, flush with the top of the viewport:
 *   left   - logo (goes Home)
 *   center - Home, About, Projects, More (dropdown)
 *   right  - Portfolio button
 * On small screens Home / About / Projects move into the More dropdown so
 * the bar never wraps.
 */
// Scrolled further than this (px), the bar gets its dark background.
const SCROLL_THRESHOLD = 12;

export default function TopNavigation({ activeSection, activeView, onNavigate }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  // Transparent at the very top; dark glass once the page has scrolled.
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD
  );
  const navigationRef = useRef(null);

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
  const moreLinks = navSecondary;

  const isItemActive = (item) =>
    item.id === activeSection ||
    (item.id === 'portfolio' && portfolioViews.includes(activeView)) ||
    (item.id === 'background' &&
      (activeView === 'background' || backgroundSectionIds.includes(activeSection))) ||
    (item.id === 'recommendation' && recommendationSectionIds.includes(activeSection));
  const isMoreActive = moreLinks.some(isItemActive);
  const isPortfolioActive = isItemActive(navAction);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navigationRef.current?.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (event, sectionId) => {
    event.preventDefault();
    setIsMoreOpen(false);
    onNavigate(sectionId);
  };

  const dropdownLink = (item, extraClass = '') => (
    <a
      key={item.id}
      href={`#${item.id}`}
      className={`top-navigation__dropdown-link${extraClass}${
        isItemActive(item) ? ' is-active' : ''
      }`}
      aria-current={isItemActive(item) ? 'page' : undefined}
      onClick={(event) => handleNavigate(event, item.id)}
    >
      <i className={item.icon} aria-hidden="true"></i>
      <span>{item.label}</span>
    </a>
  );

  return (
    <header
      className={`top-navigation${isScrolled ? ' is-scrolled' : ''}`}
      ref={navigationRef}
    >
      <nav className="top-navigation__bar" aria-label="Main navigation">
        {/* Left: logo */}
        <a
          className="top-navigation__brand"
          href="#home"
          aria-label="Christian Carandang, back to Home"
          onClick={(event) => handleNavigate(event, 'home')}
        >
          <img src={LOGO_SRC} alt="" width="36" height="36" />
        </a>

        {/* Center: main links */}
        <div className="top-navigation__center">
          {navPrimary.map((item) => (
            <a
              key={item.id}
              className={`top-navigation__link${activeSection === item.id ? ' is-active' : ''}`}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={(event) => handleNavigate(event, item.id)}
            >
              {item.label}
            </a>
          ))}

          <div className="top-navigation__more">
            <button
              type="button"
              className={`top-navigation__link top-navigation__more-toggle${
                isMoreActive ? ' is-active' : ''
              }`}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
              onClick={() => setIsMoreOpen((open) => !open)}
            >
              More
              <i
                className={`ri-arrow-down-s-line${isMoreOpen ? ' is-open' : ''}`}
                aria-hidden="true"
              ></i>
            </button>
            {isMoreOpen ? (
              <div className="top-navigation__dropdown">
                {/* Small screens only: the center links live here. */}
                <div className="top-navigation__dropdown-group top-navigation__dropdown-group--compact">
                  {navPrimary.map((item) => dropdownLink(item))}
                </div>
                <div className="top-navigation__dropdown-group">
                  {moreLinks.map((item) => dropdownLink(item))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Portfolio */}
        <div className="top-navigation__end">
          <a
            className={`fancy-button top-navigation__action${isPortfolioActive ? ' is-active' : ''}`}
            href={`#${navAction.id}`}
            aria-current={isPortfolioActive ? 'page' : undefined}
            onClick={(event) => handleNavigate(event, navAction.id)}
          >
            <span className="fancy-button__top-key" aria-hidden="true"></span>
            <span className="fancy-button__text">{navAction.label}</span>
            <span className="fancy-button__bottom-key-1" aria-hidden="true"></span>
            <span className="fancy-button__bottom-key-2" aria-hidden="true"></span>
          </a>
        </div>
      </nav>
    </header>
  );
}
