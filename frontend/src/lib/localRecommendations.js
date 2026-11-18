// Browser-only fallback for recommendations.
//
// When the recommendations API isn't reachable (for example on the static
// Vercel deployment, which has no backend), submissions are saved in this
// browser's localStorage under STORAGE_KEY and shown from there, instead of
// showing an error. These entries are visible only on the device that
// submitted them.

export const STORAGE_KEY = 'portfolio_recommendations';

// Status codes that mean "there is no working API here", as opposed to a
// real answer from the backend (400 validation, 422 profanity, 429 rate limit).
const UNAVAILABLE_STATUSES = new Set([404, 405, 500, 501, 502, 503, 504]);

const FIELDS = ['id', 'author', 'organization', 'context', 'message', 'publishedAt'];

function isValidRecommendation(value) {
  return (
    value &&
    typeof value === 'object' &&
    FIELDS.every(
      (field) => typeof value[field] === 'string' && value[field].trim()
    )
  );
}

// True when a fetch Response didn't come from a working recommendations API:
// a "missing/unsupported/unavailable" status, or a non-JSON body (static hosts
// often answer unknown paths with the site's index.html).
export function isApiUnavailable(response) {
  if (UNAVAILABLE_STATUSES.has(response.status)) {
    return true;
  }
  const contentType = response.headers.get('content-type') || '';
  return !contentType.includes('application/json');
}

export function sortNewestFirst(recommendations) {
  return recommendations
    .slice()
    .sort((first, second) =>
      String(second.publishedAt).localeCompare(String(first.publishedAt))
    );
}

// localStorage can throw (private mode, blocked storage); never let that break
// the page.
export function loadLocalRecommendations() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed)
      ? sortNewestFirst(parsed.filter(isValidRecommendation))
      : [];
  } catch (error) {
    return [];
  }
}

function writeLocalRecommendations(recommendations) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recommendations));
    return true;
  } catch (error) {
    console.warn('Recommendations could not be saved in this browser.', error);
    return false;
  }
}

function createId() {
  if (window.crypto?.randomUUID) {
    return `local-${window.crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Builds a recommendation from the form fields and saves it locally.
// Returns the saved record (it is still returned if storage is unavailable,
// so it can be shown for the rest of the visit).
export function saveLocalRecommendation(fields) {
  const recommendation = {
    id: createId(),
    author: fields.name,
    organization: fields.organization,
    context: fields.context,
    message: fields.message,
    publishedAt: new Date().toISOString(),
  };
  writeLocalRecommendations([recommendation, ...loadLocalRecommendations()]);
  return recommendation;
}

// Server results plus any entries saved only in this browser.
export function mergeWithLocal(serverRecommendations) {
  const serverIds = new Set(serverRecommendations.map((item) => item.id));
  return sortNewestFirst([
    ...serverRecommendations,
    ...loadLocalRecommendations().filter((item) => !serverIds.has(item.id)),
  ]);
}
