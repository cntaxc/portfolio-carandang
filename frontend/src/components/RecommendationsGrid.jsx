import {
  EMPTY_RECOMMENDATIONS_MESSAGE,
  useRecommendations,
} from '../context/RecommendationsContext';

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatPublishedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function RecommendationsGrid() {
  const { error, isLoading, recommendations } = useRecommendations();

  return (
    <section
      id="published-recommendations"
      className="recommendations-section"
      aria-labelledby="recommendations-title"
    >
      <div className="recommendations-section__heading">
        <p className="split-section__eyebrow">Kind words</p>
        <h2 id="recommendations-title">Published recommendations</h2>
      </div>

      {recommendations.length ? (
        <div className="recommendations__group is-grid">
          {recommendations.map((recommendation) => {
            const publishedDate = formatPublishedDate(
              recommendation.publishedAt
            );

            return (
              <blockquote
                className="recommendation-card"
                key={recommendation.id}
              >
                <div
                  className="recommendation-card__quote-mark"
                  aria-hidden="true"
                >
                  “
                </div>
                <p className="recommendation-card__message">
                  {recommendation.message}
                </p>
                <footer className="recommendation-card__footer">
                  <span
                    className="recommendation-card__avatar"
                    aria-hidden="true"
                  >
                    {getInitials(recommendation.author)}
                  </span>
                  <span className="recommendation-card__author">
                    <span className="recommendation-card__name">
                      <strong>{recommendation.author}</strong>
                      {recommendation.role ? (
                        <span className="recommendation-card__position">
                          {recommendation.role}
                        </span>
                      ) : null}
                    </span>
                    <span className="recommendation-card__role">
                      {recommendation.organization}
                    </span>
                    <span className="recommendation-card__meta">
                      <span className="recommendation-card__context">
                        {recommendation.context}
                      </span>
                      {publishedDate ? (
                        <time
                          className="recommendation-card__date"
                          dateTime={recommendation.publishedAt}
                        >
                          {publishedDate}
                        </time>
                      ) : null}
                    </span>
                  </span>
                </footer>
              </blockquote>
            );
          })}
        </div>
      ) : (
        <div
          className="recommendations__empty"
          role={isLoading ? 'status' : undefined}
        >
          <i className="ri-chat-quote-line" aria-hidden="true"></i>
          <p>
            {isLoading
              ? 'Loading recommendations...'
              : error || EMPTY_RECOMMENDATIONS_MESSAGE}
          </p>
        </div>
      )}
    </section>
  );
}
