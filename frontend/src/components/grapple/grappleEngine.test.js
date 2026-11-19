import { createGrappleGame, metersFor } from './grappleEngine';

function fakeCanvas() {
  const noop = () => {};
  return {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width: 400, height: 700 }),
    getContext: () =>
      new Proxy(
        {},
        {
          get: (target, key) => (key in target ? target[key] : noop),
          set: (target, key, value) => {
            target[key] = value;
            return true;
          },
        }
      ),
  };
}

// A simple bot: hold to grab, let go once it has shot above the peg (or has
// come to rest under it), then grab again.
function playBot(game, seconds) {
  game.press();
  for (let t = 0; t < seconds && game.getState() === 'running'; t += 0.02) {
    const { player, rope } = game.inspect();
    const stalled = Math.hypot(player.vx, player.vy) < 15;
    if (rope && (player.y < rope.peg.y - 2 || stalled)) game.release();
    else if (!rope) game.press();
    game.tick(0.02);
  }
}

describe('GRAPPLE engine', () => {
  test('starts ready and begins running on the first press', () => {
    const changes = [];
    const game = createGrappleGame(fakeCanvas(), { onStateChange: (s) => changes.push(s) });
    game.resize();
    expect(game.getState()).toBe('ready');
    game.press();
    expect(game.getState()).toBe('running');
    expect(game.inspect().rope).not.toBeNull(); // grabbed the first peg
    expect(changes).toEqual(['running']);
  });

  test('a simple grab-and-release strategy can climb', () => {
    const results = [];
    for (let run = 0; run < 5; run += 1) {
      const game = createGrappleGame(fakeCanvas());
      game.resize();
      playBot(game, 20);
      results.push(metersFor(game.inspect().climbed));
    }
    // Climbing works on most seeds (the course is random).
    expect(results.filter((meters) => meters >= 30).length).toBeGreaterThanOrEqual(3);
  });

  test('doing nothing gets caught by the rising glitch', () => {
    let finalScore = null;
    const game = createGrappleGame(fakeCanvas(), { onGameOver: (m) => (finalScore = m) });
    game.resize();
    game.press();
    game.release();
    game.tick(40);
    expect(game.getState()).toBe('over');
    expect(finalScore).not.toBeNull();
  });

  test('the camera never scrolls back down', () => {
    const game = createGrappleGame(fakeCanvas());
    game.resize();
    game.press();
    let highest = game.inspect().camY;
    for (let i = 0; i < 200 && game.getState() === 'running'; i += 1) {
      if (i % 20 === 10) game.release();
      if (i % 20 === 0) game.press();
      game.tick(0.03);
      const { camY } = game.inspect();
      expect(camY).toBeLessThanOrEqual(highest + 1e-9);
      highest = camY;
    }
  });

  test('pause freezes the run and press resumes it', () => {
    const game = createGrappleGame(fakeCanvas());
    game.resize();
    game.press();
    game.pause();
    expect(game.getState()).toBe('paused');
    const before = game.inspect().player.y;
    game.tick(1);
    expect(game.inspect().player.y).toBe(before);
    game.press();
    expect(game.getState()).toBe('running');
  });

  test('restart returns to a fresh ready state', () => {
    const game = createGrappleGame(fakeCanvas());
    game.resize();
    game.press();
    game.tick(3);
    game.restart();
    expect(game.getState()).toBe('ready');
    expect(game.inspect().climbed).toBe(0);
  });
});
