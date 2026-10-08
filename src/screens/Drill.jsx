import { useEffect, useReducer, useRef, useState } from 'react';
import { DRILL } from '../content/drill.js';
import { TOPICS, topicById } from '../content/topics.js';
import { chapterById } from '../content/book.js';
import { useStore, addXp, recordAnswer, bumpStats, completeSetlist } from '../lib/store.js';
import { mastery } from '../lib/progress.js';
import { sfx, unlockAudio } from '../lib/audio.js';
import { shuffle, clamp } from '../lib/util.js';
import { href, go } from '../lib/router.js';
import { TopBar, Html, Icon, Sticks, Button } from '../components/ui.jsx';

export const PADS = [
  { name: 'Kick', sound: 'kick', color: 'red' },
  { name: 'Snare', sound: 'snare', color: 'yellow' },
  { name: 'Hi-hat', sound: 'hat', color: 'sky' },
  { name: 'Tom', sound: 'tom', color: 'green' },
];
const TEMPOS = [{ bpm: 70, label: 'Lento' }, { bpm: 90, label: 'Medio' }, { bpm: 110, label: 'Veloce' }];
const QUESTIONS = 15;
const LIVES = 3;
const MAX_BPM = 200;

// Più testo da leggere = più battute a disposizione
export const beatsFor = (q) => {
  const len = q.q.length + q.options.reduce((n, o) => n + o.length, 0);
  return 12 + clamp(Math.round((len - 60) / 25), 0, 8);
};
const multFor = (combo) => (combo >= 20 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1);

function makeRun(topic, bpm) {
  const pool = topic === 'all' ? DRILL : DRILL.filter((d) => d.topic === topic);
  const queue = shuffle(pool).slice(0, QUESTIONS).map((q) => ({ ...q, opts: shuffle(q.options) }));
  return {
    topic, queue, idx: 0, lives: LIVES, score: 0, xp: 0, combo: 0, bestCombo: 0, mult: 1,
    bpm, startBpm: bpm, maxBpm: bpm, correct: 0, answered: 0, mistakes: [],
    status: 'ask', chosen: null, flash: null, beat: -1, qStart: 0, beats: beatsFor(queue[0]), committed: false,
  };
}

