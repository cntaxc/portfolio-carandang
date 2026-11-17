import { useEffect, useRef, useState } from 'react';
import { techstackPreview } from '../../data/portfolio';

const SWAP_DURATION = 280;
const SWAP_MIN = 2;
const SWAP_MAX = 3;

function pickRandomSkills(pool, count) {
  const shuffled = [...pool];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function pickSwapIndices(length) {
  const count = Math.min(
    length,
    SWAP_MIN + Math.floor(Math.random() * (SWAP_MAX - SWAP_MIN + 1))
  );
  const indices = [];

  while (indices.length < count) {
    const index = Math.floor(Math.random() * length);

    if (!indices.includes(index)) {
      indices.push(index);
    }
  }

  return indices;
}

function getReplacementSkill(pool, currentLabels) {
  const available = pool.filter((skill) => !currentLabels.has(skill.label));

  if (!available.length) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

export default function TechstackPreviewSection({ onViewAll }) {
  const visibleCount = Math.min(
    techstackPreview.visibleCount,
    techstackPreview.skills.length
  );
  const [visibleSkills, setVisibleSkills] = useState(() =>
    pickRandomSkills(techstackPreview.skills, visibleCount)
  );
  const [swappingSlots, setSwappingSlots] = useState([]);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const swapTimeoutRef = useRef(null);

  useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    if (!motionQuery) {
      return undefined;
    }

    reducedMotionRef.current = motionQuery.matches;

    const handleMotionChange = (event) => {
      reducedMotionRef.current = event.matches;
    };

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      if (pausedRef.current || reducedMotionRef.current) {
        return;
      }

      const slots = pickSwapIndices(visibleCount);
      setSwappingSlots(slots);

      swapTimeoutRef.current = window.setTimeout(() => {
        if (reducedMotionRef.current) {
          setSwappingSlots([]);
          return;
        }

        setVisibleSkills((current) => {
          const currentLabels = new Set(current.map((skill) => skill.label));
          const next = [...current];

          slots.forEach((slot) => {
            const replacement = getReplacementSkill(
              techstackPreview.skills,
              currentLabels
            );

            if (replacement) {
              next[slot] = replacement;
              currentLabels.add(replacement.label);
            }
          });

          return next;
        });
        setSwappingSlots([]);
      }, SWAP_DURATION);
    }, techstackPreview.rotationInterval);

    return () => {
      window.clearInterval(rotationTimer);

      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
    };
  }, [visibleCount]);

  const pauseRotation = () => {
    pausedRef.current = true;
  };

  const resumeRotation = () => {
    pausedRef.current = false;
  };

  const handlePillListBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      resumeRotation();
    }
  };

  return (
    <section
      id="techstack-preview"
      className="section section-panel section-panel--techstack-preview techstack-preview"
      aria-labelledby="techstack-preview-title"
      data-reveal
    >
      <div className="techstack-preview__header">
        <div className="techstack-preview__heading">
          <h2 id="techstack-preview-title">{techstackPreview.title}</h2>
          <p className="techstack-preview__subtitle">{techstackPreview.subtitle}</p>
        </div>

        <a
          href="#techstack"
          className="techstack-preview__view-all"
          onClick={(event) => {
            event.preventDefault();
            onViewAll?.();
          }}
        >
          <span>View all</span>
          <span className="techstack-preview__view-all-arrow" aria-hidden="true">
            &rarr;
          </span>
        </a>
      </div>

      <ul
        className="techstack-pills"
        aria-label="Technology preview"
        onMouseEnter={pauseRotation}
        onMouseLeave={resumeRotation}
        onFocus={pauseRotation}
        onBlur={handlePillListBlur}
      >
        {visibleSkills.map((skill, index) => (
          <li
            key={`${index}-${skill.label}`}
            className={`techstack-pill${
              swappingSlots.includes(index) ? ' is-swapping' : ''
            }`}
            tabIndex={0}
            aria-label={`${skill.label}: ${skill.level}. ${skill.context}`}
          >
            <span className="techstack-pill__label">{skill.label}</span>
            <span className="techstack-pill__tooltip" role="tooltip">
              <strong>{skill.level}</strong>
              <span>{skill.context}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
