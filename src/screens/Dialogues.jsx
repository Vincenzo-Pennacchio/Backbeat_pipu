import { useEffect, useRef, useState } from 'react';
import { DIALOGUES, dialogueById } from '../content/dialogues.js';
import { topicById } from '../content/topics.js';
import { useStore, update, addXp, recordAnswer, bumpStats, completeSetlist } from '../lib/store.js';
import { sfx } from '../lib/audio.js';
import { speak, stopSpeaking } from '../lib/speech.js';
import { shuffle } from '../lib/util.js';
import { href } from '../lib/router.js';
import { TopBar, Button, SpeakButton, Icon } from '../components/ui.jsx';

export function DialogueList() {
  const s = useStore();
  return (
    <div className="jam">
      <TopBar title="Jam" backTo="play" />
      <p className="lead">Sei dentro una conversazione: scegli la risposta giusta per andare avanti. Le battute si possono ascoltare e tradurre.</p>
      <ul className="jam-list">
        {DIALOGUES.map((d) => {
          const done = s.dialogues[d.id]?.done;
          return (
            <li key={d.id}>
              <a className={`jam-item ${done ? 'done' : ''}`} href={href('dialogue', { id: d.id })}>
                <span className={`avatar avatar-${d.color}`} aria-hidden="true">{d.who[0]}</span>
                <span className="jam-body">
                  <strong>{d.title}</strong>
                  <span>{d.who}, {d.role}</span>
                  <span className="jam-topic">{topicById(d.topic).name}</span>
                </span>
                {done && <Icon name="check" stroke={3} className="jam-done" />}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Bubble({ m, d }) {
  const [it, setIt] = useState(false);
  if (m.from === 'me') {
    return (
      <div className="bubble me">
        <p>{m.text}</p>
        {m.fb && <p className="bubble-fb"><Icon name="check" size={14} stroke={3} /> {m.fb}</p>}
      </div>
    );
  }
  return (
    <div className="bubble them">
      <span className={`avatar small avatar-${d.color}`} aria-hidden="true">{d.who[0]}</span>
      <div className="bubble-body">
        <span className="bubble-who">{d.who}</span>
        <p>{m.say}</p>
        {it && <p className="bubble-it">{m.it}</p>}
        <div className="bubble-tools">
          <SpeakButton text={m.say} />
          <button type="button" className={`it-toggle ${it ? 'on' : ''}`} onClick={() => setIt(!it)} aria-pressed={it}>IT</button>
        </div>
      </div>
    </div>
  );
}

export function DialoguePlay({ params }) {
  const d = dialogueById(params.id) || DIALOGUES[0];
  const s = useStore();
  const [t, setT] = useState(0);
  const [log, setLog] = useState(() => [{ from: 'them', ...d.turns[0] }]);
  const [opts, setOpts] = useState(() => shuffle(d.turns[0].options));
  const [wrong, setWrong] = useState([]);
  const [xp, setXp] = useState(0);
  const [done, setDone] = useState(false);
  const endRef = useRef(null);
  const firstTime = useRef(!s.dialogues[d.id]?.done);

  useEffect(() => { speak(d.turns[0].say); return stopSpeaking; }, [d]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [log, wrong, done]);

  function choose(o) {
    if (done || wrong.includes(o.text)) return;
    if (!o.ok) {
      if (!wrong.length) recordAnswer(d.topic, false);
      sfx('fail');
      setWrong([...wrong, o.text]);
      return;
    }
    sfx('ok');
    let gained = 0;
    if (!wrong.length) { recordAnswer(d.topic, true); gained += 8; }
    const nextLog = [...log, { from: 'me', text: o.text, fb: o.fb }];
    if (t + 1 < d.turns.length) {
      const nt = d.turns[t + 1];
      nextLog.push({ from: 'them', ...nt });
      setT(t + 1);
      setOpts(shuffle(nt.options));
      setTimeout(() => speak(nt.say), 250);
    } else {
      nextLog.push({ from: 'them', ...d.end });
      setTimeout(() => speak(d.end.say), 250);
      gained += firstTime.current ? 40 : 20;
      setDone(true);
      update((st) => { st.dialogues[d.id] = { done: true, times: (st.dialogues[d.id]?.times || 0) + 1 }; });
      bumpStats({ dialogues: 1 });
      completeSetlist('dialogue', d.id);
    }
    if (gained) addXp(gained);
    setXp(xp + gained);
    setLog(nextLog);
    setWrong([]);
  }

  const nextD = DIALOGUES[(DIALOGUES.indexOf(d) + 1) % DIALOGUES.length];
  return (
    <div className="jam-play">
      <TopBar title={d.title} backTo="dialogues" right={<span className="counter">{Math.min(t + 1, d.turns.length)}/{d.turns.length}</span>} />
      <p className="jam-scene">{d.scene}</p>
      <div className="thread">
        {log.map((m, i) => <Bubble key={i} m={m} d={d} />)}
      </div>

      {!done ? (
        <div className="replies" aria-label="Le tue risposte">
          {opts.map((o) => {
            const isWrong = wrong.includes(o.text);
            return (
              <div key={o.text} className={`reply ${isWrong ? 'wrong' : ''}`}>
                <button type="button" onClick={() => choose(o)} disabled={isWrong}>{o.text}</button>
                {isWrong && <p className="reply-fb"><Icon name="x" size={14} stroke={3} /> {o.fb}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <section className="jam-end">
          <p className="jam-end-xp">Dialogo completato: +{xp} XP</p>
          <h2 className="section-title">Parole da portarti via</h2>
          <ul className="phrases">
            {d.phrases.map(([en, it]) => (
              <li key={en}><strong>{en}</strong> <span>{it}</span> <SpeakButton text={en} /></li>
            ))}
          </ul>
          <div className="end-actions">
            <Button to="dialogue" params={{ id: nextD.id }}>Prossimo: {nextD.title}</Button>
            <Button to="chapter" params={{ id: 'b6' }} variant="ghost">Le frasi per dialogare</Button>
          </div>
        </section>
      )}
      <div ref={endRef} />
    </div>
  );
}
