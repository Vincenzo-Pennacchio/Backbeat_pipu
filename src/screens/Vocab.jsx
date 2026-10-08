import { useState } from 'react';
import { VOCAB, DECKS, vocabById } from '../content/vocab.js';
import { useStore, update, addXp, bumpStats, completeSetlist } from '../lib/store.js';
import { gradeCard, LEARNED_BOX, wordsLearned } from '../lib/progress.js';
import { speak } from '../lib/speech.js';
import { sfx } from '../lib/audio.js';
import { dayKey, shuffle } from '../lib/util.js';
import { TopBar, Button, SpeakButton } from '../components/ui.jsx';

const SESSION = 10;
const GRADES = [
  { id: 'no', label: 'Non la so', xp: 1 },
  { id: 'almost', label: 'Quasi', xp: 2 },
  { id: 'yes', label: 'La so', xp: 4 },
];

function buildQueue(state, deck, extra = false) {
  const today = dayKey();
  const cards = VOCAB.filter((v) => deck === 'all' || v.deck === deck);
  if (extra) return shuffle(cards).slice(0, SESSION).map((c) => c.id);
  const due = cards.filter((c) => state.vocab[c.id] && state.vocab[c.id].due <= today)
    .sort((a, b) => state.vocab[a.id].due.localeCompare(state.vocab[b.id].due));
  const fresh = cards.filter((c) => !state.vocab[c.id]);
  return [...due, ...fresh].slice(0, SESSION).map((c) => c.id);
}

export default function Vocab({ params }) {
  const s = useStore();
  const [deck, setDeck] = useState(params.deck && DECKS[params.deck] ? params.deck : 'all');
  const [run, setRun] = useState(null);

  function start(extra = false) {
    const queue = buildQueue(s, deck, extra);
    if (!queue.length) return;
    setRun({ queue, idx: 0, revealed: false, requeued: [], counts: { no: 0, almost: 0, yes: 0 }, xp: 0, done: false });
    speak(vocabById(queue[0]).en);
  }

  function grade(g) {
    const id = run.queue[run.idx];
    update((st) => { st.vocab[id] = gradeCard(st.vocab[id], g.id); });
    addXp(g.xp);
    bumpStats({ words: 1 });
    sfx(g.id === 'yes' ? 'ok' : 'pop');
    const queue = [...run.queue];
    const requeued = [...run.requeued];
    if (g.id === 'no' && !requeued.includes(id)) { queue.push(id); requeued.push(id); }
    const idx = run.idx + 1;
    const done = idx >= queue.length;
    if (done) completeSetlist('vocab');
    else speak(vocabById(queue[idx]).en);
    setRun({ ...run, queue, requeued, idx, revealed: false, done, xp: run.xp + g.xp, counts: { ...run.counts, [g.id]: run.counts[g.id] + 1 } });
  }

  // ── Scelta del mazzo ───────────────────────────────────────
  if (!run) {
    const today = dayKey();
    const inDeck = VOCAB.filter((v) => deck === 'all' || v.deck === deck);
    const due = inDeck.filter((v) => s.vocab[v.id]?.due <= today).length;
    const fresh = inDeck.filter((v) => !s.vocab[v.id]).length;
    const ready = Math.min(SESSION, due + fresh);
    const nextDue = inDeck.map((v) => s.vocab[v.id]?.due).filter((d) => d && d > today).sort()[0];
    return (
      <div className="vocab">
        <TopBar title="Parole" backTo="play" />
        <p className="lead">Le carte che sai tornano tra qualche giorno, quelle che non sai tornano subito. {wordsLearned(s)} parole imparate su {VOCAB.length}.</p>
        <div className="decks">
          {[['all', { name: 'Tutte', icon: '★' }], ...Object.entries(DECKS)].map(([id, d]) => {
            const cards = VOCAB.filter((v) => id === 'all' || v.deck === id);
            const learned = cards.filter((v) => (s.vocab[v.id]?.box || 0) >= LEARNED_BOX).length;
            return (
              <button key={id} type="button" className={`deck ${deck === id ? 'on' : ''}`} onClick={() => setDeck(id)} aria-pressed={deck === id}>
                <span className="deck-icon" aria-hidden="true">{d.icon}</span>
                <strong>{d.name}</strong>
                <span className="deck-meta">{learned}/{cards.length}</span>
                <span className="deck-bar"><span style={{ width: `${(learned / cards.length) * 100}%` }} /></span>
              </button>
            );
          })}
        </div>
        <div className="vocab-start">
          {ready > 0 ? (
            <>
              <Button onClick={() => start(false)}>Inizia: {ready} carte</Button>
              <p className="muted">{due} da ripassare, {fresh} nuove in questo mazzo.</p>
            </>
          ) : (
            <>
              <p className="lead">Mazzo in pari: niente da ripassare oggi{nextDue ? `, il prossimo ripasso è il ${nextDue.split('-').reverse().slice(0, 2).join('/')}` : ''}.</p>
              <Button variant="ghost" onClick={() => start(true)}>Ripasso extra</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Fine sessione ─────────────────────────────────────────
  if (run.done) {
    return (
      <div className="vocab vocab-end">
        <TopBar title="Sessione finita" backTo="play" />
        <div className="end-score">
          <span className="end-score-n">{run.xp}</span>
          <span className="end-score-l">XP guadagnati</span>
        </div>
        <dl className="end-stats three">
          <div><dt>La so</dt><dd>{run.counts.yes}</dd></div>
          <div><dt>Quasi</dt><dd>{run.counts.almost}</dd></div>
          <div><dt>Non la so</dt><dd>{run.counts.no}</dd></div>
        </dl>
        <div className="end-actions">
          <Button onClick={() => setRun(null)}>Altre carte</Button>
          <Button to="chapter" params={{ id: 'b5' }} variant="ghost">Il metodo nel libro</Button>
        </div>
      </div>
    );
  }

  // ── Carta ─────────────────────────────────────────────────
  const card = vocabById(run.queue[run.idx]);
  return (
    <div className="vocab vocab-run">
      <TopBar title={DECKS[card.deck].name} backTo="play" right={<span className="counter">{run.idx + 1}/{run.queue.length}</span>} />
      <div className={`card ${run.revealed ? 'revealed' : ''}`}>
        <span className="card-deck">{DECKS[card.deck].icon}</span>
        <div className="card-en">
          <strong>{card.en}</strong>
          <SpeakButton text={card.en} />
        </div>
        {run.revealed ? (
          <div className="card-back">
            <p className="card-it">{card.it}</p>
            <p className="card-ex">{card.ex} <SpeakButton text={card.ex} label="Ascolta l’esempio" /></p>
          </div>
        ) : (
          <p className="card-hint">Prova a dirla in italiano, poi gira la carta.</p>
        )}
      </div>
      <div className="card-actions">
        {run.revealed
          ? GRADES.map((g) => <button key={g.id} type="button" className={`grade grade-${g.id}`} onClick={() => grade(g)}>{g.label}</button>)
          : <Button onClick={() => setRun({ ...run, revealed: true })}>Gira la carta</Button>}
      </div>
    </div>
  );
}
