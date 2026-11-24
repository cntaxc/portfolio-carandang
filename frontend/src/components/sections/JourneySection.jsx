import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import InputTester from '../InputTester';
import { about } from '../../data/portfolio';
import SectionEyebrow from '../SectionEyebrow';
import { journeyLevels, journeyLevelsById, journeyParents } from '../../data/journey';
import ProjectShowcaseCard from '../ProjectShowcaseCard';
import '../../styles/journey.css';

// "My Journey": my learning journey as a left-to-right tree with straight,
// right-angled connectors, scaled to fit and centred in its container (a
// static layout: no panning or zooming). Selecting a node lights up its path
// back to Education and shows its details in the inspector on the right.
// Click, or use the arrow keys, to move between nodes; Esc goes home.

const STORAGE_KEY = 'journey-selected-level';
const DEFAULT_LEVEL = journeyLevels[0].id;

// The tree's "world" size in px; node x/y percentages map onto it.
// Kept compact so the fitted tree renders large and readable.
const WORLD_W = 900;
const WORLD_H = 720;
// On narrow screens the tree never shrinks below this (readable) scale; the
// canvas scrolls sideways instead.
const MIN_READABLE_SCALE = 0.8;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const worldPoint = (level) => ({ x: (level.x / 100) * WORLD_W, y: (level.y / 100) * WORLD_H });

function readStoredLevel() {
  try {
    const id = window.sessionStorage.getItem(STORAGE_KEY);
    return journeyLevelsById[id] ? id : DEFAULT_LEVEL;
  } catch (error) {
    return DEFAULT_LEVEL;
  }
}

