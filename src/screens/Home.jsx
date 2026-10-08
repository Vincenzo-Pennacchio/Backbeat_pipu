import { useEffect } from 'react';
import { useStore, ensureSetlist } from '../lib/store.js';
import { levelInfo, liveStreak, setlistTarget } from '../lib/progress.js';
import { href } from '../lib/router.js';
import { chapterById } from '../content/book.js';
import { CONFIG } from '../config.js';
import { Icon, Footer } from '../components/ui.jsx';

const STEPS = 16;

export default function Home() {
  const s = useStore();
  useEffect(() => { ensureSetlist(); }, []);
  const info = levelInfo(s.xp);
  const streak = liveStreak(s);
  const filled = Math.floor(info.progress * STEPS);
  const setlist = s.setlist;
  const last = s.lastChapter && !s.read[s.lastChapter] ? chapterById(s.lastChapter) : null;

  return (
    <div className="home">
      <section className="hero" style={{ '--beat': `${60 / info.bpm}s` }} aria-label={`Livello ${info.level}, ${info.name}`}>
        <div className="hero-top">
          <span className="hero-brand">{CONFIG.appName}</span>
          <span className={`streak ${streak ? 'on' : ''}`} aria-label={`Serie: ${streak} giorni`}>
            <Icon name="flame" size={18} /> {streak} {streak === 1 ? 'giorno' : 'giorni'}
          </span>
        </div>
        <h1 className="hero-name">{CONFIG.learner}</h1>
        <div className="hero-mid">
          <div className="hero-level">
            <span className="hero-level-n">Livello {info.level}</span>
            <strong className="hero-level-name">{info.name}</strong>
            <span className="hero-xp">{s.xp} XP</span>
          </div>
          <div className="drumhead" aria-hidden="true">
            <span className="drumhead-bpm">{info.bpm}</span>
            <span className="drumhead-unit">BPM</span>
          </div>
        </div>
        <div className="steps" aria-label={`${info.to - s.xp} XP al livello ${info.level + 1}`}>
          {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`step ${i < filled ? 'on' : ''} ${i % 4 === 0 ? 'downbeat' : ''}`} />)}
        </div>
        <p className="hero-next">{info.to - s.xp} XP al livello {info.level + 1}: il tempo sale a {info.bpm + 10} BPM</p>
      </section>

      <section className="setlist">
        <h2 className="section-title">La setlist di oggi</h2>
        {setlist && (
          <ol className="setlist-list">
            {setlist.items.map((it) => {
              const [path, params] = setlistTarget(it);
              return (
                <li key={it.slot}>
                  <a className={`track ${it.done ? 'done' : ''}`} href={href(path, params)}>
                    <span className="track-slot">{it.slot}</span>
                    <span className="track-body">
                      <strong>{it.title}</strong>
                      <span>{it.sub}</span>
                    </span>
                    <span className="track-state">{it.done ? <Icon name="check" stroke={3} /> : null}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        )}
        <p className="setlist-note">
          {setlist?.bonus ? 'Setlist chiusa. Il resto della giornata è jam libera.' : 'Chiudi tutte e tre le tracce: +60 XP.'}
        </p>
      </section>

      {last && (
        <a className="resume" href={href('chapter', { id: last.id })}>
          <span className="resume-tag">Libro</span>
          <span><strong>Riprendi a leggere</strong><span>{last.id.toUpperCase()}: {last.title}</span></span>
        </a>
      )}

      <Footer />
    </div>
  );
}
