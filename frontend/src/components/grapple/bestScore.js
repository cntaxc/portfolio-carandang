// GRAPPLE best height, kept in localStorage so it survives reloads and
// leaving the game. Components listen for BEST_SCORE_EVENT to stay in sync.

const STORAGE_KEY = 'grapple-best-height';
export const BEST_SCORE_EVENT = 'grapple:best';

export function readBestScore() {
  try {
    return Math.max(0, Number(window.localStorage.getItem(STORAGE_KEY)) || 0);
  } catch (error) {
    return 0;
  }
}

/** Saves `meters` if it beats the stored best. Returns true for a new best. */
export function submitScore(meters) {
  if (meters <= readBestScore()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(meters));
  } catch (error) {
    // Storage blocked: the best still shows for this visit.
  }
  window.dispatchEvent(new CustomEvent(BEST_SCORE_EVENT, { detail: meters }));
  return true;
}