// Right-angled connector between two nodes (circuit style): across to the
// midpoint between the columns, up/down, then across. Links that share a
// column pair share that vertical "bus" line.
function connectorPath(from, to) {
  const a = worldPoint(from);
  const b = worldPoint(to);
  if (a.y === b.y) return `M ${a.x} ${a.y} H ${b.x}`;
  const midX = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`;
}

const CONNECTORS = journeyLevels.flatMap((level) =>
  level.links
    .filter((targetId) => journeyLevelsById[targetId])
    .map((targetId) => ({ id: `${level.id}-${targetId}`, from: level, to: journeyLevelsById[targetId] }))
);

// Every node on a path from the root to `id` (the node itself included).
function pathToOrigin(id) {
  const seen = new Set();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    (journeyParents[current] || []).forEach((parent) => stack.push(parent));
  }
  return seen;
}

// ---- Static fit ----------------------------------------------------------------

// Scale that fits the whole tree inside the canvas (never below the readable
// minimum on narrow screens, where the canvas scrolls sideways instead).
function useFitScale(canvasRef) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = canvasRef.current;
    if (!element) return undefined;
    const measure = () => {
      const width = element.clientWidth || 1;
      const height = element.clientHeight || 1;
      const narrow = Boolean(window.matchMedia?.('(max-width: 640px)').matches);
      const fit = narrow
        ? width / WORLD_W
        : Math.min(width / WORLD_W, height / WORLD_H) * 0.96;
      setScale(clamp(fit, narrow ? MIN_READABLE_SCALE : 0.3, 1.25));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [canvasRef]);
  return scale;
}

// ---- Component ----------------------------------------------------------------

export default function JourneySection({ onNavigate, onHome }) {
  const [selectedId, setSelectedId] = useState(readStoredLevel);
  const nodeRefs = useRef({});
  const inspectorRef = useRef(null);
  const canvasRef = useRef(null);
  const scale = useFitScale(canvasRef);
  const selected = journeyLevelsById[selectedId] || journeyLevels[0];
  const onPath = useMemo(() => pathToOrigin(selected.id), [selected.id]);

  // Remember the selection for this visit, so coming back keeps your place.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, selectedId);
    } catch (error) {
      // Storage blocked: the selection just isn't remembered.
    }
  }, [selectedId]);

  // Keyboard & mouse tester: Alt + T (or the badge) opens it. Matched on the
  // physical key (event.code), since Option + T on a Mac types "†". While it's
  // open the tester captures every key itself (so Alt and T can be tested).
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.code !== 'KeyT') return;
      event.preventDefault(); // no browser menus (e.g. Firefox "Tools")
      setIsTesterOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Esc goes back to the homepage (unless typing somewhere).
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (event.defaultPrevented) return; // already closed a menu / dialog
      if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      onHome();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onHome]);

  // Click/tap a node. When the inspector sits below the canvas (narrow
  // screens), bring it into view so the details are visible.
  const selectLevel = (id) => {
    setSelectedId(id);
    if (window.matchMedia?.('(max-width: 1023px)').matches) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() =>
        inspectorRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      );
    }
  };

  // Arrow keys move to the nearest node in that direction;
  // Home / End jump to Education / Internship.
  const onCanvasKeyDown = (event) => {
    let next = null;
    if (event.key === 'Home') next = journeyLevels[0];
    if (event.key === 'End') next = journeyLevels[journeyLevels.length - 1];
    const direction = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    }[event.key];
    if (direction) {
      const current = worldPoint(journeyLevelsById[selectedId]);
      const [dx, dy] = direction;
      let bestScore = Infinity;
      journeyLevels.forEach((level) => {
        const point = worldPoint(level);
        const along = (point.x - current.x) * dx + (point.y - current.y) * dy;
        if (along <= 0) return; // not in that direction
        const across = Math.abs((point.x - current.x) * dy + (point.y - current.y) * dx);
        const score = along + across * 1.5; // prefer staying on the same row/column
        if (score < bestScore) {
          bestScore = score;
          next = level;
        }
      });
    }
    if (!direction && !next) return;
    event.preventDefault();
    if (!next) return; // nothing further that way
    setSelectedId(next.id);
    nodeRefs.current[next.id]?.focus();
  };

  const linkState = (connector) => {
    if (onPath.has(connector.to.id) && onPath.has(connector.from.id)) return ' is-path';
    if (connector.from.id === selected.id) return ' is-next';
    return '';
  };

  // Intro "View the map" button: scroll so the tree section fills the window.
  const scrollToMap = () => {
    const map = document.getElementById('journey-map');
    if (!map) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: map.offsetTop, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div id="journey" className="journey-page">
      {/* ---- Intro: its own section above the map ---------------------------- */}
      <section className="journey-intro" aria-labelledby="journey-intro-title">
        <div className="journey-intro__inner">
          <div className="journey-intro__copy">
            <p className="journey-intro__meta">
              <span className="journey__eyebrow-dot" aria-hidden="true"></span>
              OVERVIEW <span aria-hidden="true">{'//'}</span> ABOUT ME
            </p>
            <h1 id="journey-intro-title" className="journey-intro__title">
              <span>From ideas to</span>
              <span>interactive</span>
              <span>experiences</span>
            </h1>
            {/* Bio (formerly the About section) */}
            <div className="journey-intro__bio">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="journey-intro__actions">
              <button
                type="button"
                className="journey-intro__cta"
                onClick={() => onNavigate('portfolio')}
              >
                <span>View portfolio</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </button>
              <button type="button" className="journey__home" onClick={onHome}>
                <i className="ri-arrow-left-line" aria-hidden="true"></i>
                Home
              </button>
            </div>
          </div>

          {/* Project showcase carousel */}
          <div className="journey-intro__aside">
            {/* Keyboard shortcuts (also clickable), right-aligned above the card */}
            <div className="journey-shortcuts" aria-label="Keyboard shortcuts">
              <button
                type="button"
                className="journey-shortcut"
                aria-keyshortcuts="Alt+T"
                onClick={() => setIsTesterOpen(true)}
              >
                <kbd>Alt</kbd>
                <span className="journey-shortcut__plus" aria-hidden="true">+</span>
                <kbd>T</kbd>
                <span className="journey-shortcut__label">Input Tester</span>
              </button>
              <button
                type="button"
                className="journey-shortcut"
                aria-keyshortcuts="Escape"
                onClick={onHome}
              >
                <kbd>Esc</kbd>
                <span className="journey-shortcut__label">Back to Home</span>
              </button>
            </div>
            <ProjectShowcaseCard onOpenProjects={() => onNavigate('projectlist')} />
          </div>
        </div>
        <button type="button" className="journey-intro__scroll" onClick={scrollToMap}>
          <span>SCROLL DOWN</span>
          <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
        </button>
      </section>

      {/* ---- The map: its own full-height section ------------------------------- */}
      <section id="journey-map" className="journey" aria-labelledby="journey-title">
      <div className="journey__inner">
        <header className="journey__head">
          <div>
            <SectionEyebrow sectionId="journey-map" />
            <h2 id="journey-title" className="journey__title">
              My Journey
            </h2>
          </div>
          <div className="journey__controls">
            <span className="journey__legend" aria-hidden="true">
              <span className="journey__legend-item">
                <span className="journey__legend-shape journey__legend-shape--diamond"></span>
                Stage
              </span>
              <span className="journey__legend-item">
                <span className="journey__legend-shape"></span>
                Capabilities
              </span>
            </span>
          </div>
        </header>

        <div className="journey__layout">
          {/* Skill tree: scaled to fit and centred (scrolls sideways on phones) */}
          <div ref={canvasRef} className="journey__canvas" onKeyDown={onCanvasKeyDown}>
            <div
              className="journey__sizer"
              style={{ width: WORLD_W * scale, height: WORLD_H * scale }}
            >
              <div
                className="journey__world"
                style={{ width: WORLD_W, height: WORLD_H, transform: `scale(${scale})` }}
              >
                <svg
                  className="journey__links"
                  width={WORLD_W}
                  height={WORLD_H}
                  viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
                  aria-hidden="true"
                >
                  {CONNECTORS.map((connector, index) => (
                    <path
                      key={connector.id}
                      d={connectorPath(connector.from, connector.to)}
                      className={`journey__link${linkState(connector)}`}
                      style={{ '--link-index': index }}
                    />
                  ))}
                </svg>

                <ul className="journey__nodes" aria-label="Journey">
                  {journeyLevels.map((level, index) => {
                    const isSelected = level.id === selected.id;
                    const state = isSelected ? ' is-selected' : onPath.has(level.id) ? ' is-path' : '';
                    const point = worldPoint(level);
                    return (
                      <li
                        key={level.id}
                        className={`journey__node-slot journey__node-slot--label-${level.label || 'bottom'}${state}`}
                        style={{ left: point.x, top: point.y, '--node-index': index }}
                      >
                        <button
                          ref={(element) => {
                            nodeRefs.current[level.id] = element;
                          }}
                          type="button"
                          className={`journey__node journey__node--${level.shape}`}
                          aria-pressed={isSelected}
                          aria-controls="journey-inspector"
                          aria-label={`${level.title} (${level.category})`}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => selectLevel(level.id)}
                        >
                          <span className="journey__node-shape" aria-hidden="true">
                            <i className={level.icon}></i>
                          </span>
                        </button>
                        <span className="journey__node-label" aria-hidden="true">
                          <span className="journey__node-title">{level.title}</span>
                          {level.subtitle ? (
                            <span className="journey__node-subtitle">{level.subtitle}</span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <p className="journey__swipe" aria-hidden="true">
            <i className="ri-arrow-left-right-line"></i>
            Swipe to see the whole tree
          </p>

          {/* Inspector */}
          <aside
            ref={inspectorRef}
            id="journey-inspector"
            className="journey__inspector"
            aria-live="polite"
            aria-label={selected.title}
          >
            <div className="journey__inspector-bar" aria-hidden="true">
              <span>node_{selected.id}.log</span>
              <span className="journey__inspector-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>

            {/* key: replays the reveal animation on every selection */}
            <div className="journey__inspector-body" key={selected.id}>
              <p className="journey__inspector-meta">
                <span className="journey__category">{selected.category}</span>
              </p>
              <h2 className="journey__inspector-title">
                <span
                  className={`journey__inspector-shape journey__inspector-shape--${selected.shape}`}
                  aria-hidden="true"
                >
                  <i className={selected.icon}></i>
                </span>
                {selected.title}
              </h2>

              <p className="journey__summary">{selected.summary}</p>

              {selected.highlights?.length ? (
                <ul className="journey__highlights" aria-label="Highlights">
                  {selected.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}

              {selected.tags?.length ? (
                <ul className="journey__tags" aria-label="Tags">
                  {selected.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}

              {selected.links.length ? (
                <p className="journey__unlocks">
                  <span>LEADS TO</span>{' '}
                  {selected.links
                    .filter((id) => journeyLevelsById[id])
                    .map((id) => (
                      <button
                        key={id}
                        type="button"
                        className="journey__unlock"
                        onClick={() => selectLevel(id)}
                      >
                        {journeyLevelsById[id].title}
                      </button>
                    ))}
                </p>
              ) : null}

              {selected.action ? (
                <button
                  type="button"
                  className="journey__action"
                  onClick={() => onNavigate(selected.action.target)}
                >
                  <span>{selected.action.label}</span>
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
    {isTesterOpen ? <InputTester onClose={() => setIsTesterOpen(false)} /> : null}
    </div>
  );
}
