import { useEffect, useRef, useState } from 'react';
import { about, floatingActions } from '../../data/portfolio';

const emailAddress = about.mailUrl.replace(/^mailto:/, '');
const web3FormsAccessKey = (
  process.env.REACT_APP_WEB3FORMS_ACCESS_KEY || ''
).trim();
const socialLinks = floatingActions.actions.filter(
  (action) => action.id === 'linkedin' || action.id === 'github'
);

export default function ContactSection({ onAskAssistant }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [sendState, setSendState] = useState('idle');
  const resetTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
    },
    []
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopyStatus('Email address copied.');
    } catch (error) {
      console.error('Unable to copy the email address.', error);
      setCopyStatus('Could not copy the email address. Please copy it manually.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sendState !== 'idle') {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '')
      .replace(/\s+/g, ' ')
      .trim();
    const message = String(formData.get('message') || '').trim();

    window.clearTimeout(resetTimer.current);

    if (!web3FormsAccessKey) {
      console.error(
        'Contact form submission failed: REACT_APP_WEB3FORMS_ACCESS_KEY is missing. Add it to .env.local and restart the development server.'
      );
      setFormStatus(
        'Unable to send your message right now. Please try again later.'
      );
      return;
    }

    setSendState('sending');
    setFormStatus('Sending your message...');

    try {
      const payload = new FormData();
      payload.set('access_key', web3FormsAccessKey);
      payload.set('name', name);
      payload.set('email', email);
      payload.set('subject', subject);
      payload.set('from_name', name);
      payload.set('message', message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Web3Forms request failed with status ${response.status}.`
        );
      }

      form.reset();
      setSendState('done');
      setFormStatus(
        'Message sent successfully! I will get back to you soon.'
      );
      resetTimer.current = window.setTimeout(() => {
        setSendState('idle');
        setFormStatus('');
      }, 5000);
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setSendState('idle');
      setFormStatus('Unable to send your message right now. Please try again later.');
    }
  };

  return (
    <section
      id="contact"
      className="section contact-section"
      aria-labelledby="contact-title"
      data-reveal
    >
      <div className="contact-section__content">
        <header className="contact-section__header">
          <p className="contact-section__eyebrow">
            <span>CONTACT</span>
          </p>
          <h2 id="contact-title">
            Let&apos;s build
            <br />
            <span>something.</span>
          </h2>
          <p className="contact-section__intro">
            Have a role, a project or just a question? Send a message and
            I&apos;ll reply as soon as I can.
          </p>
        </header>

        <nav className="contact-links" aria-label="Contact and social links">
          <div className="contact-links__group">
            <button
              type="button"
              className="contact-social-link"
              onClick={copyEmail}
              aria-label={`Copy email address ${emailAddress}`}
            >
              <i className="ri-mail-line" aria-hidden="true"></i>
              <span>{emailAddress}</span>
              <i className="ri-file-copy-line" aria-hidden="true"></i>
            </button>
            {socialLinks.map((link) => (
              <a
                key={link.id}
                className="contact-social-link"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <i className={link.icon} aria-hidden="true"></i>
                <span>{link.label}</span>
                <i className="ri-arrow-up-right-line" aria-hidden="true"></i>
              </a>
            ))}
            <a
              className="contact-social-link"
              href="#aichatbot"
              onClick={(event) => {
                event.preventDefault();
                onAskAssistant();
              }}
            >
              <i className="ri-sparkling-2-line" aria-hidden="true"></i>
              <span>AI assistant</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </a>
          </div>
          <p className="contact-section__status" role="status" aria-live="polite">
            {copyStatus}
          </p>
        </nav>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__row">
            <label className="contact-form__field">
              <span>01 / NAME</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                maxLength="100"
                required
              />
            </label>
            <label className="contact-form__field">
              <span>02 / EMAIL</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                maxLength="254"
                required
              />
            </label>
          </div>
          <label className="contact-form__field">
            <span>03 / SUBJECT</span>
            <input
              name="subject"
              type="text"
              placeholder="What would you like to discuss?"
              maxLength="160"
              required
            />
          </label>
          <label className="contact-form__field contact-form__field--message">
            <span>04 / MESSAGE</span>
            <textarea
              name="message"
              rows="3"
              placeholder="Tell me a little about it..."
              maxLength="4000"
              required
            ></textarea>
          </label>
          <div className="contact-form__actions">
            <button
              type="submit"
              disabled={sendState !== 'idle'}
              aria-busy={sendState === 'sending'}
              aria-live="polite"
            >
              <span>
                {sendState === 'done'
                  ? 'Done!'
                  : sendState === 'sending'
                    ? 'Sending...'
                    : 'Send message'}
              </span>
              {sendState === 'done' ? (
                <i className="ri-check-line" aria-hidden="true"></i>
              ) : sendState === 'sending' ? (
                <i
                  className="ri-loader-4-line contact-form__spinner"
                  aria-hidden="true"
                ></i>
              ) : (
                <i className="ri-send-plane-line" aria-hidden="true"></i>
              )}
            </button>
          </div>
        </form>
        <p
          className="contact-form__status"
          role="status"
          aria-live="polite"
        >
          {formStatus}
        </p>
      </div>
    </section>
  );
}
