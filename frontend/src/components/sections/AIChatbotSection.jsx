import { Fragment, useEffect, useRef, useState } from 'react';

const CHAT_ENDPOINT = '/api/chat';
const REQUEST_TIMEOUT_MS = 30000;
const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY = 10; // turns sent to the server (it keeps the same limit)
const FALLBACK_ERROR =
  'AI is currently unavailable. Please try again later, or contact Christian directly.';

const suggestions = [
  'Who is Christian?',
  'What did he study?',
  'What are his strongest skills?',
  'How can I contact him?',
];

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
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const controllerRef = useRef(null);

  // Abort an in-flight answer if the section unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  // Keep the newest message in view while answers stream in.
  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages]);

  const updateLastMessage = (patch) =>
    setMessages((current) => {
      const next = current.slice();
      next[next.length - 1] = { ...next[next.length - 1], ...patch };
      return next;
    });

  const ask = async (rawQuestion) => {
    const text = rawQuestion.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!text || isSending) {
      return;
    }

    const history = messages
      .filter((message) => !message.error && message.content)
      .map(({ role, content }) => ({ role, content }));
    const outgoing = [...history, { role: 'user', content: text }].slice(-MAX_HISTORY);

    setQuestion('');
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { role: 'user', content: text },
      { role: 'assistant', content: '', pending: true },
    ]);

    const controller = new AbortController();
    controllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outgoing }),
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('text/plain') || !response.body) {
        const result = contentType.includes('application/json')
          ? await response.json().catch(() => null)
          : null;
        updateLastMessage({ content: result?.error || FALLBACK_ERROR, pending: false, error: true });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        updateLastMessage({ content: answer, pending: false });
      }
      answer += decoder.decode();
      updateLastMessage({
        content: answer || FALLBACK_ERROR,
        pending: false,
        error: !answer,
      });
    } catch (error) {
      if (error?.name === 'AbortError' && controllerRef.current !== controller) {
        return; // conversation was cleared
      }
      updateLastMessage({
        content:
          error?.name === 'AbortError'
            ? 'The assistant took too long to respond. Please try again.'
            : FALLBACK_ERROR,
        pending: false,
        error: true,
      });
    } finally {
      window.clearTimeout(timeoutId);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsSending(false);
      }
    }
  };

  const clearConversation = () => {
    const controller = controllerRef.current;
    controllerRef.current = null;
    controller?.abort();
    setMessages([]);
    setIsSending(false);
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
          I&apos;m an AI assistant that answers questions about Christian&apos;s
          work, skills, and background, based on this portfolio.
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
              onClick={() => ask(suggestion)}
              disabled={isSending}
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
                  className={`ai-chatbot__message ai-chatbot__message--${message.role}${
                    message.error ? ' is-error' : ''
                  }`}
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
            disabled={!question.trim() || isSending}
          >
            <i
              className={isSending ? 'ri-loader-4-line ai-chatbot__spinner' : 'ri-arrow-up-line'}
              aria-hidden="true"
            ></i>
          </button>
        </form>
        <p className="ai-chatbot__note">
          Answers are generated by AI from Christian&apos;s portfolio and may not
          be perfect. For anything important, contact him directly.
        </p>
      </div>
    </section>
  );
}
