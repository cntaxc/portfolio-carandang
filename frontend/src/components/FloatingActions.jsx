import { useEffect, useId, useRef, useState } from 'react';
import { floatingActions } from '../data/portfolio';
import { isSfxMuted, playSfx, setSfxMuted } from '../audio/sfx';
import '../styles/floating-actions.css';

const linkFor = (id) => floatingActions.actions.find((action) => action.id === id);

/**
 * Quick-actions menu (bottom-right). A compact button opens a labelled panel
 * above it: every action shows its name and a one-line description, grouped
 * into Connect, Resume, Play (Grapple) and Profiles. Closes after an action, on an outside
 * click, or with Escape; arrow keys move between actions.
 * Hover / click sounds come from the site-wide SFX (src/audio); the Sound
 * effects switch here mutes them and plays a notification when turned on.
 */
export default function FloatingActions({ onOpenChat, onOpenContact, onPlayGame }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(() => !isSfxMuted());
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const titleId = useId();

  const groups = [
    {
      title: 'Connect',
      items: [
        {
          id: 'ai',
          label: 'AI Assistant',
          hint: 'Ask about my work and skills',
          glyph: 'R',
          onSelect: onOpenChat,
        },
        {
          id: 'contact',
          label: 'Contact Form',
          hint: 'Send me a message',
          icon: 'ri-mail-line',
          onSelect: onOpenContact,
        },
      ],
    },
    {
      title: 'Resume',
      items: [
        {
          id: 'resume',
          label: 'Download Resume',
          hint: 'PDF copy of my CV',
          icon: 'ri-file-user-line',
          trailing: 'ri-download-2-line',
          href: linkFor('cv')?.url,
          download: true,
        },
      ],
    },
    {
      title: 'Play',
      items: [
        {
          id: 'grapple',
          label: 'Play Grapple',
          hint: 'Endless magnet-climbing mini-game',
          icon: 'ri-gamepad-line',
          onSelect: onPlayGame,
        },
      ],
    },
    {
      title: 'Profiles',
      items: [
        {
          id: 'github',
          label: 'GitHub',
          hint: 'Code and repositories',
          icon: 'ri-github-line',
          trailing: 'ri-arrow-right-up-line',
          href: linkFor('github')?.url,
          external: true,
        },
        {
          id: 'linkedin',
          label: 'LinkedIn',
          hint: 'Professional profile',
          icon: 'ri-linkedin-line',
          trailing: 'ri-arrow-right-up-line',
          href: linkFor('linkedin')?.url,
          external: true,
        },
      ],
    },
  ];

  // Sound effects switch: stays open so the change is visible. Turning it
  // on plays the on-sfx-notification sound; turning it off is silent.
  const toggleSound = () => {
    const next = !isSoundOn;
    setSfxMuted(!next);
    setIsSoundOn(next);
    if (next) playSfx('enabled');
  };

  const close = ({ returnFocus = false } = {}) => {
    setIsOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  // While open: focus the first action, close on outside click or Escape,
  // and let the arrow keys (and Home/End) move between actions.
  useEffect(() => {
    if (!isOpen) return undefined;
    const items = () => [...(panelRef.current?.querySelectorAll('.quick-menu__item') || [])];
    items()[0]?.focus({ preventScroll: true });

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }
      const list = items();
      const current = list.indexOf(document.activeElement);
      if (current === -1) return;
      const next = {
        ArrowDown: (current + 1) % list.length,
        ArrowUp: (current - 1 + list.length) % list.length,
        Home: 0,
        End: list.length - 1,
      }[event.key];
      if (next !== undefined) {
        event.preventDefault();
        list[next].focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  let itemIndex = 0;

  return (
    <div className={`quick-menu${isOpen ? ' is-open' : ''}`} ref={rootRef}>
      <div
        ref={panelRef}
        id={panelId}
        className="quick-menu__panel"
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ''}
      >
        <header className="quick-menu__header">
          <p id={titleId} className="quick-menu__title">
            Quick actions
          </p>
          <p className="quick-menu__subtitle">Get in touch or grab my resume.</p>
        </header>

        {groups.map((group) => (
          <section className="quick-menu__group" key={group.title} aria-label={group.title}>
            <h3 className="quick-menu__group-title">{group.title}</h3>
            <ul>
              {group.items.map((item) => {
                const index = itemIndex++;
                const content = (
                  <>
                    <span className="quick-menu__icon" aria-hidden="true">
                      {item.glyph ? (
                        <span className="quick-menu__glyph">{item.glyph}</span>
                      ) : (
                        <i className={item.icon}></i>
                      )}
                    </span>
                    <span className="quick-menu__text">
                      <span className="quick-menu__label">{item.label}</span>
                      <span className="quick-menu__hint">{item.hint}</span>
                    </span>
                    <i
                      className={`quick-menu__trailing ${item.trailing || 'ri-arrow-right-s-line'}`}
                      aria-hidden="true"
                    ></i>
                  </>
                );
                const shared = {
                  className: 'quick-menu__item',
                  style: { '--item-index': index },
                };
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <a
                        {...shared}
                        href={item.href}
                        download={item.download ? '' : undefined}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        aria-label={
                          item.external ? `${item.label} (opens in a new tab)` : undefined
                        }
                        onClick={() => close()}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        {...shared}
                        type="button"
                        onClick={() => {
                          close();
                          item.onSelect?.();
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="quick-menu__group" aria-label="Settings">
          <h3 className="quick-menu__group-title">Settings</h3>
          <ul>
            <li>
              <button
                type="button"
                role="switch"
                aria-checked={isSoundOn}
                className="quick-menu__item quick-menu__item--switch"
                style={{ '--item-index': itemIndex }}
                data-sfx-click="none"
                onClick={toggleSound}
              >
                <span className="quick-menu__icon" aria-hidden="true">
                  <i className={isSoundOn ? 'ri-volume-up-line' : 'ri-volume-mute-line'}></i>
                </span>
                <span className="quick-menu__text">
                  <span className="quick-menu__label">Sound effects</span>
                  <span className="quick-menu__hint">
                    {isSoundOn ? 'On: hover and click sounds' : 'Off: muted'}
                  </span>
                </span>
                <span
                  className={`quick-menu__switch${isSoundOn ? ' is-on' : ''}`}
                  aria-hidden="true"
                >
                  <span className="quick-menu__switch-knob"></span>
                </span>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className="quick-menu__toggle"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        title={isOpen ? undefined : 'Quick actions'}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
      >
        <span className="quick-menu__bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  );
}
