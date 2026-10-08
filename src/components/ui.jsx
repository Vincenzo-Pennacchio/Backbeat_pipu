import { useEffect, useState } from 'react';
import { go, href, useRoute } from '../lib/router.js';
import { onToast } from '../lib/store.js';
import { speak, canSpeak } from '../lib/speech.js';
import { fmt } from '../lib/format.js';
import { CONFIG } from '../config.js';

// ── Icone (SVG inline, ereditano il colore) ─────────────────
const P = {
  stage: <><ellipse cx="12" cy="8" rx="8" ry="3" /><path d="M4 8v7c0 1.7 3.6 3 8 3s8-1.3 8-3V8" /><path d="M7 3l4 5M17 3l-4 5" /></>,
  play: <><rect x="3" y="8" width="18" height="12" rx="1" /><rect x="5.5" y="4.5" width="4" height="3.5" rx="1" /><rect x="14.5" y="4.5" width="4" height="3.5" rx="1" /></>,
  book: <><path d="M3 5c3-1.5 6-1.5 9 1 3-2.5 6-2.5 9-1v14c-3-1.5-6-1.5-9 1-3-2.5-6-2.5-9-1z" /><path d="M12 6v14" /></>,
  record: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  speaker: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  send: <path d="M4 12l16-8-6 16-3-7z" />,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  flame: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 1.5 2 2 2 0-3-1-5 1-7z" />,
  stick: <path d="M5 19L18 6M18 6l1.5-1.5" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
};
export function Icon({ name, size = 22, stroke = 2, className = '' }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

export const Html = ({ as: Tag = 'span', text, className }) => <Tag className={className} dangerouslySetInnerHTML={{ __html: fmt(text) }} />;

export function SpeakButton({ text, label = 'Ascolta', className = '' }) {
  if (!canSpeak()) return null;
  return (
    <button type="button" className={`speak ${className}`} onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label={`${label}: ${text}`}>
      <Icon name="speaker" size={18} />
    </button>
  );
}

export function TopBar({ title, backTo = 'home', backParams, right }) {
  return (
    <header className="topbar">
      <a className="topbar-back" href={href(backTo, backParams)} aria-label="Indietro"><Icon name="back" /></a>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

const TABS = [
  { path: 'home', label: 'Palco', icon: 'stage', match: ['home'] },
  { path: 'play', label: 'Gioca', icon: 'play', match: ['play'] },
  { path: 'library', label: 'Libro', icon: 'book', match: ['library'] },
  { path: 'records', label: 'Dischi', icon: 'record', match: ['records'] },
];
export function TabBar() {
  const { path } = useRoute();
  return (
    <nav className="tabbar" aria-label="Sezioni">
      {TABS.map((t) => {
        const on = t.match.includes(path);
        return (
          <a key={t.path} href={href(t.path)} className={`tab ${on ? 'on' : ''}`} aria-current={on ? 'page' : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

// Un toast alla volta, in coda: così occupa solo la barra in alto e non copre il contenuto
const TOAST_MS = 2400;
export function Toasts() {
  const [queue, setQueue] = useState([]);
  useEffect(() => onToast((t) => setQueue((q) => [...q, t].slice(-4))), []);
  const current = queue[0];
  useEffect(() => {
    if (!current) return undefined;
    const id = setTimeout(() => setQueue((q) => q.slice(1)), TOAST_MS);
    return () => clearTimeout(id);
  }, [current]);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {current && (
        <div key={current.id} className={`toast toast-${current.color || 'yellow'}`}>
          <strong>{current.title}</strong>
          {current.sub && <span>{current.sub}</span>}
          {queue.length > 1 && <em className="toast-more">+{queue.length - 1}</em>}
        </div>
      )}
    </div>
  );
}

// Fader del mixer: altezza = padronanza
export function Fader({ label, value, empty, onClick }) {
  const pct = Math.round(value * 100);
  return (
    <button type="button" className={`fader ${empty ? 'empty' : ''}`} onClick={onClick} aria-label={`${label}: ${empty ? 'mai provato' : `${pct}%`}`}>
      <span className="fader-val">{empty ? '–' : pct}</span>
      <span className="fader-track">
        <span className="fader-fill" style={{ height: `${empty ? 0 : pct}%` }} />
        <span className="fader-knob" style={{ bottom: `calc(${empty ? 0 : pct}% - 7px)` }} />
      </span>
      <span className="fader-label">{label}</span>
    </button>
  );
}

export function Vinyl({ name, desc, color, unlocked }) {
  return (
    <div className={`vinyl ${unlocked ? 'on' : 'off'}`} title={desc}>
      <div className={`vinyl-sleeve sleeve-${color}`}>
        <div className="vinyl-disc"><span className={`vinyl-label label-${color}`} /></div>
        {!unlocked && <Icon name="lock" size={18} className="vinyl-lock" />}
      </div>
      <strong>{name}</strong>
      <span>{desc}</span>
    </div>
  );
}

export function Sticks({ lives, max = 3 }) {
  return (
    <span className="sticks" aria-label={`${lives} vite su ${max}`}>
      {Array.from({ length: max }, (_, i) => <Icon key={i} name="stick" size={20} stroke={3} className={i < lives ? 'on' : 'off'} />)}
    </span>
  );
}

export const Button = ({ to, params, children, variant = 'primary', ...rest }) =>
  to ? <a className={`btn btn-${variant}`} href={href(to, params)} {...rest}>{children}</a>
    : <button type="button" className={`btn btn-${variant}`} {...rest}>{children}</button>;

export function Footer() {
  return <p className="footer">Fatto per {CONFIG.learner} da {CONFIG.from}</p>;
}

export { go };
