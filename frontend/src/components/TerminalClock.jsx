import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/terminal-clock.css';

const pad2 = (value) => String(value).padStart(2, '0');

// "GMT+8", "GMT-5", "GMT+5:30" for the viewer's time zone.
function gmtOffset(date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const rest = abs % 60;
  return `GMT${sign}${Math.floor(abs / 60)}${rest ? `:${pad2(rest)}` : ''}`;
}

const format = (date) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;

/**
 * Live "21:24:50 GMT+8" readout fixed in the bottom-left corner (under the
 * section index). Shows the viewer's local time, ticking on the second.
 * Hidden below 1680px (too little side margin), so it never covers content.
 */
export default function TerminalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    // Re-align to the start of each second so the digits change on time.
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(tick, 1000 - current.getMilliseconds());
    };
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
    return () => window.clearTimeout(timer);
  }, []);

  // Portal: the page wrapper's transform would otherwise trap `position: fixed`.
  return createPortal(
    <div className="terminal-clock">
      <span className="terminal-clock__dot" aria-hidden="true"></span>
      <time
        className="terminal-clock__time"
        dateTime={now.toISOString()}
        aria-label={`Local time ${format(now)} ${gmtOffset(now)}`}
      >
        {format(now)}
      </time>
      <span className="terminal-clock__zone">{gmtOffset(now)}</span>
    </div>,
    document.body
  );
}
