import { useState } from 'react';
import { BRICKS, BRICK_CLASSES, norm } from '../content/bricks.js';
import { topicById } from '../content/topics.js';
import { addXp, recordAnswer, bumpStats, completeSetlist } from '../lib/store.js';
import { sfx } from '../lib/audio.js';
import { speak } from '../lib/speech.js';
import { shuffle, sentence } from '../lib/util.js';
import { TopBar, Button, SpeakButton, Icon } from '../components/ui.jsx';

const ROUND = 6;

function makeRound(topic) {
  const pool = topic ? BRICKS.filter((b) => b.topic === topic) : [];
  return shuffle(pool.length >= 3 ? pool : BRICKS).slice(0, ROUND);
}
const freshSlot = (item) => ({ tray: shuffle([...item.bricks, ...item.extras]), placed: [], status: 'build', tries: 0, msg: '' });

function Brick({ b, onClick, disabled }) {
  const color = BRICK_CLASSES[b.cls]?.color || 'white';
  return (
    <button type="button" className={`brick brick-${color}`} onClick={onClick} disabled={disabled}>
      <span className="brick-text">{b.text}</span>
    </button>
  );
}

export default function Bricks({ params }) {
  const [round, setRound] = useState(() => makeRound(params.topic));
  const [i, setI] = useState(0);
  const [slot, setSlot] = useState(() => freshSlot(round[0]));
  const [gained, setGained] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = round[i];

  const edit = (fn) => setSlot((s) => {
    if (s.status === 'right' || s.status === 'shown') return s;
    const n = fn({ ...s, tray: [...s.tray], placed: [...s.placed] });
    return { ...n, status: 'build', msg: s.status === 'wrong' ? '' : n.msg };
  });

  const place = (b) => { sfx('snap'); edit((s) => ({ ...s, tray: s.tray.filter((x) => x.key !== b.key), placed: [...s.placed, b] })); };
  const unplace = (b) => { sfx('pop'); edit((s) => ({ ...s, placed: s.placed.filter((x) => x.key !== b.key), tray: [...s.tray, b] })); };
  const clear = () => edit((s) => ({ ...s, tray: [...s.tray, ...s.placed], placed: [] }));

  function check() {
    const text = norm(slot.placed.map((b) => b.text).join(' '));
    if (item.accepted.includes(text)) {
      const pts = slot.tries === 0 ? 12 : 5;
      if (slot.tries === 0) { recordAnswer(item.topic, true); setFirstTry((n) => n + 1); }
      sfx('ok');
      speak(sentence(slot.placed.map((b) => b.text).join(' '), item.question));
      addXp(pts);
      bumpStats({ bricks: 1 });
      setGained((g) => g + pts);
      setSlot((s) => ({ ...s, status: 'right', msg: `+${pts} XP` }));
      return;
    }
    if (slot.tries === 0) recordAnswer(item.topic, false);
    sfx('fail');
    const trap = slot.placed.find((b) => b.key >= 100);
    let msg;
    if (trap) msg = `“${trap.text}” è un mattoncino trappola: toglilo.`;
    else if (slot.placed.length < item.bricks.length) msg = 'Mancano dei mattoncini.';
    else if (item.question) msg = 'L’ordine non torna. Nelle domande: parola interrogativa, ausiliare, soggetto, verbo.';
    else msg = 'L’ordine non torna. Ricorda: soggetto, verbo, oggetto, poi luogo e tempo.';
    setSlot((s) => ({ ...s, status: 'wrong', tries: s.tries + 1, msg }));
  }

  function reveal() {
    setSlot((s) => ({ ...s, status: 'shown', placed: item.bricks, tray: item.extras, msg: 'Ecco la soluzione. La ritrovi nel prossimo giro.' }));
    speak(sentence(item.answer, item.question));
  }

  function next() {
    if (i + 1 >= round.length) {
      setFinished(true);
      completeSetlist('bricks');
      return;
    }
    setI(i + 1);
    setSlot(freshSlot(round[i + 1]));
  }

  function again() {
    const r = makeRound(params.topic);
    setRound(r);
    setI(0);
    setSlot(freshSlot(r[0]));
    setGained(0);
    setFirstTry(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="bricks bricks-end">
        <TopBar title="Set completato" backTo="play" />
        <div className="end-score">
          <span className="end-score-n">{gained}</span>
          <span className="end-score-l">XP guadagnati</span>
        </div>
        <p className="lead center">{firstTry} frasi su {round.length} giuste al primo colpo.</p>
        <div className="end-actions">
          <Button onClick={again}>Un altro set</Button>
          <Button to="library" variant="ghost">Apri il libro</Button>
        </div>
      </div>
    );
  }

  const solved = slot.status === 'right' || slot.status === 'shown';
  return (
    <div className="bricks">
      <TopBar title="Costruisci la frase" backTo="play" right={<span className="counter">{i + 1}/{round.length}</span>} />
      <p className="bricks-prompt">{item.it}</p>
      {params.topic && topicById(params.topic) && <p className="muted small">{topicById(params.topic).name}</p>}

      <div className={`baseplate status-${slot.status}`} aria-label="La tua frase" aria-live="polite">
        {slot.placed.length === 0 && <span className="baseplate-hint">Tocca i mattoncini qui sotto per montare la frase in inglese</span>}
        {slot.placed.map((b) => <Brick key={b.key} b={b} onClick={() => unplace(b)} disabled={solved} />)}
        {item.question && slot.placed.length > 0 && <span className="brick-end">?</span>}
      </div>

      {solved && (
        <div className="bricks-solution">
          <p>{sentence(item.answer, item.question)}</p>
          <SpeakButton text={sentence(item.answer, item.question)} />
        </div>
      )}
      <p className={`bricks-msg ${slot.status}`} role="status">{slot.msg}</p>

      {!solved && (
        <div className="tray" aria-label="Mattoncini disponibili">
          {slot.tray.map((b) => <Brick key={b.key} b={b} onClick={() => place(b)} />)}
        </div>
      )}

      <div className="bricks-actions">
        {solved ? <Button onClick={next}>{i + 1 >= round.length ? 'Fine del set' : 'Prossima frase'}</Button> : (
          <>
            <Button onClick={check} disabled={slot.placed.length === 0}>Controlla</Button>
            {slot.placed.length > 0 && <Button variant="ghost" onClick={clear}>Svuota</Button>}
            {slot.tries >= 2 && <Button variant="ghost" onClick={reveal}>Mostra la soluzione</Button>}
          </>
        )}
      </div>

      <details className="legend">
        <summary>I colori dei mattoncini</summary>
        <ul>
          {Object.entries(BRICK_CLASSES).map(([k, c]) => (
            <li key={k}><span className={`legend-dot brick-${c.color}`} /> {c.name}</li>
          ))}
        </ul>
        <p className="muted small">Ci sono anche mattoncini trappola: non tutti vanno usati. <Icon name="lock" size={14} /></p>
      </details>
    </div>
  );
}
