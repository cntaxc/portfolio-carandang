import { useEffect, useState } from 'react';

const DEFAULTS = {
  typeDelay: 95, // ms per typed character
  deleteDelay: 45, // ms per deleted character
  holdTyped: 1800, // pause once a word is fully typed
  holdEmpty: 450, // pause once a word is fully deleted
};

/**
 * Typewriter loop: types a word, holds, backspaces it, then moves on to the
 * next word in `words`, repeating forever. With a single word it simply
 * retypes that word. When `enabled` is false (e.g. reduced motion) the first
 * word is returned in full and nothing animates.
 *
 * Returns the currently visible text.
 */
export default function useTypewriter(words, { enabled = true, ...timing } = {}) {
  const { typeDelay, deleteDelay, holdTyped, holdEmpty } = { ...DEFAULTS, ...timing };
  const wordsKey = words.join('\u0000');
  const [wordIndex, setWordIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Start over if the list of words changes.
  useEffect(() => {
    setWordIndex(0);
    setLength(0);
    setIsDeleting(false);
  }, [wordsKey]);

  const word = words[wordIndex % words.length] || '';

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const isFullyTyped = !isDeleting && length >= word.length;
    const isFullyDeleted = isDeleting && length <= 0;
    let delay = isDeleting ? deleteDelay : typeDelay;
    if (isFullyTyped) {
      delay = holdTyped;
    } else if (isFullyDeleted) {
      delay = holdEmpty;
    }

    const timer = window.setTimeout(() => {
      if (isFullyTyped) {
        setIsDeleting(true);
      } else if (isFullyDeleted) {
        setIsDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
      } else {
        setLength((current) => current + (isDeleting ? -1 : 1));
      }
    }, delay);

    return () => window.clearTimeout(timer);
    // `words` is tracked through wordsKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isDeleting, length, word, wordsKey, typeDelay, deleteDelay, holdTyped, holdEmpty]);

  return enabled ? word.slice(0, length) : words[0] || '';
}
