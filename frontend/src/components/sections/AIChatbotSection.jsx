import { useRef, useState } from 'react';

const suggestions = [
  'About Christian Carandang',
  'Education and background',
  'Skills and capabilities',
  'Connect and contact',
];

export default function AIChatbotSection() {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('');
  const inputRef = useRef(null);

  const submitQuestion = (event) => {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    setStatus(
      'AI is currently unavailable. Chat responses will not be reviewed for now.'
    );
  };

  const selectSuggestion = (suggestion) => {
    setQuestion(suggestion);
    setStatus('');
    inputRef.current?.focus();
  };

  return (
    <section id="aichatbot" className="section ai-chatbot" data-reveal>
      <div className="ai-chatbot__content">
        <span className="ai-chatbot__eyebrow">
          <i className="ri-sparkling-2-line" aria-hidden="true"></i>
          AI ASSISTANT
        </span>
        <h2>Ask me anything.</h2>
        <p className="ai-chatbot__intro">
          I&apos;m an AI trained to answer questions about Christian&apos;s work
          and background.
        </p>

        <div
          className="ai-chatbot__suggestions"
          role="group"
          aria-label="Quick questions"
        >
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => selectSuggestion(suggestion)}
            >
              <span aria-hidden="true">—</span>
              {suggestion}
            </button>
          ))}
        </div>

        <form className="ai-chatbot__form" onSubmit={submitQuestion}>
          <label className="sr-only" htmlFor="ai-chatbot-input">
            Ask a question
          </label>
          <input
            id="ai-chatbot-input"
            ref={inputRef}
            type="text"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setStatus('');
            }}
            placeholder="Tell me about..."
          />
          <button
            type="submit"
            aria-label="Submit question"
            disabled={!question.trim()}
          >
            <i className="ri-arrow-up-line" aria-hidden="true"></i>
          </button>
        </form>
        <p className="ai-chatbot__status" role="status" aria-live="polite">
          {status}
        </p>
      </div>
    </section>
  );
}
