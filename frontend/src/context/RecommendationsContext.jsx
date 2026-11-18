import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  isApiUnavailable,
  loadLocalRecommendations,
  mergeWithLocal,
} from '../lib/localRecommendations';

const RecommendationsContext = createContext(null);

export const EMPTY_RECOMMENDATIONS_MESSAGE =
  "There's no recommendations yet. Be the first to share your feedback!";
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
      const result = isApiUnavailable(response)
        ? null
        : await response.json().catch(() => null);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !Array.isArray(result?.recommendations)) {
        // No working API (e.g. the static Vercel deployment): show the
        // recommendations saved in this browser instead of an error.
        setRecommendations(loadLocalRecommendations());
        setError('');
        return;
      }

      setRecommendations(mergeWithLocal(result.recommendations));
      setError('');
    } catch (requestError) {
      if (
        requestId !== requestIdRef.current ||
        requestError?.name === 'AbortError'
      ) {
        return;
      }

      // Network failure: fall back to this browser's saved recommendations.
      setRecommendations(loadLocalRecommendations());
      setError('');
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
