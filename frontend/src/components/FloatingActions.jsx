import { floatingActions } from '../data/portfolio';

export default function FloatingActions({ onOpenChat, onOpenContact }) {
  return (
    <div className="floating-actions">
      <button
        type="button"
        className="chatbot-trigger"
        onClick={onOpenChat}
        aria-label="Open portfolio chatbot"
        title="Ask the AI assistant"
      >
        <span>R</span>
      </button>
      <nav
        className="floating-actions__links"
        aria-label="Contact and profile links"
      >
        {floatingActions.actions.map((action) => {
          const isPlaceholder = action.url === '#';

          if (action.id === 'contact') {
            return (
              <button
                key={action.id}
                type="button"
                className="floating-actions__link"
                title={action.label}
                aria-label={action.label}
                onClick={onOpenContact}
              >
                <i className={action.icon} aria-hidden="true"></i>
              </button>
            );
          }

          return (
            <a
              key={action.id}
              href={action.url}
              className="floating-actions__link"
              title={action.label}
              aria-label={action.label}
              aria-disabled={isPlaceholder ? 'true' : undefined}
              tabIndex={isPlaceholder ? -1 : 0}
              onClick={(event) => {
                if (isPlaceholder) {
                  event.preventDefault();
                }
              }}
            >
              <i className={action.icon} aria-hidden="true"></i>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
