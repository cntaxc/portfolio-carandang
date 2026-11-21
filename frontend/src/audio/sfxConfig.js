// =============================================================================
// Sound effects: the one place to assign your SFX files.
//
// 1. Put the audio files in  frontend/public/sfx/  (mp3, ogg, wav or m4a).
// 2. Set each `src` below to its public path, e.g. '/sfx/hover.mp3'.
//    Leave `src` empty ('') to keep that sound silent.
// 3. Tune `volume` per sound (0 to 1); SFX_MASTER_VOLUME scales them all.
//
// Nothing is requested while `src` is empty, and a missing or broken file
// is skipped quietly (no console errors), so it's safe to ship as-is.
// =============================================================================

export const SFX_ENABLED = true;

// Overall loudness for every sound effect (0 to 1).
export const SFX_MASTER_VOLUME = 0.6;

// Minimum time between two hover sounds, so sweeping the mouse across a
// list doesn't machine-gun the effect.
export const SFX_HOVER_COOLDOWN_MS = 70;

export const SFX_SOUNDS = {
  // Pointer moves onto any button or link on the site.
  hover: { src: '/sfx/button_hover.mp3', volume: 0.9 },
  // Any button or link is pressed (mouse, tap or keyboard).
  click: { src: '/sfx/button_click.mp3', volume: 0.9 },
  // The Quick actions "Sound effects" switch is turned ON.
  enabled: { src: '/sfx/on-sfx-notification.mp3', volume: 0.9 },
};

// What counts as a "button" for the site-wide hover / click sounds. Add
// data-sfx="none" to an element (or a parent) to keep it silent.
export const SFX_TARGETS =
  'button, a[href], [role="button"], [role="switch"], [role="tab"], summary, input[type="submit"], input[type="button"]';
