import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/input-tester.css';

/* ==========================================================================
   Keyboard layouts. Each key: [code, label, width] in key units (1u = one
   standard key). A bare number is an empty gap of that width. Rows are laid
   out left to right from `x`; every key is then placed on a CSS grid.
   ========================================================================== */

const row = (y, x, items) => {
  const keys = [];
  let cursor = x;
  items.forEach((item) => {
    if (typeof item === 'number') {
      cursor += item;
      return;
    }
    const [code, label, w = 1, h = 1] = item;
    keys.push({ code, label, x: cursor, y, w, h });
    cursor += w;
  });
  return keys;
};

const letters = (codesLabels) => codesLabels.split(' ').map((c) => [`Key${c}`, c]);
const digits = '1 2 3 4 5 6 7 8 9 0'.split(' ').map((d) => [`Digit${d}`, d]);
const fnKeys = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => [`F${from + i}`, `F${from + i}`]);

const ROW_NUMBERS = [['Backquote', '`'], ...digits, ['Minus', '-'], ['Equal', '=']];
const ROW_TOP = [...letters('Q W E R T Y U I O P'), ['BracketLeft', '['], ['BracketRight', ']']];
const ROW_HOME = [...letters('A S D F G H J K L'), ['Semicolon', ';'], ['Quote', "'"]];
const ROW_BOTTOM = [...letters('Z X C V B N M'), ['Comma', ','], ['Period', '.'], ['Slash', '/']];

// Full-size (ANSI, 104 keys): main block, nav cluster, numpad.
const FULL_SIZE = {
  id: 'full',
  label: 'Full-size',
  width: 23,
  rows: 6,
  keys: [
    // main block
    ...row(0, 0, [['Escape', 'Esc'], 1, ...fnKeys(1, 4), 0.5, ...fnKeys(5, 8), 0.5, ...fnKeys(9, 12)]),
    ...row(1, 0, [...ROW_NUMBERS, ['Backspace', 'Backspace', 2]]),
    ...row(2, 0, [['Tab', 'Tab', 1.5], ...ROW_TOP, ['Backslash', '\\', 1.5]]),
    ...row(3, 0, [['CapsLock', 'Caps', 1.75], ...ROW_HOME, ['Enter', 'Enter', 2.25]]),
    ...row(4, 0, [['ShiftLeft', 'Shift', 2.25], ...ROW_BOTTOM, ['ShiftRight', 'Shift', 2.75]]),
    ...row(5, 0, [
      ['ControlLeft', 'Ctrl', 1.25], ['MetaLeft', 'Win', 1.25], ['AltLeft', 'Alt', 1.25],
      ['Space', 'Space', 6.25],
      ['AltRight', 'Alt', 1.25], ['MetaRight', 'Win', 1.25], ['ContextMenu', 'Menu', 1.25], ['ControlRight', 'Ctrl', 1.25],
    ]),
    // navigation cluster
    ...row(0, 15.5, [['PrintScreen', 'PrtSc'], ['ScrollLock', 'ScrLk'], ['Pause', 'Pause']]),
    ...row(1, 15.5, [['Insert', 'Ins'], ['Home', 'Home'], ['PageUp', 'PgUp']]),
    ...row(2, 15.5, [['Delete', 'Del'], ['End', 'End'], ['PageDown', 'PgDn']]),
    ...row(4, 15.5, [1, ['ArrowUp', '↑']]),
    ...row(5, 15.5, [['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→']]),
    // numpad
    ...row(1, 19, [['NumLock', 'Num'], ['NumpadDivide', '/'], ['NumpadMultiply', '*'], ['NumpadSubtract', '-']]),
    ...row(2, 19, [['Numpad7', '7'], ['Numpad8', '8'], ['Numpad9', '9'], ['NumpadAdd', '+', 1, 2]]),
    ...row(3, 19, [['Numpad4', '4'], ['Numpad5', '5'], ['Numpad6', '6']]),
    ...row(4, 19, [['Numpad1', '1'], ['Numpad2', '2'], ['Numpad3', '3'], ['NumpadEnter', 'Ent', 1, 2]]),
    ...row(5, 19, [['Numpad0', '0', 2], ['NumpadDecimal', '.']]),
  ],
};

