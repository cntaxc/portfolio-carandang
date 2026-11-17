import { useEffect, useRef, useState } from 'react';
import {
  backgroundSectionIds,
  navPrimary,
  portfolioViews,
  recommendationSectionIds,
  navSecondary,
} from '../data/portfolio';

export default function TopNavigation({ activeSection, activeView, onNavigate }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigationRef = useRef(null);
  const moreLinks = navSecondary;
  const isItemActive = (item) =>
    item.id === activeSection ||
    (item.id === 'portfolio' && portfolioViews.includes(activeView)) ||
    (item.id === 'background' &&
      (activeView === 'background' ||
        backgroundSectionIds.includes(activeSection))) ||
    (item.id === 'recommendation' &&
      recommendationSectionIds.includes(activeSection));
  const isMoreActive = moreLinks.some(isItemActive);

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

  return (
    <header className="top-navigation" ref={navigationRef}>
      <nav className="top-navigation__bar" aria-label="Main navigation">
        {navPrimary.map((item) => (
          <a
            key={item.id}
            className={`top-navigation__link${
              activeSection === item.id ? ' is-active' : ''
            }`}
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
              className={`ri-arrow-down-s-line${
                isMoreOpen ? ' is-open' : ''
              }`}
              aria-hidden="true"
            ></i>
          </button>
          {isMoreOpen ? (
            <div className="top-navigation__dropdown">
              {moreLinks.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`top-navigation__dropdown-link${
                    isItemActive(item) ? ' is-active' : ''
                  }`}
                  aria-current={
                    isItemActive(item) ? 'page' : undefined
                  }
                  onClick={(event) => handleNavigate(event, item.id)}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
