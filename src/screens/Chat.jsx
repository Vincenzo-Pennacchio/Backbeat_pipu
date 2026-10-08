import { useEffect, useRef, useState } from 'react';
import { aiStatus, aiChat } from '../lib/ai.js';
import { addXp, bumpStats } from '../lib/store.js';
import { getRecognition } from '../lib/speech.js';
import { CONFIG } from '../config.js';
import { TopBar, Icon, SpeakButton } from '../components/ui.jsx';

const STARTERS = [
  'Who is your favourite jazz drummer?',
  'Can we talk about bossa nova?',
  'Help me practise the future tenses.',
  'I built a new Lego set this week!',
];
const XP_PER_MSG = 3;
const XP_MSGS = 10;
const name = CONFIG.ai.tutorName;

// Le righe che iniziano con ✏️ sono correzioni: le mostriamo a parte
function Reply({ text }) {
  const lines = text.split('\n').filter((l) => l.trim());
  const fix = lines.filter((l) => l.trim().startsWith('✏️'));
  const body = lines.filter((l) => !l.trim().startsWith('✏️')).join('\n');
  return (
    <>
      {fix.map((f, i) => <p key={i} className="fix">{f.replace('✏️', '').trim()}</p>)}
      <p>{body}</p>
    </>
  );
}

export default function Chat() {
  const [status, setStatus] = useState('checking'); // checking | ready | off
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const sentRef = useRef(0);
  const endRef = useRef(null);
  const canMic = !!getRecognition();

  useEffect(() => { aiStatus(true).then((ok) => setStatus(ok ? 'ready' : 'off')); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, busy]);

  async function send(textArg) {
    const text = (textArg ?? input).trim().slice(0, 600);
    if (!text || busy) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setBusy(true);
    setError('');
    if (sentRef.current < XP_MSGS) { sentRef.current++; addXp(XP_PER_MSG); }
    bumpStats({ chats: 1 });
    try {
      const { reply } = await aiChat(next);
      setMsgs([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(`${name} non riesce a rispondere: ${e.message}. Riprova tra poco.`);
    } finally {
      setBusy(false);
    }
  }

  function listen() {
    const r = getRecognition();
    if (!r) return;
    setListening(true);
    r.onresult = (e) => setInput((v) => `${v} ${e.results[0][0].transcript}`.trim());
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
  }

  return (
    <div className="chat">
      <TopBar title={`Parla con ${name}`} backTo="play" />
      {status === 'checking' && <p className="muted center">Sto chiamando {name}…</p>}
      {status === 'off' && (
        <div className="chat-off">
          <span className="avatar big avatar-sky" aria-hidden="true">{name[0]}</span>
          <p className="lead">{name} per ora non è collegato: lo zio deve attivarlo con una chiave API.</p>
          <p className="muted">Nel frattempo la Jam ha sei dialoghi pronti.</p>
          <a className="btn btn-primary" href="#/dialogues">Vai alla Jam</a>
        </div>
      )}
      {status === 'ready' && (
        <>
          <div className="thread">
            <div className="bubble them">
              <span className="avatar small avatar-sky" aria-hidden="true">{name[0]}</span>
              <div className="bubble-body">
                <span className="bubble-who">{name}</span>
                <p>Hi {CONFIG.learner}! I’m {name}, I play bass in a jazz trio. What do you want to talk about today?</p>
              </div>
            </div>
            {msgs.map((m, i) => (m.role === 'user' ? (
              <div key={i} className="bubble me"><p>{m.content}</p></div>
            ) : (
              <div key={i} className="bubble them">
                <span className="avatar small avatar-sky" aria-hidden="true">{name[0]}</span>
                <div className="bubble-body">
                  <span className="bubble-who">{name}</span>
                  <Reply text={m.content} />
                  <div className="bubble-tools"><SpeakButton text={m.content.replace(/✏️.*$/gm, '')} /></div>
                </div>
              </div>
            )))}
            {busy && <div className="bubble them typing"><span /><span /><span /></div>}
            {error && <p className="chat-error">{error}</p>}
          </div>
          {msgs.length === 0 && (
            <div className="chips starters">
              {STARTERS.map((st) => <button key={st} type="button" className="chip" onClick={() => send(st)}>{st}</button>)}
            </div>
          )}
          <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
            {canMic && (
              <button type="button" className={`mic ${listening ? 'on' : ''}`} onClick={listen} aria-label="Parla">
                <Icon name="mic" />
              </button>
            )}
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write in English…" lang="en" aria-label="Messaggio" maxLength={600} />
            <button type="submit" className="send" disabled={!input.trim() || busy} aria-label="Invia"><Icon name="send" /></button>
          </form>
          <p className="muted small center">{name} è un’intelligenza artificiale: può sbagliare. Non scrivere dati personali.</p>
        </>
      )}
    </div>
  );
}

