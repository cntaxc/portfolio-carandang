import { useEffect, useLayoutEffect, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import '../styles/intro-splash.css';

// Intro splash, exactly 4 seconds, once per browser session:
//   0.0s - 3.4s  the pixel TV-head robot bobs over its holographic base
//   3.4s - 4.0s  it takes off: accelerates upward, glows and fades
//   4.0s         the overlay fades and scales up, revealing the hero
//
// While it plays, <html> gets `is-intro-playing`, which pauses the hero's
// CSS entrance animations so they start exactly when the intro exits.

const SESSION_KEY = 'portfolio-intro-played';
const TAKE_OFF_AT_MS = 3400; // idle bobbing ends, take-off begins
const EXIT_AT_MS = 4000; // overlay starts fading out (total intro time)
const EXIT_MS = 500; // must match .intro-splash.is-exiting in the CSS
const PLAYING_CLASS = 'is-intro-playing';

function hasPlayedThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (error) {
    return false; // storage blocked: just play it
  }
}

function markPlayed() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch (error) {
    // Storage blocked: the intro may play again next load, which is fine.
  }
}

// ---------------------------------------------------------------------------
// Pixel-art TV-head robot, 19 x 21 pixels (traced from the sprite pixel by
// pixel). Drawn as SVG squares, so it stays sharp at any size and has a
// transparent background.
// A outline, B body, C highlight, D screen shadow, E screen, F body shadow,
// G face, . empty

const ROBOT_COLORS = {
  A: '#030000',
  B: '#aaa27e',
  C: '#fdfecc',
  D: '#054a40',
  E: '#3e7d71',
  F: '#655e45',
  G: '#f4f880',
};

const ROBOT_PIXELS = [
  '..AAAAAAAAAAAAAAAA.',
  '.ABBBCCCCCCCCCCCCCA',
  '.ABBBCDDDDDDDDDDDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  'AFFCBCEEEEEEEEEEDCA',
  'AFFCBCEGEEEEEEEGDCA',
  'AFFCBCEEEGEEEGEEDCA',
  '.ABBBCEEEGGGGGEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCCCCCCCCCCCCCA',
  '..AAAFFFFFFFFFFAAA.',
  '.....AFBBBBBBBA....',
  '.....AFBFCCCCBA....',
  '.....AFBFCCCCBA....',
  '.....AFBFCCCCBA....',
  '.....AFBBBBBBBA....',
  '......ABAAAABA.....',
  '......ACA..ACA.....',
  '.......A....A......',
];

function PixelRobot() {
  const pixels = [];
  ROBOT_PIXELS.forEach((row, y) => {
    [...row].forEach((key, x) => {
      if (ROBOT_COLORS[key]) {
        pixels.push(
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={ROBOT_COLORS[key]} />
        );
      }
    });
  });
  return (
    <svg
      className="intro-splash__robot"
      viewBox={`0 0 ${ROBOT_PIXELS[0].length} ${ROBOT_PIXELS.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {pixels}
    </svg>
  );
}

// Rising background pixels: x position (% of screen), size (px), duration
// and delay (s), colour. Fixed values so every visit looks the same.
const PARTICLES = [
  { x: 38, size: 3, duration: 4.2, delay: 0.1, teal: true },
  { x: 43, size: 2, duration: 3.6, delay: 1.3, teal: false },
  { x: 46, size: 4, duration: 5.0, delay: 0.6, teal: true },
  { x: 49, size: 2, duration: 3.9, delay: 2.0, teal: false },
  { x: 52, size: 3, duration: 4.6, delay: 0.3, teal: false },
  { x: 55, size: 2, duration: 3.4, delay: 1.0, teal: true },
  { x: 58, size: 4, duration: 4.8, delay: 1.7, teal: false },
  { x: 61, size: 2, duration: 4.0, delay: 0.8, teal: true },
  { x: 35, size: 2, duration: 5.2, delay: 1.5, teal: false },
  { x: 64, size: 3, duration: 4.4, delay: 0.2, teal: false },
  { x: 41, size: 3, duration: 4.9, delay: 2.4, teal: true },
  { x: 57, size: 2, duration: 3.8, delay: 2.8, teal: true },
];

// ---------------------------------------------------------------------------

export default function IntroSplash() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== 'undefined' && !hasPlayedThisSession()
  );
  const [phase, setPhase] = useState('idle'); // idle -> takeoff -> exit

  // Reduced motion: skip the intro entirely.
  const shouldPlay = isVisible && !prefersReducedMotion;

  // Pause hero animations and lock scrolling before the first paint.
  useLayoutEffect(() => {
    if (!shouldPlay) return undefined;
    const root = document.documentElement;
    root.classList.add(PLAYING_CLASS);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      root.classList.remove(PLAYING_CLASS);
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldPlay]);

  useEffect(() => {
    if (!isVisible) return undefined;
    if (prefersReducedMotion) {
      markPlayed();
      setIsVisible(false);
      return undefined;
    }

    const timers = [
      window.setTimeout(() => setPhase('takeoff'), TAKE_OFF_AT_MS),
      window.setTimeout(() => {
        markPlayed();
        setPhase('exit');
        // Let the hero start animating as the overlay fades.
        document.documentElement.classList.remove(PLAYING_CLASS);
        document.body.style.overflow = '';
      }, EXIT_AT_MS),
      window.setTimeout(() => setIsVisible(false), EXIT_AT_MS + EXIT_MS),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [isVisible, prefersReducedMotion]);

  if (!shouldPlay) {
    return null;
  }

  return (
    <div
      className={`intro-splash${phase !== 'idle' ? ' is-taking-off' : ''}${
        phase === 'exit' ? ' is-exiting' : ''
      }`}
      role="status"
      aria-label="Loading portfolio"
    >
      {/* Background layers: grid, centre spotlight, rising pixels. */}
      <div className="intro-splash__grid" aria-hidden="true"></div>
      <div className="intro-splash__spotlight" aria-hidden="true"></div>
      <div className="intro-splash__particles" aria-hidden="true">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className={`intro-splash__particle${particle.teal ? ' is-teal' : ''}`}
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${-particle.delay}s`,
            }}
          ></span>
        ))}
      </div>

      <div className="intro-splash__stage">
        {/* Outer element: take-off. Inner element: idle bob. Kept separate
            so the take-off starts from wherever the bob is, without a jump. */}
        <div className="intro-splash__lift">
          <div className="intro-splash__float">
            <PixelRobot />
          </div>
        </div>
        <span className="intro-splash__beam" aria-hidden="true"></span>
        <span className="intro-splash__ring" aria-hidden="true"></span>
      </div>
    </div>
  );
}
