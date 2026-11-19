import { useEffect, useState } from 'react';
import PixelRobot from '../PixelRobot';
import { BEST_SCORE_EVENT, readBestScore } from '../grapple/bestScore';
import '../../styles/arcade.css';

// Deterministic pseudo-random numbers, so the skyline looks the same on
// every visit.
function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// One skyline layer as pixel rectangles: buildings with a few lit windows.
// Drawn twice side by side so it can scroll in a seamless loop.
function makeSkyline({ seed, width, minHeight, maxHeight, windowChance }) {
  const random = seeded(seed);
  const buildings = [];
  const windows = [];
  let x = 0;
  while (x < width) {
    const w = 6 + Math.floor(random() * 10);
    const h = minHeight + Math.floor(random() * (maxHeight - minHeight));
    buildings.push({ x, w, h });
    for (let wy = 3; wy < h - 2; wy += 3) {
      for (let wx = 2; wx < w - 2; wx += 3) {
        if (random() < windowChance) {
          windows.push({ x: x + wx, y: wy, h, teal: random() < 0.35 });
        }
      }
    }
    x += w + (random() < 0.3 ? 1 : 0);
  }
  return { buildings, windows };
}

const SKY_WIDTH = 200;
const SKY_HEIGHT = 70;
const FAR_LAYER = makeSkyline({ seed: 7, width: SKY_WIDTH, minHeight: 22, maxHeight: 52, windowChance: 0.08 });
const NEAR_LAYER = makeSkyline({ seed: 42, width: SKY_WIDTH, minHeight: 12, maxHeight: 36, windowChance: 0.12 });

function SkylineLayer({ layer, className, color }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SKY_WIDTH * 2} ${SKY_HEIGHT}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {[0, SKY_WIDTH].map((offset) => (
        <g key={offset} transform={`translate(${offset} 0)`}>
          {layer.buildings.map((building) => (
            <rect
              key={`b-${building.x}`}
              x={building.x}
              y={SKY_HEIGHT - building.h}
              width={building.w}
              height={building.h}
              fill={color}
            />
          ))}
          {layer.windows.map((win) => (
            <rect
              key={`w-${win.x}-${win.y}`}
              x={win.x}
              y={SKY_HEIGHT - win.h + win.y}
              width="1"
              height="1"
              fill={win.teal ? 'rgba(110, 245, 208, 0.7)' : 'rgba(245, 245, 240, 0.45)'}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

const SPARKS = [
  { x: 12, y: 30, delay: 0.2 },
  { x: 22, y: 62, delay: 1.6 },
  { x: 47, y: 18, delay: 0.9 },
  { x: 58, y: 44, delay: 2.4 },
  { x: 66, y: 22, delay: 1.2 },
  { x: 78, y: 56, delay: 0.5 },
  { x: 88, y: 28, delay: 2.0 },
  { x: 94, y: 48, delay: 3.1 },
];

export default function ArcadeSection({ onPlay }) {
  const [best, setBest] = useState(readBestScore);

  useEffect(() => {
    const sync = () => setBest(readBestScore());
    window.addEventListener(BEST_SCORE_EVENT, sync);
    return () => window.removeEventListener(BEST_SCORE_EVENT, sync);
  }, []);

  return (
    <section id="arcade" className="arcade-section" data-reveal aria-labelledby="arcade-title">
      <div className="arcade-card">
        <div className="arcade-card__scenery" aria-hidden="true">
          <div className="arcade-card__sky"></div>
          {SPARKS.map((spark) => (
            <span
              key={`${spark.x}-${spark.y}`}
              className="arcade-card__spark"
              style={{ left: `${spark.x}%`, top: `${spark.y}%`, animationDelay: `${spark.delay}s` }}
            ></span>
          ))}
          <div className="arcade-card__skyline arcade-card__skyline--far">
            <SkylineLayer layer={FAR_LAYER} className="arcade-card__skyline-svg" color="#141414" />
          </div>
          <div className="arcade-card__skyline arcade-card__skyline--near">
            <SkylineLayer layer={NEAR_LAYER} className="arcade-card__skyline-svg" color="#1b1b1b" />
          </div>
          <div className="arcade-card__floor"></div>
          <div className="arcade-card__mascot">
            <PixelRobot className="arcade-card__robot" />
            <span className="arcade-card__ring"></span>
          </div>
        </div>

        <div className="arcade-card__content">
          <p className="arcade-card__eyebrow">
            <i className="ri-gamepad-line" aria-hidden="true"></i>
            Arcade · Mini-game
          </p>
          <h2 id="arcade-title" className="arcade-card__title">
            Take a break &amp; escape the grid
          </h2>
          <p className="arcade-card__text">
            Test your aerial reflexes in GRAPPLE — an endless vertical
            magnet-climbing mini-game!
          </p>
          <div className="arcade-card__actions">
            <button type="button" className="arcade-card__play" onClick={onPlay}>
              <i className="ri-play-fill" aria-hidden="true"></i>
              Play GRAPPLE
            </button>
            {best > 0 ? (
              <span className="arcade-card__best">
                Your best <strong>{best}m</strong>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
