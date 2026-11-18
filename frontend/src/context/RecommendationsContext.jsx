import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const RecommendationsContext = createContext(null);

export const EMPTY_RECOMMENDATIONS_MESSAGE =
  "There's no recommendations yet. Be the first to share your feedback!";
// "Lead Developer at Studio X". Older entries have no role: organization only.
export function formatAffiliation({ role, organization } = {}) {
  return [role, organization].filter(Boolean).join(' at ');
}

const REFRESH_INTERVAL_MS = 60000;

export function RecommendationsProvider({ children }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const publishRecommendation = useCallback((recommendation) => {
    if (!recommendation?.id) {
      return;
    }

    requestIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRecommendations((current) => [
      recommendation,
      ...current.filter((item) => item.id !== recommendation.id),
    ]);
    setError('');
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch('/api/recommendations', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !Array.isArray(result?.recommendations)) {
        throw new Error(
          result?.error || 'Recommendations could not be loaded.'
        );
      }

      setRecommendations(result.recommendations);
      setError('');
    } catch (requestError) {
      if (
        requestId !== requestIdRef.current ||
        requestError?.name === 'AbortError'
      ) {
        return;
      }

      console.error('Recommendations could not be loaded:', requestError);
      setError(
        'We could not load recommendations right now. Please try again shortly.'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    }
  }, []);

  useEffect(() => {
    refresh();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    const intervalId = window.setInterval(
      refreshWhenVisible,
      REFRESH_INTERVAL_MS
    );

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      error,
      isLoading,
      publishRecommendation,
      recommendations,
      refresh,
    }),
    [error, isLoading, publishRecommendation, recommendations, refresh]
  );

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);

  if (!context) {
    throw new Error(
      'useRecommendations must be used within a RecommendationsProvider.'
    );
  }

  return context;
}
