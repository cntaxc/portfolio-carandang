import { useCallback, useEffect, useRef, useState } from 'react';

// Likes on the free assets, backed by /api/likes.
// The visitor gets an anonymous random id (kept in localStorage) so the server
// can allow one like per visitor per asset. If the API isn't reachable (for
// example the production Docker/Nginx stack), likes still toggle locally and
// counts are hidden.

const ENDPOINT = '/api/likes';
const VISITOR_KEY = 'asset-likes-visitor';
const LOCAL_LIKES_KEY = 'asset-likes-local';
const TIMEOUT_MS = 8000;

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

let sessionVisitorId = null;
function getVisitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId();
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (error) {
    sessionVisitorId = sessionVisitorId || randomId();
    return sessionVisitorId;
  }
}

function readLocalLikes() {
  try {
    const value = JSON.parse(window.localStorage.getItem(LOCAL_LIKES_KEY) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch (error) {
    return new Set();
  }
}

function saveLocalLikes(liked) {
  try {
    window.localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify([...liked]));
  } catch (error) {
    // Storage blocked: the like still shows until the page is closed.
  }
}

async function request(url, options) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error(`Likes request failed (${response.status})`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * @returns {{ counts: Record<string, number>, liked: Set<string>,
 *   status: 'loading' | 'online' | 'offline', pending: Set<string>,
 *   toggle: (assetId: string) => void }}
 */
export default function useAssetLikes() {
  const [counts, setCounts] = useState({});
  const [liked, setLiked] = useState(readLocalLikes);
  const [status, setStatus] = useState('loading');
  const [pending, setPending] = useState(() => new Set());
  const likedRef = useRef(liked);
  likedRef.current = liked;
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    let cancelled = false;
    request(`${ENDPOINT}?visitor=${encodeURIComponent(getVisitorId())}`)
      .then((result) => {
        if (cancelled) return;
        setCounts(result.counts || {});
        const serverLiked = new Set(result.liked || []);
        setLiked(serverLiked);
        saveLocalLikes(serverLiked);
        setStatus('online');
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((assetId) => {
    const wasLiked = likedRef.current.has(assetId);
    const nextLiked = !wasLiked;

    const apply = (isLiked, countChange) => {
      setLiked((current) => {
        const next = new Set(current);
        if (isLiked) next.add(assetId);
        else next.delete(assetId);
        saveLocalLikes(next);
        return next;
      });
      if (countChange) {
        setCounts((current) => ({
          ...current,
          [assetId]: Math.max(0, (current[assetId] || 0) + countChange),
        }));
      }
    };

    // Optimistic update; the server's count replaces it when it answers.
    apply(nextLiked, statusRef.current === 'online' ? (nextLiked ? 1 : -1) : 0);
    if (statusRef.current !== 'online') return;

    setPending((current) => new Set(current).add(assetId));
    request(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, visitorId: getVisitorId(), liked: nextLiked }),
    })
      .then((result) => {
        setCounts((current) => ({ ...current, [assetId]: result.count }));
      })
      .catch(() => {
        apply(wasLiked, nextLiked ? -1 : 1); // roll back
      })
      .finally(() => {
        setPending((current) => {
          const next = new Set(current);
          next.delete(assetId);
          return next;
        });
      });
  }, []);

  return { counts, liked, status, pending, toggle };
}
