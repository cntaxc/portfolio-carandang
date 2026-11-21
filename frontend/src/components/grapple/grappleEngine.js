// GRAPPLE: an endless vertical magnet-climbing game drawn on a <canvas>.
//
// How it plays:
//   Hold (mouse, touch, Space or Up) to lock a magnet beam onto the nearest
//   peg in range. The magnet pulls you toward the peg harder than gravity,
//   so you shoot up and past it. Release at the right moment to fling
//   yourself upward, then grab the next peg. Hold too long and you just
//   yo-yo around the peg.
//   A glitch wave rises from below and speeds up as you climb. Touch it, or
//   fall off the bottom of the screen, and the run ends.
//
// The game renders at a low internal resolution (160 units wide) and is
// scaled up with `image-rendering: pixelated` for a crisp pixel-art look.
// World y grows downward, so climbing means y gets smaller.
//
//   const game = createGrappleGame(canvas, { onHeight, onStateChange, onGameOver });
//   game.setActive(true); game.press(); game.release(); game.destroy();

// ---------------------------------------------------------------------------
// Tuning

const VIEW_WIDTH = 160;
const WALL = 6;
const PLAYER_HALF = 4;
const GRAVITY = 430;
const MAX_FALL_SPEED = 380;
const GRAB_RANGE = 74;
const MAGNET_ACCEL = 900; // pull toward the locked peg (gravity still applies)
const MAGNET_DAMPING = 1.6; // per second while locked, so holding settles down
const MAX_SPEED = 260;
const RELEASE_BOOST = 40; // small upward kick when letting go
const WALL_BOUNCE = 0.5;
const START_Y = 0;
const PLATFORM_TOP = START_Y + PLAYER_HALF;
const HAZARD_GRACE_S = 1.5; // the glitch waits this long after the first grab
const UNITS_PER_METER = 10;
const STEP = 1 / 120; // fixed physics step for stable swinging

// Palette (Cozy Black + the splash screen's holo teal; the hazard is red so
// danger reads instantly).
const COLORS = {
  bg: '#0c0c0c',
  grid: 'rgba(245, 245, 240, 0.04)',
  star: 'rgba(245, 245, 240, 0.35)',
  wall: '#151515',
  wallBrick: '#1d1d1d',
  wallEdge: 'rgba(110, 245, 208, 0.18)',
  peg: '#6ef5d0',
  pegGlow: 'rgba(110, 245, 208, 0.16)',
  pegDim: 'rgba(110, 245, 208, 0.45)',
  beam: '#6ef5d0',
  target: 'rgba(245, 245, 240, 0.85)',
  platform: '#2a2a2a',
  platformEdge: 'rgba(245, 245, 240, 0.4)',
  hazard: '#ff3d6e',
  hazardFill: 'rgba(255, 61, 110, 0.10)',
  hazardDeep: 'rgba(255, 61, 110, 0.05)',
};

// Mini version of the portfolio's TV-head robot, 8 x 8.
const PLAYER_SPRITE = [
  '.AAAAAA.',
  'ACCCCCCA',
  'ACEEEECA',
  'ACGEEGCA',
  'ACEGGECA',
  'ACCCCCCA',
  '.AFBBFA.',
  '..C..C..',
];
const PLAYER_COLORS = {
  A: '#030000',
  B: '#aaa27e',
  C: '#fdfecc',
  E: '#3e7d71',
  F: '#655e45',
  G: '#f4f880',
};

// ---------------------------------------------------------------------------

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => min + Math.random() * (max - min);

export const metersFor = (units) => Math.floor(Math.max(0, units) / UNITS_PER_METER);

