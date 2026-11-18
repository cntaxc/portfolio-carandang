import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// True when the visitor asked their OS/browser to minimise motion. Updates
// live if the setting changes.
export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
