import { useState } from 'react';
import { useRecommendations } from '../context/RecommendationsContext';

const RECOMMENDATIONS_ENDPOINT = '/api/recommendations';
const REQUEST_TIMEOUT_MS = 15000;
const validationRules = [
  { field: 'name', label: 'your name', maxLength: 100 },
  { field: 'organization', label: 'your organization', maxLength: 120 },
  {
    field: 'context',
    label: 'your work or project context',
    maxLength: 160,
  },
  { field: 'message', label: 'your recommendation', maxLength: 2000 },
];

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
      context: String(formData.get('context') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };
    const validationError = validateFields(fields);

    if (validationError) {
      setFeedback({
        tone: 'error',
        message: validationError.message,
      });
      const field = form.elements.namedItem(validationError.field);
      field?.focus?.();
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
        setFeedback({
          tone: 'success',
          message: 'Thank you! Your recommendation has been published.',
        });
        form.reset();
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
        <label className="recommendation-form__field recommendation-form__field--wide">
          <span>Work / Project Context</span>
          <input
            name="context"
            type="text"
            maxLength="160"
            placeholder="How we worked together"
            required
          />
        </label>
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
