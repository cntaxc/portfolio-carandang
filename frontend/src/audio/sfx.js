import {
  SFX_ENABLED,
  SFX_HOVER_COOLDOWN_MS,
  SFX_MASTER_VOLUME,
  SFX_SOUNDS,
  SFX_TARGETS,
} from './sfxConfig';

/**
 * Tiny SFX player for UI sounds (hover / click / sound-on notification).
 * installGlobalSfx() adds hover + click sounds to every button and link.
 *
 * - Files come from sfxConfig.js; a sound with no `src` is simply silent.
 * - Browsers block audio until the visitor has interacted with the page
 *   (click, tap or key). Until then, sounds are skipped instead of calling
 *   play(), so nothing is logged. The first interaction "unlocks" audio and
 *   warms up the files so the next sound starts instantly.
 * - A file that fails to load is marked broken and never retried, and every
 *   play() rejection is swallowed, so a missing file never throws.
 * - Each play uses a fresh copy of the preloaded element, so quick repeats
 *   overlap instead of cutting each other off.
 */

const entries = new Map(); // name -> { audio, broken }
const MUTE_KEY = 'portfolio-sfx-muted';
let unlocked = false;
let lastHoverAt = 0;

// Sound effects are OFF by default: they only play once the visitor turns
// the Quick actions "Sound effects" switch on (remembered in this browser;
// if storage is blocked, they stay off).
let muted = (() => {
  try {
    return window.localStorage.getItem(MUTE_KEY) !== '0';
  } catch (error) {
    return true;
  }
})();

const hasWindow = typeof window !== 'undefined' && typeof window.Audio === 'function';

// Has the visitor interacted yet? (Uses the browser's own flag when present.)
const isUnlocked = () =>
  unlocked || Boolean(typeof navigator !== 'undefined' && navigator.userActivation?.hasBeenActive);

function entryFor(name) {
  if (entries.has(name)) return entries.get(name);
  const sound = SFX_SOUNDS[name];
  if (!hasWindow || !sound?.src) return null;

  const audio = new window.Audio();
  const entry = { audio, broken: false };
  audio.preload = 'auto';
  audio.addEventListener('error', () => {
    entry.broken = true; // missing / unsupported file: stay silent from now on
  });
  audio.src = sound.src;
  entries.set(name, entry);
  return entry;
}

/** Load every configured sound (called on the first interaction). */
export function preloadSfx() {
  Object.keys(SFX_SOUNDS).forEach((name) => entryFor(name));
}

/** Play a sound by name ('hover', 'click', ...). Never throws. */
export function playSfx(name) {
  if (!SFX_ENABLED || muted || !hasWindow || !isUnlocked()) return;

  if (name === 'hover') {
    const now = Date.now();
    if (now - lastHoverAt < SFX_HOVER_COOLDOWN_MS) return;
    lastHoverAt = now;
  }

  const entry = entryFor(name);
  if (!entry || entry.broken) return;

  try {
    const node = entry.audio.cloneNode();
    node.volume = Math.min(1, Math.max(0, (SFX_SOUNDS[name].volume ?? 1) * SFX_MASTER_VOLUME));
    const result = node.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch (error) {
    // Audio unavailable in this browser: ignore.
  }
}

/** Is every sound effect muted (the Quick actions "Sound effects" switch)? */
export function isSfxMuted() {
  return muted;
}

/** Mute / unmute every sound effect and remember the choice. */
export function setSfxMuted(value) {
  muted = Boolean(value);
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch (error) {
    // Storage blocked: the choice lasts for this visit only.
  }
}

/**
 * onPointerEnter handler for hover sounds: mouse / pen only, so a tap on a
 * touch screen plays just the click sound, not hover + click.
 */
export function hoverSfx(event) {
  if (event?.pointerType === 'touch') return;
  playSfx('hover');
}

// ---- Site-wide hover / click sounds ------------------------------------------
// One set of listeners on the document covers every button and link (see
// SFX_TARGETS), including ones rendered later, so components need no wiring.
// Opt out with data-sfx="none" on the element or a parent; data-sfx-click=
// "none" keeps the hover sound but lets the element play its own click.

const targetOf = (node) => {
  const element = node instanceof Element ? node.closest(SFX_TARGETS) : null;
  if (!element || element.closest('[data-sfx="none"]')) return null;
  if (element.disabled || element.getAttribute('aria-disabled') === 'true') return null;
  return element;
};

let hovered = null; // the button the pointer is currently over

function onPointerOver(event) {
  if (event.pointerType === 'touch') return;
  const element = targetOf(event.target);
  // Only when the pointer enters a new button (not moving between its parts).
  if (!element || element === hovered) return;
  hovered = element;
  playSfx('hover');
}

function onPointerOut(event) {
  if (hovered && !hovered.contains(event.relatedTarget)) hovered = null;
}

function onClick(event) {
  const element = targetOf(event.target);
  if (element && element.dataset.sfxClick !== 'none') playSfx('click');
}

let installed = false;

/** Turn on the site-wide sounds (call once, e.g. from App). Returns cleanup. */
export function installGlobalSfx() {
  if (!hasWindow || installed) return () => {};
  installed = true;
  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('pointerout', onPointerOut, true);
  document.addEventListener('click', onClick, true);
  return () => {
    installed = false;
    document.removeEventListener('pointerover', onPointerOver, true);
    document.removeEventListener('pointerout', onPointerOut, true);
    document.removeEventListener('click', onClick, true);
  };
}

// First interaction anywhere: audio is allowed from now on; warm the files.
if (hasWindow) {
  const unlock = () => {
    unlocked = true;
    preloadSfx();
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}