export function createGrappleGame(canvas, callbacks = {}) {
  const ctx = canvas.getContext('2d');
  const { onHeight = () => {}, onStateChange = () => {}, onGameOver = () => {} } = callbacks;

  let viewHeight = 280;
  let state = 'ready'; // ready | running | paused | over
  let active = false;
  let frameId = 0;
  let lastTime = 0;
  let accumulator = 0;
  let time = 0;
  let runTime = 0;

  let player;
  let rope;
  let holding;
  let pegs;
  let lastPeg;
  let particles;
  let camY;
  let hazardY;
  let climbed;
  let reportedMeters;
  let stars = [];

  // ---- setup ---------------------------------------------------------------

  function setState(next) {
    if (state === next) return;
    state = next;
    onStateChange(next);
  }

  function makeStars() {
    stars = Array.from({ length: 36 }, () => ({
      x: Math.floor(random(WALL + 2, VIEW_WIDTH - WALL - 2)),
      y: Math.floor(random(0, 600)),
      twinkle: random(0, Math.PI * 2),
    }));
  }

  function reset() {
    player = { x: VIEW_WIDTH / 2, y: START_Y, vx: 0, vy: 0 };
    rope = null;
    holding = false;
    // A fixed starter peg straight above the player, so the first press
    // always has something in reach (random pegs could land out of range).
    const starter = {
      x: VIEW_WIDTH / 2,
      y: START_Y - 36,
      baseX: VIEW_WIDTH / 2,
      amplitude: 0,
      speed: 1,
      phase: 0,
    };
    pegs = [starter];
    lastPeg = starter;
    particles = [];
    camY = START_Y - viewHeight * 0.72;
    hazardY = camY + viewHeight + 30;
    climbed = 0;
    reportedMeters = -1;
    runTime = 0;
    accumulator = 0;
    addPegsAbove(camY - viewHeight);
    reportHeight();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nextHeight = Math.round((VIEW_WIDTH * rect.height) / rect.width);
    if (nextHeight === viewHeight && canvas.width === VIEW_WIDTH) return;
    const firstSize = canvas.width !== VIEW_WIDTH;
    viewHeight = clamp(nextHeight, 160, 420);
    canvas.width = VIEW_WIDTH;
    canvas.height = viewHeight;
    ctx.imageSmoothingEnabled = false;
    if (firstSize || state === 'ready') reset();
    addPegsAbove(camY - viewHeight);
    draw();
  }

  // ---- world generation ----------------------------------------------------

  function addPegsAbove(topY) {
    while (lastPeg.y > topY) {
      const height = START_Y - lastPeg.y;
      const difficulty = clamp(height / 3000, 0, 1);
      const gap = random(30, 46) + difficulty * 18;
      const y = lastPeg.y - gap;
      // Keep each peg within reach of the previous one.
      const minX = Math.max(WALL + 12, lastPeg.x - 62);
      const maxX = Math.min(VIEW_WIDTH - WALL - 12, lastPeg.x + 62);
      const x = random(minX, maxX);
      const moving = Math.random() < difficulty * 0.55;
      const peg = {
        x,
        y,
        baseX: x,
        amplitude: moving ? random(10, 26) : 0,
        speed: random(0.8, 1.8),
        phase: random(0, Math.PI * 2),
      };
      pegs.push(peg);
      lastPeg = peg;
    }
    // Forget pegs far below the screen.
    const cutoff = camY + viewHeight * 2;
    if (pegs.length > 80) pegs = pegs.filter((peg) => peg.y < cutoff);
  }

  function updatePegs() {
    for (const peg of pegs) {
      if (!peg.amplitude) continue;
      peg.x = clamp(
        peg.baseX + Math.sin(time * peg.speed + peg.phase) * peg.amplitude,
        WALL + 8,
        VIEW_WIDTH - WALL - 8
      );
    }
  }

  // Nearest peg in range, preferring pegs above the player.
  function findTarget() {
    let best = null;
    let bestScore = Infinity;
    for (const peg of pegs) {
      const dx = peg.x - player.x;
      const dy = peg.y - player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > GRAB_RANGE || distance < 4) continue;
      const score = distance + (dy > 0 ? 45 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = peg;
      }
    }
    return best;
  }

  // ---- effects -------------------------------------------------------------

  function burst(x, y, count, color, speed = 60) {
    for (let i = 0; i < count; i += 1) {
      const angle = random(0, Math.PI * 2);
      const velocity = random(speed * 0.3, speed);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: random(0.25, 0.6),
        color,
      });
    }
  }

  function updateParticles(dt) {
    for (const particle of particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 120 * dt;
    }
    particles = particles.filter((particle) => particle.life > 0);
  }

  // ---- input ---------------------------------------------------------------

  function grab() {
    const peg = findTarget();
    if (!peg) return;
    rope = { peg };
    burst(peg.x, peg.y, 6, COLORS.peg, 50);
  }

  function letGo() {
    if (!rope) return;
    rope = null;
    player.vy -= RELEASE_BOOST;
  }

  function press() {
    holding = true;
    if (state === 'ready') {
      setState('running');
      grab();
    } else if (state === 'paused') {
      resume();
    } else if (state === 'running' && !rope) {
      grab();
    }
  }

  function release() {
    holding = false;
    if (state === 'running') letGo();
  }

  // ---- simulation ----------------------------------------------------------

  function reportHeight() {
    const meters = metersFor(climbed);
    if (meters !== reportedMeters) {
      reportedMeters = meters;
      onHeight(meters);
    }
  }

  function hazardSpeed() {
    return 18 + Math.min(42, climbed / 80);
  }

  function gameOver() {
    rope = null;
    holding = false;
    burst(player.x, player.y, 24, COLORS.hazard, 110);
    burst(player.x, player.y, 10, PLAYER_COLORS.C, 80);
    setState('over');
    onGameOver(metersFor(climbed));
  }

  function step(dt) {
    time += dt;
    updatePegs();
    updateParticles(dt);
    if (state !== 'running') return;

    runTime += dt;
    if (runTime > HAZARD_GRACE_S) hazardY -= hazardSpeed() * dt;
    // The wave never falls too far behind the camera.
    hazardY = Math.min(hazardY, camY + viewHeight + 40);

    if (holding && !rope) grab();

    player.vy += GRAVITY * dt;

    if (rope) {
      const dx = rope.peg.x - player.x;
      const dy = rope.peg.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      // Ease off right at the peg so the player doesn't jitter on top of it.
      const strength = Math.min(1, distance / 6);
      player.vx += (dx / distance) * MAGNET_ACCEL * strength * dt;
      player.vy += (dy / distance) * MAGNET_ACCEL * strength * dt;
      const damping = Math.max(0, 1 - MAGNET_DAMPING * dt);
      player.vx *= damping;
      player.vy *= damping;
    }

    const speed = Math.hypot(player.vx, player.vy);
    if (speed > MAX_SPEED) {
      player.vx *= MAX_SPEED / speed;
      player.vy *= MAX_SPEED / speed;
    }
    player.vy = Math.min(player.vy, MAX_FALL_SPEED);
    const previousY = player.y;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Shaft walls.
    const left = WALL + PLAYER_HALF;
    const right = VIEW_WIDTH - WALL - PLAYER_HALF;
    if (player.x < left) {
      player.x = left;
      player.vx = Math.abs(player.vx) * WALL_BOUNCE;
    } else if (player.x > right) {
      player.x = right;
      player.vx = -Math.abs(player.vx) * WALL_BOUNCE;
    }

    // Starting platform.
    if (
      !rope &&
      player.vy > 0 &&
      previousY + PLAYER_HALF <= PLATFORM_TOP + 0.5 &&
      player.y + PLAYER_HALF >= PLATFORM_TOP
    ) {
      player.y = PLATFORM_TOP - PLAYER_HALF;
      player.vy = 0;
      player.vx *= 0.8;
    }

    climbed = Math.max(climbed, START_Y - player.y);
    reportHeight();

    // Camera follows the highest point and never scrolls back down.
    const targetTop = player.y - viewHeight * 0.55;
    if (targetTop < camY) camY += (targetTop - camY) * Math.min(1, dt * 6);
    addPegsAbove(camY - viewHeight);

    if (player.y + PLAYER_HALF > hazardY || player.y - PLAYER_HALF > camY + viewHeight) {
      gameOver();
    }
  }

  // ---- drawing -------------------------------------------------------------

  const screenY = (worldY) => Math.round(worldY - camY);

  function drawBackground() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, VIEW_WIDTH, viewHeight);

    // Distant stars, slow parallax.
    for (const star of stars) {
      const y = (((star.y - camY * 0.25) % 600) + 600) % 600;
      if (y > viewHeight) continue;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.5 + star.twinkle));
      ctx.fillStyle = COLORS.star;
      ctx.fillRect(star.x, Math.floor(y), 1, 1);
    }
    ctx.globalAlpha = 1;

    // Blueprint grid, mid parallax.
    ctx.fillStyle = COLORS.grid;
    const offset = ((-camY * 0.5) % 16 + 16) % 16;
    for (let y = Math.floor(offset); y < viewHeight; y += 16) ctx.fillRect(0, y, VIEW_WIDTH, 1);
    for (let x = WALL + 4; x < VIEW_WIDTH - WALL; x += 16) ctx.fillRect(x, 0, 1, viewHeight);
  }

  function drawWalls() {
    const brickOffset = ((-camY % 8) + 8) % 8;
    for (const x of [0, VIEW_WIDTH - WALL]) {
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(x, 0, WALL, viewHeight);
      ctx.fillStyle = COLORS.wallBrick;
      for (let y = Math.floor(brickOffset) - 8, row = 0; y < viewHeight; y += 4, row += 1) {
        ctx.fillRect(x + (row % 2 ? 0 : 3), y, 3, 1);
      }
    }
    ctx.fillStyle = COLORS.wallEdge;
    ctx.fillRect(WALL - 1, 0, 1, viewHeight);
    ctx.fillRect(VIEW_WIDTH - WALL, 0, 1, viewHeight);
  }

  function drawPlatform() {
    const y = screenY(PLATFORM_TOP);
    if (y > viewHeight || y < -4) return;
    ctx.fillStyle = COLORS.platform;
    ctx.fillRect(WALL, y, VIEW_WIDTH - WALL * 2, 4);
    ctx.fillStyle = COLORS.platformEdge;
    ctx.fillRect(WALL, y, VIEW_WIDTH - WALL * 2, 1);
  }

  function drawPegs(target) {
    for (const peg of pegs) {
      const x = Math.round(peg.x);
      const y = screenY(peg.y);
      if (y < -6 || y > viewHeight + 6) continue;
      const pulse = 0.6 + 0.4 * Math.sin(time * 4 + peg.phase);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = COLORS.pegGlow;
      ctx.fillRect(x - 3, y - 3, 7, 7);
      ctx.globalAlpha = 1;
      ctx.fillStyle = peg.amplitude ? COLORS.pegDim : COLORS.peg;
      ctx.fillRect(x - 1, y - 1, 3, 3);
      if (peg.amplitude) {
        ctx.fillStyle = COLORS.peg;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Corner brackets around the peg the magnet would lock onto.
    if (target) {
      const x = Math.round(target.x);
      const y = screenY(target.y);
      ctx.fillStyle = COLORS.target;
      for (const [cx, cy] of [[-5, -5], [3, -5], [-5, 3], [3, 3]]) {
        ctx.fillRect(x + cx, y + cy, 3, 1);
        ctx.fillRect(x + cx + (cx < 0 ? 0 : 2), y + cy + (cy < 0 ? 0 : -2), 1, 3);
      }
    }
  }

  function drawBeam() {
    if (!rope) return;
    const x0 = player.x;
    const y0 = player.y;
    const x1 = rope.peg.x;
    const y1 = rope.peg.y;
    const length = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.floor(length / 2));
    ctx.fillStyle = COLORS.beam;
    for (let i = 0; i <= steps; i += 1) {
      if ((i + Math.floor(time * 30)) % 3 === 0) continue; // flowing dashes
      const t = i / steps;
      ctx.fillRect(Math.round(x0 + (x1 - x0) * t), screenY(y0 + (y1 - y0) * t), 1, 1);
    }
  }

  function drawPlayer() {
    if (state === 'over') return;
    const bob = state === 'ready' ? Math.round(Math.sin(time * 4)) : 0;
    const left = Math.round(player.x - PLAYER_HALF);
    const top = screenY(player.y - PLAYER_HALF) + bob;
    PLAYER_SPRITE.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        const color = PLAYER_COLORS[row[x]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(left + x, top + y, 1, 1);
      }
    });
  }

  function drawHazard() {
    const y = screenY(hazardY);
    if (y > viewHeight) return;
    const top = Math.max(0, y);
    ctx.fillStyle = COLORS.hazardFill;
    ctx.fillRect(0, top, VIEW_WIDTH, viewHeight - top);
    ctx.fillStyle = COLORS.hazardDeep;
    for (let row = top + 3; row < viewHeight; row += 3) ctx.fillRect(0, row, VIEW_WIDTH, 1);

    // Glitchy edge: jittering segments and the odd displaced block.
    ctx.fillStyle = COLORS.hazard;
    for (let x = 0; x < VIEW_WIDTH; x += 4) {
      const jitter = Math.random() < 0.25 ? Math.floor(random(-2, 3)) : 0;
      ctx.fillRect(x, y + jitter, 4, 1);
    }
    for (let i = 0; i < 3; i += 1) {
      ctx.globalAlpha = 0.6;
      ctx.fillRect(Math.floor(random(0, VIEW_WIDTH - 10)), y - Math.floor(random(2, 8)), Math.floor(random(3, 10)), 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    for (const particle of particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 2.5);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x), screenY(particle.y), 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    drawBackground();
    drawWalls();
    drawPlatform();
    const target = state === 'running' && !rope ? findTarget() : null;
    drawPegs(target);
    drawBeam();
    drawPlayer();
    drawParticles();
    drawHazard();
  }

  // ---- loop ----------------------------------------------------------------

  function frame(now) {
    const elapsed = Math.min(0.05, (now - lastTime) / 1000 || 0);
    lastTime = now;
    if (state !== 'paused') {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        step(STEP);
        accumulator -= STEP;
      }
    }
    draw();
    frameId = active ? window.requestAnimationFrame(frame) : 0;
  }

  function setActive(next) {
    active = next;
    if (active && !frameId) {
      resize();
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(frame);
    } else if (!active && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function pause() {
    if (state === 'running') {
      holding = false;
      setState('paused');
    }
  }

  function resume() {
    if (state === 'paused') {
      accumulator = 0;
      lastTime = performance.now();
      setState('running');
    }
  }

  function restart() {
    reset();
    setState('ready');
  }

  makeStars();
  reset();

  return {
    press,
    release,
    pause,
    resume,
    restart,
    resize,
    setActive,
    getState: () => state,
    // Test helpers: advance the simulation without animation frames, and
    // read the world.
    tick(seconds) {
      for (let elapsed = 0; elapsed < seconds; elapsed += STEP) step(STEP);
    },
    inspect: () => ({ player: { ...player }, rope, climbed, hazardY, camY, viewHeight }),
    destroy() {
      setActive(false);
    },
  };
}
