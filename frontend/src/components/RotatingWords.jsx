import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import '../styles/rotating-words.css';

// Cycles through `words` in place inside a sentence: the next word rises in
// from below while the previous one leaves upward. All words share one grid
// cell, and the slot's width eases to fit the current word, so the sentence
// stays tight around it. Screen readers get the whole list at once; with
// reduced motion the list is shown as plain text.

const DEFAULT_INTERVAL_MS = 2400;

// ["A", "B", "C"] -> "A, B, and C"
export function joinWords(words) {
  if (words.length < 2) return words[0] || '';
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`;
}

export default function RotatingWords({ words, interval = DEFAULT_INTERVAL_MS, className = '' }) {
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
    }, interval);
    return () => window.clearInterval(timer);
  }, [reducedMotion, words.length, interval]);

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

  if (reducedMotion) {
    return <strong className={`rotating-words-static ${className}`}>{joinWords(words)}</strong>;
  }

  const leavingIndex = (index - 1 + words.length) % words.length;
  return (
    <>
      <span className="sr-only">{joinWords(words)}</span>
      <span
        className={`rotating-words ${className}`}
        aria-hidden="true"
        style={width ? { width: `${width}px` } : undefined}
      >
        {words.map((word, wordIndex) => (
          <span
            key={word}
            ref={(element) => {
              wordRefs.current[wordIndex] = element;
            }}
            className={`rotating-words__word${
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
