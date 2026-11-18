import { Fragment, useEffect, useRef, useState } from 'react';
import {
  answerQuestion,
  ASSISTANT_SUGGESTIONS,
} from '../../assistant/portfolioAssistant';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const MAX_QUESTION_LENGTH = 500;
const THINKING_MS = 450; // short pause so the reply doesn't feel abrupt
const WORD_INTERVAL_MS = 18; // answer is revealed word by word

// Turns URLs and email addresses in an answer into links.
const LINK_PATTERN = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function MessageText({ text }) {
  return text.split(LINK_PATTERN).map((part, index) => {
    if (index % 2 === 0) {
      return <Fragment key={index}>{part}</Fragment>;
    }
    const clean = part.replace(/[.,;:!?]+$/, '');
    const trailing = part.slice(clean.length);
    const isEmail = !clean.startsWith('http');
    return (
      <Fragment key={index}>
        <a
          href={isEmail ? `mailto:${clean}` : clean}
          target={isEmail ? undefined : '_blank'}
          rel={isEmail ? undefined : 'noreferrer'}
        >
          {clean}
        </a>
        {trailing}
      </Fragment>
    );
  });
}

export default function AIChatbotSection() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const timersRef = useRef([]);
  const contextRef = useRef({});

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Stop any reply in progress if the section unmounts.
  useEffect(() => clearTimers, []);

  // Keep the newest message in view while answers appear.
  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages]);

  const setLastMessage = (patch) =>
    setMessages((current) => {
      const next = current.slice();
      next[next.length - 1] = { ...next[next.length - 1], ...patch };
      return next;
    });

  const ask = (rawQuestion) => {
    const text = rawQuestion.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!text || isAnswering) {
      return;
    }

    const answer = answerQuestion(text, contextRef.current);
    contextRef.current = answer.context;

    setQuestion('');
    setIsAnswering(true);
    setMessages((current) => [
      ...current,
      { role: 'user', content: text },
      { role: 'assistant', content: '', pending: true },
    ]);

    const finish = () => {
      setLastMessage({ content: answer.text, pending: false });
      setIsAnswering(false);
    };

    if (prefersReducedMotion) {
      finish();
      return;
    }

    // Reveal the answer word by word, keeping line breaks.
    const words = answer.text.split(/(\s+)/);
    const schedule = (callback, delay) => {
      timersRef.current.push(window.setTimeout(callback, delay));
    };
    schedule(() => {
      let shown = 0;
      const step = () => {
        shown = Math.min(words.length, shown + 2);
        if (shown >= words.length) {
          finish();
          return;
        }
        setLastMessage({ content: words.slice(0, shown).join(''), pending: false });
        schedule(step, WORD_INTERVAL_MS);
      };
      step();
    }, THINKING_MS);
  };

  const clearConversation = () => {
    clearTimers();
    contextRef.current = {};
    setMessages([]);
    setIsAnswering(false);
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
          I&apos;m an assistant that answers questions about Christian&apos;s
          work, skills, and background, based on this portfolio.
        </p>

        <div
          className="ai-chatbot__suggestions"
          role="group"
          aria-label="Quick questions"
        >
          {ASSISTANT_SUGGESTIONS.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => ask(suggestion)}
              disabled={isAnswering}
            >
              <span aria-hidden="true">—</span>
              {suggestion}
            </button>
          ))}
        </div>

        {messages.length ? (
          <div className="ai-chatbot__conversation">
            <ol
              className="ai-chatbot__log"
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.map((message, index) => (
                <li
                  key={index}
                  className={`ai-chatbot__message ai-chatbot__message--${message.role}`}
                >
                  <span className="sr-only">
                    {message.role === 'user' ? 'You:' : 'Assistant:'}
                  </span>
                  {message.pending ? (
                    <span className="ai-chatbot__typing" aria-label="Assistant is typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : (
                    <MessageText text={message.content} />
                  )}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="ai-chatbot__clear"
              onClick={clearConversation}
            >
              <i className="ri-refresh-line" aria-hidden="true"></i>
              New conversation
            </button>
          </div>
        ) : null}

        <form
          className="ai-chatbot__form"
          onSubmit={(event) => {
            event.preventDefault();
            ask(question);
          }}
        >
          <label className="sr-only" htmlFor="ai-chatbot-input">
            Ask a question
          </label>
          <input
            id="ai-chatbot-input"
            ref={inputRef}
            type="text"
            value={question}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Tell me about..."
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Submit question"
            disabled={!question.trim() || isAnswering}
          >
            <i className="ri-arrow-up-line" aria-hidden="true"></i>
          </button>
        </form>
        <p className="ai-chatbot__note">
          Answers come from the information in Christian&apos;s portfolio. For
          anything else, contact him directly.
        </p>
      </div>
    </section>
  );
}