// 65% compact (68 keys): no F-row / numpad; arrows + a nav column.
// Esc sits where ` usually is; Fn is handled by the keyboard itself and
// can't be detected by a browser.
const COMPACT = {
  id: 'compact',
  label: '65% Compact',
  width: 16,
  rows: 5,
  keys: [
    ...row(0, 0, [['Escape', 'Esc'], ...digits, ['Minus', '-'], ['Equal', '='], ['Backspace', 'Backspace', 2], ['Home', 'Home']]),
    ...row(1, 0, [['Tab', 'Tab', 1.5], ...ROW_TOP, ['Backslash', '\\', 1.5], ['PageUp', 'PgUp']]),
    ...row(2, 0, [['CapsLock', 'Caps', 1.75], ...ROW_HOME, ['Enter', 'Enter', 2.25], ['PageDown', 'PgDn']]),
    ...row(3, 0, [['ShiftLeft', 'Shift', 2.25], ...ROW_BOTTOM, ['ShiftRight', 'Shift', 1.75], ['ArrowUp', '↑'], ['End', 'End']]),
    ...row(4, 0, [
      ['ControlLeft', 'Ctrl', 1.25], ['MetaLeft', 'Win', 1.25], ['AltLeft', 'Alt', 1.25],
      ['Space', 'Space', 6.25],
      ['AltRight', 'Alt'], [null, 'Fn'], ['ControlRight', 'Ctrl'],
      ['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→'],
    ]),
  ],
};

const LAYOUTS = [COMPACT, FULL_SIZE];
const COLS_PER_UNIT = 4; // grid resolution: quarter-key steps

// Kept for the whole visit, so reopening the tester shows what's been tested
// (e.g. Esc, which also closes it).
const memory = {
  layout: 'compact',
  tested: new Set(),
  mouse: { left: 0, middle: 0, right: 0, back: 0, forward: 0, up: 0, down: 0, moved: false },
};

const MOUSE_BUTTONS = { 0: 'left', 1: 'middle', 2: 'right', 3: 'back', 4: 'forward' };

/**
 * Keyboard & mouse tester (Alt + T). Press keys to light them up on the
 * chosen layout (glow while held, marked "tested" after); click, scroll and
 * move inside the pad to test the mouse. Every key, Esc included, is only
 * tested here (never acts on the page); close with the ✕ button.
 */
