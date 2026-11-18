import { useEffect, useRef, useState } from 'react';
import { useRecommendations } from '../context/RecommendationsContext';

const RECOMMENDATIONS_ENDPOINT = '/api/recommendations';
const REQUEST_TIMEOUT_MS = 15000;
const SUCCESS_MESSAGE = 'Thank you! Your recommendation has been published.';
const validationRules = [
  { field: 'name', label: 'your name', maxLength: 100 },
  { field: 'organization', label: 'your organization', maxLength: 120 },
  { field: 'message', label: 'your recommendation', maxLength: 2000 },
];

// "Where did we work together?" options (multi-select). The selection is
// sent as the existing `context` text field, e.g. "Hackathon, Team Projects".
const CONTEXT_OPTIONS = [
  'Organization',
  'Collaborative Projects',
  'Hackathon',
  'Team Projects',
  'Others',
];
const OTHER_OPTION = 'Others';
const OTHER_MAX_LENGTH = 80;
const CONTEXT_MAX_LENGTH = 160;

// Selected options in display order; "Others" is replaced by the typed text.
function buildContext(selected, otherText) {
  return CONTEXT_OPTIONS.filter((option) => selected.includes(option))
    .map((option) => (option === OTHER_OPTION ? otherText.trim() : option))
    .filter(Boolean)
    .join(', ');
}

function validateContext(selected, otherText) {
  if (!selected.length) {
    return {
      field: 'context',
      message: 'Please choose where we worked together.',
    };
  }
  if (selected.includes(OTHER_OPTION) && !otherText.trim()) {
    return {
      field: 'contextOther',
      message: 'Please describe where we worked together.',
    };
  }
  if (buildContext(selected, otherText).length > CONTEXT_MAX_LENGTH) {
    return {
      field: 'contextOther',
      message: 'Please shorten where we worked together.',
    };
  }
  return null;
}

function validateFields(fields) {
  const missingField = validationRules.find(({ field }) => !fields[field]);

  if (missingField) {
    return {
      field: missingField.field,
      message: `Please enter ${missingField.label}.`,
    };
  }

  const invalidLength = validationRules.find(
    ({ field, maxLength }) => fields[field].length > maxLength
  );

  if (invalidLength) {
    return {
      field: invalidLength.field,
      message: `Please keep ${invalidLength.label} under ${invalidLength.maxLength} characters.`,
    };
  }

  return null;
}

