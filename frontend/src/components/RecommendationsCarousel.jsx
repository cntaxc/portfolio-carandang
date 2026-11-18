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

function RecommendationCards({
  recommendations,
  duplicated,
  onViewRecommendations,
}) {
  return recommendations.map((recommendation) => {
    const isLong = recommendation.message.length > 100;

    return (
      <blockquote
        className="recommendation-card about-recommendation-card"
        key={`${recommendation.id}${duplicated ? '-duplicate' : ''}`}
      >
        <div className="recommendation-card__quote-mark" aria-hidden="true">
          “
        </div>
        <p className="recommendation-card__message about-recommendation-card__message">
          {recommendation.message}
        </p>
        {isLong ? (
          <a
            className="about-recommendation-card__more"
            href="#recommendation"
            tabIndex={duplicated ? -1 : undefined}
            onClick={(event) => {
              if (onViewRecommendations) {
                event.preventDefault();
                onViewRecommendations();
              }
            }}
          >
            See more...
          </a>
        ) : null}
        <footer className="recommendation-card__footer">
          <span className="recommendation-card__avatar" aria-hidden="true">
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
          </span>
        </footer>
      </blockquote>
    );
  });
}

export default function RecommendationsCarousel({ onViewRecommendations }) {
  const { isLoading, recommendations } = useRecommendations();

  return (
    <section
      className="about-recommendations"
      aria-labelledby="about-recommendations-title"
    >
      <div className="about-recommendations__header">
        <h3 id="about-recommendations-title">Recommendations</h3>
        <a
          className="about-recommendations__cta"
          href="#recommendation"
          onClick={(event) => {
            if (onViewRecommendations) {
              event.preventDefault();
              onViewRecommendations();
            }
          }}
        >
          <span>Recommend Christian</span>
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </a>
      </div>
      {recommendations.length ? (
        <div
          className="about-recommendations__viewport"
          role="region"
          aria-label="Recommendation carousel"
        >
          <div className="about-recommendations__track">
            <div className="about-recommendations__set">
              <RecommendationCards
                recommendations={recommendations}
                duplicated={false}
                onViewRecommendations={onViewRecommendations}
              />
            </div>
            <div className="about-recommendations__set" aria-hidden="true">
              <RecommendationCards
                recommendations={recommendations}
                duplicated
                onViewRecommendations={onViewRecommendations}
              />
            </div>
          </div>
        </div>
      ) : isLoading ? null : (
        <div className="about-recommendations__empty">
          <i className="ri-chat-quote-line" aria-hidden="true"></i>
          <p>{EMPTY_RECOMMENDATIONS_MESSAGE}</p>
        </div>
      )}
    </section>
  );
}