export default function InputTester({ onClose }) {
  const [layoutId, setLayoutId] = useState(memory.layout);
  const [tested, setTested] = useState(() => new Set(memory.tested));
  const [held, setHeld] = useState(() => new Set());
  const [lastKey, setLastKey] = useState(null);
  const [mouse, setMouse] = useState(() => ({ ...memory.mouse }));
  const [mouseHeld, setMouseHeld] = useState(() => new Set());
  const [wheel, setWheel] = useState(null); // 'up' | 'down' flash
  const [cursor, setCursor] = useState(null);

  const dialogRef = useRef(null);
  const padRef = useRef(null);
  const boardRef = useRef(null);
  const [unit, setUnit] = useState(44); // px per 1u key
  const wheelTimer = useRef(0);
  const openerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  const layout = LAYOUTS.find((item) => item.id === layoutId) || COMPACT;

  // 1u = the width that fits the whole board, kept between 30 and 56 px, so
  // keys stay square-ish and every row lines up (narrow screens scroll).
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const measure = () => {
      const styles = window.getComputedStyle(board);
      const inner = board.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      setUnit(Math.max(30, Math.min(56, Math.floor(inner / layout.width))));
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(board);
    return () => observer?.disconnect();
  }, [layout.width]);
  const layoutCodes = layout.keys.filter((key) => key.code).map((key) => key.code);
  const testedInLayout = layoutCodes.filter((code) => tested.has(code)).length;

  // Remember between openings.
  useEffect(() => {
    memory.layout = layoutId;
    memory.tested = new Set(tested);
    memory.mouse = { ...mouse };
  }, [layoutId, tested, mouse]);

  const reset = useCallback(() => {
    setTested(new Set());
    setHeld(new Set());
    setLastKey(null);
    setMouse({ left: 0, middle: 0, right: 0, back: 0, forward: 0, up: 0, down: 0, moved: false });
    setMouseHeld(new Set());
    setCursor(null);
  }, []);

  // ---- Keyboard -------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (event) => {
      const { code } = event;
      // Every key is only tested here: Esc, Tab, Space, arrows, Alt, F1-F12,
      // Meta... never reach the page (no closing, scrolling, menus, find).
      // Ctrl+R / Ctrl+F5 / F12 still pass so you can reload or open devtools.
      const passThrough = (event.ctrlKey && (code === 'KeyR' || code === 'F5')) || code === 'F12';
      if (!passThrough) event.preventDefault();
      event.stopPropagation();

      if (code) {
        memory.tested.add(code);
        setTested((current) => (current.has(code) ? current : new Set(current).add(code)));
        setHeld((current) => new Set(current).add(code));
      }
      setLastKey({ key: event.key === ' ' ? 'Space' : event.key, code: code || '—', keyCode: event.keyCode });
    };
    const onKeyUp = (event) => {
      const { code } = event;
      // Also on release: e.g. a lone Alt / F10 keyup would focus browser menus.
      event.preventDefault();
      event.stopPropagation();
      // Some keys (e.g. Print Screen on Windows) only report keyup.
      if (code) {
        setTested((current) => (current.has(code) ? current : new Set(current).add(code)));
        setHeld((current) => {
          const next = new Set(current);
          next.delete(code);
          return next;
        });
      }
    };
    const onKeyPress = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    // Releasing keys while the window loses focus would leave them "held".
    const onBlur = () => setHeld(new Set());

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('keypress', onKeyPress, true);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('keypress', onKeyPress, true);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // ---- Mouse pad --------------------------------------------------------------
  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return undefined;
    const press = (event) => {
      event.preventDefault(); // no middle-click autoscroll / side-button nav
      const name = MOUSE_BUTTONS[event.button];
      if (!name) return;
      setMouse((current) => ({ ...current, [name]: current[name] + 1 }));
      setMouseHeld((current) => new Set(current).add(name));
    };
    const release = (event) => {
      event.preventDefault();
      const name = MOUSE_BUTTONS[event.button];
      setMouseHeld((current) => {
        const next = new Set(current);
        next.delete(name);
        return next;
      });
    };
    const block = (event) => event.preventDefault();
    const onWheel = (event) => {
      event.preventDefault();
      if (!event.deltaY) return;
      const direction = event.deltaY < 0 ? 'up' : 'down';
      setMouse((current) => ({ ...current, [direction]: current[direction] + 1 }));
      setWheel(direction);
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => setWheel(null), 180);
    };
    const onMove = (event) => {
      const rect = pad.getBoundingClientRect();
      setCursor({ x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top) });
      setMouse((current) => (current.moved ? current : { ...current, moved: true }));
    };
    const onLeave = () => {
      setCursor(null);
      setMouseHeld(new Set());
    };

    pad.addEventListener('mousedown', press);
    pad.addEventListener('mouseup', release);
    pad.addEventListener('auxclick', block);
    pad.addEventListener('contextmenu', block);
    pad.addEventListener('wheel', onWheel, { passive: false });
    pad.addEventListener('mousemove', onMove);
    pad.addEventListener('mouseleave', onLeave);
    return () => {
      pad.removeEventListener('mousedown', press);
      pad.removeEventListener('mouseup', release);
      pad.removeEventListener('auxclick', block);
      pad.removeEventListener('contextmenu', block);
      pad.removeEventListener('wheel', onWheel);
      pad.removeEventListener('mousemove', onMove);
      pad.removeEventListener('mouseleave', onLeave);
      window.clearTimeout(wheelTimer.current);
    };
  }, []);

  // ---- Open / close: lock page scroll, restore focus -------------------------------
  useEffect(() => {
    const opener = openerRef.current;
    const { overflow } = document.body.style;
    const root = document.documentElement;
    const { scrollbarGutter } = root.style;
    // Keep the scrollbar's space while scrolling is locked, so the fixed nav
    // and the page don't shift sideways when the tester opens.
    root.style.scrollbarGutter = 'stable';
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  const keyState = (code) => {
    if (!code) return ' is-disabled';
    if (held.has(code)) return ' is-held';
    if (tested.has(code)) return ' is-tested';
    return '';
  };
  const mouseTested = (name) => (mouse[name] > 0 ? ' is-tested' : '');

  return createPortal(
    // Transparent layer: the page stays visible but can't be clicked by accident
    // while testing; only the ✕ button closes the tester.
    <div className="tester-overlay">
      <div
        ref={dialogRef}
        className="tester"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tester-title"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="tester__head">
          <p id="tester-title" className="tester__title">
            <span className="tester__title-dot" aria-hidden="true"></span>
            Input tester <span aria-hidden="true">{'//'}</span> keyboard &amp; mouse
          </p>
          <div className="tester__controls">
            <button type="button" className="tester__button" onClick={reset}>
              <i className="ri-refresh-line" aria-hidden="true"></i>
              Reset
            </button>
            <button
              type="button"
              className="tester__button tester__button--close"
              onClick={onClose}
              aria-label="Close tester"
            >
              Close
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        {/* Keyboard */}
        <section className="tester__section" aria-label="Keyboard tester">
          <div className="tester__bar">
            <div className="tester__layouts" role="group" aria-label="Keyboard layout">
              {LAYOUTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tester__layout${item.id === layoutId ? ' is-active' : ''}`}
                  aria-pressed={item.id === layoutId}
                  onClick={() => setLayoutId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="tester__count">
              <strong>{String(testedInLayout).padStart(2, '0')}</strong> / {layoutCodes.length} keys tested
            </span>
          </div>

          <div className="tester__keyboard-scroll" ref={boardRef}>
            <div
              className={`tester__keyboard tester__keyboard--${layout.id}`}
              style={{
                '--u': `${unit}px`,
                gridTemplateColumns: `repeat(${layout.width * COLS_PER_UNIT}, ${unit / COLS_PER_UNIT}px)`,
                gridTemplateRows: `repeat(${layout.rows}, ${unit}px)`,
              }}
            >
              {layout.keys.map((key) => (
                <span
                  key={`${key.code || key.label}-${key.x}-${key.y}`}
                  className={`tester-key${keyState(key.code)}`}
                  style={{
                    gridColumn: `${key.x * COLS_PER_UNIT + 1} / span ${key.w * COLS_PER_UNIT}`,
                    gridRow: `${key.y + 1} / span ${key.h}`,
                  }}
                  title={key.code || 'Handled by the keyboard (not detectable)'}
                >
                  {key.label}
                </span>
              ))}
            </div>
          </div>

          <div className="tester__readout">
            <span className="tester__readout-label">Last key</span>
            {lastKey ? (
              <>
                <span className="tester__readout-key">{lastKey.key}</span>
                <span>
                  code <strong>{lastKey.code}</strong>
                </span>
                <span>
                  keyCode <strong>{lastKey.keyCode}</strong>
                </span>
              </>
            ) : (
              <span>Press any key on your keyboard…</span>
            )}
            <span className="tester__note">Esc is tested too: close with ✕</span>
            <span className="tester__legend" aria-hidden="true">
              <span className="tester-key tester-key--swatch is-held"></span> held
              <span className="tester-key tester-key--swatch is-tested"></span> tested
            </span>
          </div>
        </section>

        {/* Mouse */}
        <section className="tester__section tester__mouse" aria-label="Mouse tester">
          <div
            ref={padRef}
            className={`tester-pad${cursor ? ' is-active' : ''}${mouse.moved ? ' is-moved' : ''}`}
          >
            {cursor ? (
              <span
                className="tester-pad__cursor"
                style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
                aria-hidden="true"
              ></span>
            ) : null}
            <span className="tester-pad__hint">
              {cursor ? `x ${cursor.x} · y ${cursor.y}` : 'Click, right-click, scroll and move here'}
            </span>
          </div>

          <div className="tester-mouse" aria-label="Mouse buttons">
            <div className="tester-mouse__body">
              <span className={`tester-mouse__btn tester-mouse__btn--left${mouseHeld.has('left') ? ' is-held' : mouseTested('left')}`}>L</span>
              <span className={`tester-mouse__wheel${mouseHeld.has('middle') ? ' is-held' : mouseTested('middle')}${wheel ? ` is-${wheel}` : ''}`}>
                <i className="ri-arrow-up-s-line" aria-hidden="true"></i>
                <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
              </span>
              <span className={`tester-mouse__btn tester-mouse__btn--right${mouseHeld.has('right') ? ' is-held' : mouseTested('right')}`}>R</span>
            </div>
            <ul className="tester-mouse__list">
              {[
                ['left', 'Left click'],
                ['right', 'Right click'],
                ['middle', 'Middle click'],
                ['up', 'Scroll up'],
                ['down', 'Scroll down'],
                ['back', 'Side: back'],
                ['forward', 'Side: forward'],
              ].map(([name, label]) => (
                <li key={name} className={mouse[name] > 0 ? 'is-tested' : ''}>
                  <span className="tester-mouse__check" aria-hidden="true"></span>
                  {label}
                  <strong>{mouse[name]}</strong>
                </li>
              ))}
              <li className={mouse.moved ? 'is-tested' : ''}>
                <span className="tester-mouse__check" aria-hidden="true"></span>
                Movement
                <strong>{mouse.moved ? 'OK' : '—'}</strong>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}
