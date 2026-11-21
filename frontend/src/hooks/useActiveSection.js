import { useEffect, useState } from 'react';

// A section is "current" once its top has scrolled above this line (a
// fraction of the viewport height). Matches the section index on the left.
const ACTIVE_LINE = 0.4;

/**
 * Scroll-spy: returns the id of the section in view.
 *
 * `sectionIds` must be in page order. The current section is the last one
 * whose top has passed ACTIVE_LINE (so a tall wrapper or a long section can't
 * stay "stuck" once the next section starts), and the last one when the page
 * is scrolled to the very bottom. Recomputed on scroll, resize and whenever
 * the page's height changes (images loading, sections expanding).
 */
export default function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      if (!sections.length) {
        setActiveSection(sectionIds[0]);
        return;
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && window.scrollY > 0) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      const line = window.innerHeight * ACTIVE_LINE;
      let current = sections[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      });
      setActiveSection(current);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionIds]);

  return activeSection;
}