export default function RecommendationSubmissionForm() {
  const { publishRecommendation, refresh } = useRecommendations();
  const [feedback, setFeedback] = useState({
    tone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState([]);
  const [otherContext, setOtherContext] = useState('');
  const firstContextButtonRef = useRef(null);
  const otherInputRef = useRef(null);
  const focusOtherOnOpen = useRef(false);
  const isOtherSelected = selectedContexts.includes(OTHER_OPTION);

  // Move the cursor into the "Others" field as soon as it opens.
  useEffect(() => {
    if (isOtherSelected && focusOtherOnOpen.current) {
      focusOtherOnOpen.current = false;
      otherInputRef.current?.focus();
    }
  }, [isOtherSelected]);

  const toggleContext = (option) => {
    if (option === OTHER_OPTION && !selectedContexts.includes(option)) {
      focusOtherOnOpen.current = true;
    }
    // A previous "please choose…" error no longer applies once they pick.
    if (feedback.tone === 'error') {
      setFeedback({ tone: '', message: '' });
    }
    setSelectedContexts((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = {
      name: String(formData.get('name') || '').trim(),
      organization: String(formData.get('organization') || '').trim(),
      context: buildContext(selectedContexts, otherContext),
      message: String(formData.get('message') || '').trim(),
    };
    const validationError =
      validateFields(fields) || validateContext(selectedContexts, otherContext);

    if (validationError) {
      setFeedback({
        tone: 'error',
        message: validationError.message,
      });
      if (validationError.field === 'context') {
        firstContextButtonRef.current?.focus();
      } else if (validationError.field === 'contextOther') {
        otherInputRef.current?.focus();
      } else {
        form.elements.namedItem(validationError.field)?.focus?.();
      }
      return;
    }

    setIsSubmitting(true);
    setFeedback({ tone: '', message: '' });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(RECOMMENDATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(fields),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);

      if (response.ok) {
        if (result?.recommendation?.id) {
          publishRecommendation(result.recommendation);
        } else {
          refresh();
        }
        setFeedback({ tone: 'success', message: SUCCESS_MESSAGE });
        form.reset();
        setSelectedContexts([]);
        setOtherContext('');
        return;
      }

      const apiMessage = result?.error;

      if (response.status === 429) {
        setFeedback({
          tone: 'error',
          message:
            apiMessage ||
            'Too many recommendations were sent recently. Please try again later.',
        });
        return;
      }

      if ((response.status === 400 || response.status === 422) && apiMessage) {
        setFeedback({
          tone: 'error',
          message: apiMessage,
        });
        return;
      }

      console.error('Recommendation submission failed:', {
        status: response.status,
        result,
      });
      setFeedback({
        tone: 'error',
        message:
          'We could not send your recommendation right now. Please try again.',
      });
    } catch (error) {
      console.error('Recommendation submission failed:', error);
      setFeedback({
        tone: 'error',
        message:
          error?.name === 'AbortError'
            ? 'The recommendation service took too long to respond. Please try again.'
            : 'We could not reach the recommendation service. Please check your connection and try again.',
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="recommendation-form"
      className="recommendation-submission"
      aria-labelledby="recommendation-submission-title"
    >
      <div className="recommendation-submission__heading">
        <p className="split-section__eyebrow">Share feedback</p>
        <h2 id="recommendation-submission-title">
          Submit a Recommendation
        </h2>
        <p>
          Share your experience. Your recommendation is published immediately
          in the list below and in the About carousel.
        </p>
      </div>

      <form
        className="recommendation-form"
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={
          feedback.message ? 'recommendation-form-status' : undefined
        }
      >
        <label className="recommendation-form__field">
          <span>Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength="100"
            required
          />
        </label>
        <label className="recommendation-form__field">
          <span>Organization</span>
          <input
            name="organization"
            type="text"
            autoComplete="organization"
            maxLength="120"
            required
          />
        </label>
        <fieldset className="recommendation-form__field recommendation-form__field--wide recommendation-form__context">
          <legend>Where did we work together?</legend>
          <p className="recommendation-form__hint">Select all that apply.</p>
          <div className="context-options">
            {CONTEXT_OPTIONS.map((option, index) => {
              const isSelected = selectedContexts.includes(option);
              return (
                <button
                  key={option}
                  ref={index === 0 ? firstContextButtonRef : undefined}
                  type="button"
                  className={`context-option${isSelected ? ' is-selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => toggleContext(option)}
                >
                  <i
                    className={isSelected ? 'ri-check-line' : 'ri-add-line'}
                    aria-hidden="true"
                  ></i>
                  {option}
                </button>
              );
            })}
          </div>
          <div
            className={`context-other${isOtherSelected ? ' is-open' : ''}`}
            aria-hidden={!isOtherSelected}
          >
            <div className="context-other__inner">
              <label className="recommendation-form__field">
                <span>Tell us where</span>
                <input
                  ref={otherInputRef}
                  name="contextOther"
                  type="text"
                  value={otherContext}
                  onChange={(event) => setOtherContext(event.target.value)}
                  maxLength={OTHER_MAX_LENGTH}
                  placeholder="e.g. Internship, school club, freelance work"
                  disabled={!isOtherSelected}
                />
              </label>
            </div>
          </div>
        </fieldset>
        <label className="recommendation-form__field recommendation-form__field--wide">
          <span>Recommendation</span>
          <textarea
            name="message"
            rows="5"
            maxLength="2000"
            placeholder="Share your recommendation"
            required
          ></textarea>
        </label>
        <div className="recommendation-form__actions">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Publishing...
                <i
                  className="ri-loader-4-line recommendation-form__spinner"
                  aria-hidden="true"
                ></i>
              </>
            ) : (
              <>
                Publish recommendation
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </>
            )}
          </button>
          {feedback.message ? (
            <p
              id="recommendation-form-status"
              className={`recommendation-form__status${
                feedback.tone
                  ? ` recommendation-form__status--${feedback.tone}`
                  : ''
              }`}
              role="status"
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
