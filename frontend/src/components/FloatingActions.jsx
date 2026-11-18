import { useEffect, useId, useRef, useState } from 'react';
import { floatingActions } from '../data/portfolio';

const linkFor = (id) => floatingActions.actions.find((action) => action.id === id);

/**
 * Floating quick-actions dock (bottom-right). One glass column whose bottom
 * cell is the hamburger toggle; opening it expands the same column upward to
 * reveal icon-only actions (AI Assistant, Contact Form, Download Resume,
 * GitHub, LinkedIn) with tooltips. Closes after an action, on outside click,
 * or with Escape.
 */
export default function FloatingActions({ onOpenChat, onOpenContact }) {
  const [isOpen, setIsOpen] = useState(false);
  // True once the expand animation has finished; tooltips (which sit outside
  // the column) are only shown then, because the column clips while moving.
  const [isSettled, setIsSettled] = useState(false);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const firstItemRef = useRef(null);
  const menuId = useId();

  const items = [
    { id: 'ai', label: 'AI Assistant', glyph: 'R', onSelect: onOpenChat },
    { id: 'contact', label: 'Contact Form', icon: 'ri-mail-line', onSelect: onOpenContact },
    {
      id: 'resume',
      label: 'Download Resume',
      icon: 'ri-download-2-line',
      href: linkFor('cv')?.url,
      download: true,
    },
    { id: 'github', label: 'GitHub', icon: 'ri-github-line', href: linkFor('github')?.url, external: true },
    { id: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-line', href: linkFor('linkedin')?.url, external: true },
  ];

  const open = () => setIsOpen(true);
  const close = ({ returnFocus = false } = {}) => {
    setIsSettled(false);
    setIsOpen(false);
    if (returnFocus) {
      toggleRef.current?.focus();
    }
  };

  // Close on outside click/tap and on Escape while open.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsSettled(false);
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSettled(false);
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    firstItemRef.current?.focus({ preventScroll: true });
    // Fallback in case transitionend doesn't fire (e.g. reduced motion).
    const settleTimer = window.setTimeout(() => setIsSettled(true), 400);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(settleTimer);
    };
  }, [isOpen]);

  return (
    <div
      className={`floating-actions${isOpen ? ' is-open' : ''}${
        isOpen && isSettled ? ' is-settled' : ''
      }`}
      ref={rootRef}
    >
      <nav
        id={menuId}
        className="floating-actions__menu"
        aria-label="Quick actions"
        aria-hidden={!isOpen}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && isOpen) {
            setIsSettled(true);
          }
        }}
      >
        <ul>
          {items.map((item, index) => {
            const content = (
              <>
                {item.glyph ? (
                  <span className="floating-actions__glyph" aria-hidden="true">
                    {item.glyph}
                  </span>
                ) : (
                  <i className={item.icon} aria-hidden="true"></i>
                )}
                <span className="floating-actions__tooltip" aria-hidden="true">
                  {item.label}
                </span>
              </>
            );
            const shared = {
              ref: index === 0 ? firstItemRef : undefined,
              className: 'floating-actions__item',
              style: { '--item-index': index },
              tabIndex: isOpen ? 0 : -1,
              'aria-label': item.external ? `${item.label} (opens in a new tab)` : item.label,
            };

            return (
              <li key={item.id}>
                {item.href ? (
                  <a
                    {...shared}
                    href={item.href}
                    download={item.download ? '' : undefined}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
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
      </nav>

      <button
        ref={toggleRef}
        type="button"
        className="floating-actions__toggle"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        onClick={() => (isOpen ? close() : open())}
      >
        <span className="floating-actions__bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  );
}