export default function Drill({ params }) {
  const s = useStore();
  const [phase, setPhase] = useState('setup'); // setup | count | run | end
  const [topic, setTopic] = useState(params.topic && topicById(params.topic) ? params.topic : 'all');
  const [tempo, setTempo] = useState(90);
  const [count, setCount] = useState(0);
  const runRef = useRef(null);
  const [, force] = useReducer((x) => x + 1, 0);
  const timers = useRef([]);

  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    const r = runRef.current;
    if (r && !r.committed && r.xp > 0) { r.committed = true; addXp(r.xp); }
  }, []);

  function commit(r) {
    if (r.committed) return;
    r.committed = true;
    addXp(r.xp);
    bumpStats({ drills: 1, 'max:bestCombo': r.bestCombo, 'max:bestBpm': r.maxBpm });
    if (r.topic !== 'all') completeSetlist('drill', r.topic);
  }

  function start() {
    unlockAudio();
    runRef.current = makeRun(topic, tempo);
    setPhase('count');
    const beat = 60000 / tempo;
    [1, 2, 3, 4].forEach((n, i) => later(() => { setCount(n); sfx(i === 0 ? 'accent' : 'click'); }, i * beat));
    later(() => {
      const r = runRef.current;
      r.qStart = performance.now();
      r.beat = -1;
      setPhase('run');
    }, 4 * beat);
  }

  function next() {
    const r = runRef.current;
    r.idx++;
    if (r.idx >= r.queue.length || r.lives <= 0) {
      commit(r);
      setPhase('end');
      return;
    }
    Object.assign(r, { status: 'ask', chosen: null, flash: null, beat: -1, qStart: performance.now(), beats: beatsFor(r.queue[r.idx]) });
    force();
  }

  function miss(r, q, chosen) {
    r.combo = 0;
    r.mult = 1;
    r.lives--;
    r.status = 'wrong';
    r.chosen = chosen;
    r.mistakes.push({ q, chosen });
    sfx('fail');
  }

  function answer(opt, pad) {
    const r = runRef.current;
    if (!r || r.status !== 'ask') return;
    sfx(PADS[pad].sound);
    const q = r.queue[r.idx];
    const ok = opt === q.correct;
    recordAnswer(q.topic, ok);
    r.answered++;
    if (ok) {
      r.combo++;
      r.correct++;
      r.bestCombo = Math.max(r.bestCombo, r.combo);
      r.mult = multFor(r.combo);
      const pts = 5 * r.mult;
      r.score += pts;
      r.xp += pts;
      let accel = false;
      if (r.combo % 5 === 0 && r.bpm < MAX_BPM) {
        r.bpm = Math.min(MAX_BPM, r.bpm + 8);
        r.maxBpm = Math.max(r.maxBpm, r.bpm);
        accel = true;
      }
      r.status = 'right';
      r.chosen = opt;
      r.flash = accel ? `Accelerando: ${r.bpm} BPM` : `+${pts}`;
      later(() => sfx('ok'), 120);
      later(next, accel ? 1100 : 700);
    } else {
      miss(r, q, opt);
    }
    force();
  }

  // Ciclo del metronomo: un click per battuta, tempo scaduto dopo r.beats battute
  useEffect(() => {
    if (phase !== 'run') return undefined;
    let raf;
    let hiddenAt = 0;
    const onVis = () => {
      const r = runRef.current;
      if (document.hidden) hiddenAt = performance.now();
      else if (hiddenAt && r) { r.qStart += performance.now() - hiddenAt; hiddenAt = 0; }
    };
    document.addEventListener('visibilitychange', onVis);
    const tick = () => {
      const r = runRef.current;
      if (r && r.status === 'ask' && !document.hidden) {
        const beatMs = 60000 / r.bpm;
        const el = performance.now() - r.qStart;
        const b = Math.floor(el / beatMs);
        if (b !== r.beat && b < r.beats) {
          r.beat = b;
          sfx(b % 4 === 0 ? 'accent' : 'click');
          force();
        }
        if (el >= r.beats * beatMs) {
          miss(r, r.queue[r.idx], null);
          recordAnswer(r.queue[r.idx].topic, false);
          r.answered++;
          force();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  }, [phase]);

  // Tastiera: 1-4 per i pad, Invio per continuare
  useEffect(() => {
    if (phase !== 'run') return undefined;
    const onKey = (e) => {
      const r = runRef.current;
      if (!r) return;
      if (r.status === 'ask' && ['1', '2', '3', '4'].includes(e.key)) {
        const i = Number(e.key) - 1;
        answer(r.queue[r.idx].opts[i], i);
      } else if (r.status === 'wrong' && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Setup ──────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="drill drill-setup">
        <TopBar title="Drill a tempo" backTo="play" />
        <p className="lead">Quattro pad, quattro risposte. Rispondi prima che finiscano le battute: ogni 5 risposte giuste di fila il tempo accelera.</p>
        <h2 className="section-title">Argomento</h2>
        <div className="chips" role="radiogroup" aria-label="Argomento">
          <button type="button" role="radio" aria-checked={topic === 'all'} className={`chip ${topic === 'all' ? 'on' : ''}`} onClick={() => setTopic('all')}>Tutti</button>
          {TOPICS.map((t) => {
            const m = mastery(s, t.id);
            const meta = m.n ? `${Math.round(m.acc * 100)}%` : t.isNew ? 'nuovo' : '';
            return (
              <button key={t.id} type="button" role="radio" aria-checked={topic === t.id} className={`chip ${topic === t.id ? 'on' : ''}`} onClick={() => setTopic(t.id)}>
                {t.name}
                {meta && <span className="chip-meta">{meta}</span>}
              </button>
            );
          })}
        </div>
        <h2 className="section-title">Tempo di partenza</h2>
        <div className="segmented" role="radiogroup" aria-label="Tempo">
          {TEMPOS.map((t) => (
            <button key={t.bpm} type="button" role="radio" aria-checked={tempo === t.bpm} className={tempo === t.bpm ? 'on' : ''} onClick={() => setTempo(t.bpm)}>
              <strong>{t.label}</strong><span>{t.bpm} BPM</span>
            </button>
          ))}
        </div>
        <div className="drill-start">
          <Button onClick={start}>Conta l’attacco</Button>
          {s.stats.bestBpm > 0 && <p className="muted">Il tuo record: {s.stats.bestBpm} BPM, combo {s.stats.bestCombo}</p>}
        </div>
      </div>
    );
  }

  const r = runRef.current;

  if (phase === 'count') {
    return (
      <div className="drill drill-count" aria-live="assertive">
        <span className="count-n" key={count}>{count || ''}</span>
        <span className="count-label">{topic === 'all' ? 'Tutti gli argomenti' : topicById(topic).name}, {tempo} BPM</span>
      </div>
    );
  }

  // ── Fine ───────────────────────────────────────────────────
  if (phase === 'end') {
    const acc = r.answered ? Math.round((r.correct / r.answered) * 100) : 0;
    const worst = r.mistakes[0]?.q.topic;
    const ch = worst ? chapterById(topicById(worst).chapter) : null;
    return (
      <div className="drill drill-end">
        <TopBar title={r.lives > 0 ? 'Fine del brano' : 'Bacchette finite'} backTo="play" />
        <div className="end-score">
          <span className="end-score-n">{r.score}</span>
          <span className="end-score-l">punti = {r.xp} XP</span>
        </div>
        <dl className="end-stats">
          <div><dt>Giuste</dt><dd>{r.correct}/{r.answered}</dd></div>
          <div><dt>Precisione</dt><dd>{acc}%</dd></div>
          <div><dt>Combo</dt><dd>{r.bestCombo}</dd></div>
          <div><dt>Tempo max</dt><dd>{r.maxBpm}</dd></div>
        </dl>
        <div className="end-actions">
          <Button onClick={() => { setPhase('setup'); runRef.current = null; }}>Rigioca</Button>
          {ch && <Button to="chapter" params={{ id: ch.id }} variant="ghost">Ripassa: {ch.title}</Button>}
        </div>
        {r.mistakes.length > 0 && (
          <section className="mistakes">
            <h2 className="section-title">Da ripassare</h2>
            {r.mistakes.map(({ q, chosen }, i) => (
              <article key={i} className="mistake">
                <Html as="p" className="mistake-q" text={q.q} />
                {chosen && <p className="mistake-no"><Icon name="x" size={16} stroke={3} /> {chosen}</p>}
                <p className="mistake-yes"><Icon name="check" size={16} stroke={3} /> {q.correct}</p>
                <p className="mistake-x">{q.x}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    );
  }

  // ── In gioco ───────────────────────────────────────────────
  const q = r.queue[r.idx];
  const beatDur = 60 / r.bpm;
  const ch = chapterById(topicById(q.topic).chapter);
  return (
    <div className={`drill drill-run status-${r.status}`}>
      <header className="run-head">
        <button type="button" className="run-quit" onClick={() => go('play')} aria-label="Esci">
          <Icon name="x" />
        </button>
        <Sticks lives={r.lives} max={LIVES} />
        <span className="run-score">{r.score}</span>
        <span className={`run-mult m${r.mult}`}>x{r.mult}</span>
        <span className="run-bpm">{r.bpm} BPM</span>
      </header>
      <div className="run-progress" aria-label={`Domanda ${r.idx + 1} di ${r.queue.length}`}>
        {r.queue.map((_, i) => <span key={i} className={i < r.idx ? 'past' : i === r.idx ? 'now' : ''} />)}
      </div>

      <section className="question">
        <span className="question-topic">{topicById(q.topic).name}</span>
        <Html as="p" className="question-text" text={q.q} />
        <div className="beats" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} className={r.status === 'ask' && r.beat >= 0 && r.beat % 4 === i ? 'on' : ''} />)}
        </div>
        <div className="timer" aria-hidden="true">
          <span key={r.idx} className="timer-fill" style={{ '--dur': `${r.beats * beatDur}s`, animationPlayState: r.status === 'ask' ? 'running' : 'paused' }} />
        </div>
        {r.flash && <span className="flash" key={`${r.idx}-f`}>{r.flash}</span>}
      </section>

      <div className="pads">
        {q.opts.map((opt, i) => {
          const state = r.status === 'ask' ? '' : opt === q.correct ? 'is-right' : opt === r.chosen ? 'is-wrong' : 'is-dim';
          return (
            <button key={i} type="button" className={`pad pad-${PADS[i].color} ${state}`} onClick={() => answer(opt, i)} disabled={r.status !== 'ask'}>
              <span className="pad-name">{PADS[i].name}</span>
              <span className="pad-text">{opt}</span>
            </button>
          );
        })}
      </div>

      {r.status === 'wrong' && (
        <div className="miss" role="dialog" aria-label="Risposta sbagliata">
          <p className="miss-title">{r.chosen ? 'Fuori tempo' : 'Tempo scaduto'}{r.lives > 0 ? `: ti restano ${r.lives} bacchette` : ': bacchette finite'}</p>
          <p className="miss-answer"><Icon name="check" size={18} stroke={3} /> {q.correct}</p>
          <p className="miss-x">{q.x}</p>
          <div className="miss-actions">
            <Button onClick={next}>{r.lives > 0 && r.idx + 1 < r.queue.length ? 'Continua' : 'Vedi il risultato'}</Button>
            <a className="link-btn light" href={href('chapter', { id: ch.id })}>Capitolo {ch.id.toUpperCase()}</a>
          </div>
        </div>
      )}
    </div>
  );
}
