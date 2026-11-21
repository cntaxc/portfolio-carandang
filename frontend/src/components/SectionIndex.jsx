import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/section-index.css';

// Fixed "— 01 Overview" list on the left of a long page. Only sections that
// are actually on the page are listed (and numbered in page order); the one
// in view is highlighted, and a click scrolls to it.
//
// The bar at the top covers this many px, so section tops land just below it.
const NAV_OFFSET = 80;

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SectionIndex({ sections, label = 'Page sections' }) {
  const [present, setPresent] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Which of the sections exist in the page (after it has rendered).
  useEffect(() => {
    setPresent(sections.filter((section) => document.getElementById(section.id)));
  }, [sections]);

  // Active section: the last one whose top has passed 40% of the viewport
  // (or the last one when scrolled to the very bottom).
  useEffect(() => {
    if (!present.length) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = present[0].id;
      if (atBottom) {
        current = present[present.length - 1].id;
      } else {
        for (const section of present) {
          const element = document.getElementById(section.id);
          if (element && element.getBoundingClientRect().top <= line) current = section.id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [present]);

  const scrollTo = (id, index) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top =
      index === 0 ? 0 : element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  if (!present.length) return null;

  // Rendered into <body>: the page wrapper animates with a transform, which
  // would otherwise pin this `position: fixed` list to the page, not the window.
  return createPortal(
    <nav className="section-index" aria-label={label}>
      <ol className="section-index__list">
        {present.map((section, index) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`section-index__item${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollTo(section.id, index)}
              >
                <span className="section-index__dash" aria-hidden="true"></span>
                <span className="section-index__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="section-index__label">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>,
    document.body
  );
}
