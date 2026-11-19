import { useCallback, useEffect, useRef, useState } from 'react';
import PixelRobot from '../PixelRobot';
import { createGrappleGame } from './grappleEngine';
import { BEST_SCORE_EVENT, readBestScore, submitScore } from './bestScore';
import '../../styles/grapple.css';

const HOLD_KEYS = new Set(['Space', 'ArrowUp', 'KeyW', 'KeyZ']);

/**
 * Full-screen GRAPPLE game view. Stays mounted after the first launch, so
 * leaving with "Return to Portfolio" pauses the run instead of losing it.
 */
export default function GrappleGame({ isOpen, onExit }) {
  const canvasRef = useRef(null);
  const viewRef = useRef(null);
  const gameRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [gameState, setGameState] = useState('ready');
  const [height, setHeight] = useState(0);
  const [best, setBest] = useState(readBestScore);
  const [result, setResult] = useState(null); // { meters, isNewBest }

  const restart = useCallback(() => {
    setResult(null);
    gameRef.current?.restart();
    viewRef.current?.focus({ preventScroll: true });
  }, []);

  // Create the engine once.
  useEffect(() => {
    const game = createGrappleGame(canvasRef.current, {
      onHeight: setHeight,
      onStateChange: setGameState,
      onGameOver: (meters) => {
        const isNewBest = submitScore(meters);
        setResult({ meters, isNewBest });
        setBest(readBestScore());
      },
    });
    gameRef.current = game;
    const syncBest = () => setBest(readBestScore());
    window.addEventListener(BEST_SCORE_EVENT, syncBest);
    return () => {
      window.removeEventListener(BEST_SCORE_EVENT, syncBest);
      game.destroy();
    };
  }, []);

  // Opening/closing: run the loop only while visible, pause on exit, lock
  // page scrolling, and move focus in and back out.
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return undefined;
    if (!isOpen) {
      game.pause();
      game.setActive(false);
      return undefined;
    }

    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    game.setActive(true);
    viewRef.current?.focus({ preventScroll: true });

    const pauseOnHide = () => {
      if (document.hidden) game.pause();
    };
    const pauseOnBlur = () => game.pause();
    const handleResize = () => game.resize();
    document.addEventListener('visibilitychange', pauseOnHide);
    window.addEventListener('blur', pauseOnBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('visibilitychange', pauseOnHide);
      window.removeEventListener('blur', pauseOnBlur);
      window.removeEventListener('resize', handleResize);
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // Keyboard: hold Space / Up / W / Z, Esc to pause, Enter to retry.
  useEffect(() => {
    if (!isOpen) return undefined;
    const game = gameRef.current;
    const onKeyDown = (event) => {
      if (HOLD_KEYS.has(event.code)) {
        event.preventDefault();
        if (!event.repeat && game.getState() !== 'over') game.press();
      } else if (event.code === 'Escape') {
        event.preventDefault();
        if (game.getState() === 'running') game.pause();
        else if (game.getState() === 'paused') game.resume();
      } else if (event.code === 'Enter' && game.getState() === 'over') {
        event.preventDefault();
        restart();
      }
    };
    const onKeyUp = (event) => {
      if (HOLD_KEYS.has(event.code)) game.release();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen, restart]);

  const handlePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (gameRef.current?.getState() === 'over') return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gameRef.current?.press();
  };
  const handlePointerUp = () => gameRef.current?.release();

  return (
    <div
      ref={viewRef}
      id="game-view"
      className={`grapple${isOpen ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="GRAPPLE mini-game"
      aria-hidden={!isOpen}
      tabIndex={-1}
    >
      <button type="button" className="grapple__back" onClick={onExit}>
        <i className="ri-arrow-left-line" aria-hidden="true"></i>
        Return to Portfolio
      </button>

      <div className="grapple__shaft">
        <div className="grapple__hud" aria-live="off">
          <span>
            <small>Height</small>
            {height}m
          </span>
          <span>
            <small>Best</small>
            {best}m
          </span>
          {gameState === 'running' ? (
            <button
              type="button"
              className="grapple__pause"
              onClick={() => gameRef.current?.pause()}
              aria-label="Pause"
            >
              <i className="ri-pause-line" aria-hidden="true"></i>
            </button>
          ) : null}
        </div>

        <div
          className="grapple__stage"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(event) => event.preventDefault()}
        >
          <canvas
            ref={canvasRef}
            className="grapple__canvas"
            aria-label="GRAPPLE game screen. Hold to magnet onto a peg, release to fling upward."
          />
        </div>

        {gameState === 'ready' ? (
          <div className="grapple__overlay grapple__overlay--intro">
            <PixelRobot className="grapple__mascot" />
            <h2 className="grapple__title">GRAPPLE</h2>
            <ul className="grapple__howto">
              <li>
                <kbd>Hold</kbd> to magnet onto the nearest peg
              </li>
              <li>
                <kbd>Release</kbd> to fling upward
              </li>
              <li>Outclimb the rising glitch</li>
            </ul>
            <p className="grapple__prompt">Click, tap or press Space to start</p>
          </div>
        ) : null}

        {gameState === 'paused' ? (
          <div className="grapple__overlay grapple__overlay--card">
            <h2 className="grapple__title grapple__title--small">PAUSED</h2>
            <p className="grapple__stat">
              {height}m <small>so far</small>
            </p>
            <div className="grapple__actions">
              <button
                type="button"
                className="grapple__button"
                onClick={() => gameRef.current?.resume()}
              >
                <i className="ri-play-fill" aria-hidden="true"></i>
                Resume
              </button>
              <button type="button" className="grapple__button grapple__button--ghost" onClick={restart}>
                Restart
              </button>
            </div>
          </div>
        ) : null}

        {gameState === 'over' && result ? (
          <div className="grapple__overlay grapple__overlay--card">
            <h2 className="grapple__title grapple__title--small grapple__title--danger">
              GLITCHED OUT
            </h2>
            <p className="grapple__stat">
              {result.meters}m
              {result.isNewBest ? <span className="grapple__badge">New best!</span> : null}
            </p>
            <p className="grapple__best">Best {best}m</p>
            <div className="grapple__actions">
              <button type="button" className="grapple__button" onClick={restart}>
                <i className="ri-restart-line" aria-hidden="true"></i>
                Play again
              </button>
              <button type="button" className="grapple__button grapple__button--ghost" onClick={onExit}>
                Back to portfolio
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
