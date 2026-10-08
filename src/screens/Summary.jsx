import { useEffect, useMemo, useState } from 'react';
import { TEXTS, textById, checkSummary } from '../content/texts.js';
import { useStore, update, addXp, bumpStats, completeSetlist } from '../lib/store.js';
import { sfx } from '../lib/audio.js';
import { stopSpeaking } from '../lib/speech.js';
import { shuffle } from '../lib/util.js';
import { href } from '../lib/router.js';
import { aiStatus, aiSummary } from '../lib/ai.js';
import { CONFIG } from '../config.js';
import { TopBar, Button, SpeakButton, Icon } from '../components/ui.jsx';

const STEPS = ['Leggi', 'Idee', 'Scegli', 'Scrivi'];

function List() {
  const s = useStore();
  return (
    <div className="summary">
      <TopBar title="Riassunti" backTo="play" />
      <p className="lead">Quattro passi: leggi il testo, trova le idee principali, scegli il riassunto migliore, poi scrivi il tuo.</p>
      <ul className="text-list">
        {TEXTS.map((t) => {
          const st = s.summaries[t.id];
          return (
            <li key={t.id}>
              <a className={`text-item text-${t.id} ${st?.done ? 'done' : ''}`} href={href('summary', { id: t.id })}>
                <strong>{t.title}</strong>
                <span>{t.it}</span>
                <span className="text-meta">{t.wordCount} parole, {t.minutes} min{st?.done ? (st.written ? ', riassunto scritto' : ', completato') : ''}</span>
                {st?.done && <Icon name="check" stroke={3} className="text-done" />}
              </a>
            </li>
          );
        })}
      </ul>
      <p className="muted"><a className="link-btn" href={href('chapter', { id: 'b7' })}>Come si fa un riassunto: capitolo B7</a></p>
    </div>
  );
}

function Glossed({ text, glossary, onPick }) {
  const re = useMemo(() => {
    const terms = glossary.map((g) => g.w).sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
  }, [glossary]);
  const parts = text.split(re);
  return parts.map((p, i) => {
    if (i % 2 === 0) return p;
    const g = glossary.find((x) => x.w.toLowerCase() === p.toLowerCase());
    return <button key={i} type="button" className="gloss" onClick={() => onPick(g)}>{p}</button>;
  });
}

function Play({ t }) {
  const s = useStore();
  const [step, setStep] = useState(0);
  const [gloss, setGloss] = useState(null);
  const ideas = useMemo(() => shuffle(t.ideas), [t]);
  const sums = useMemo(() => shuffle(t.summaries), [t]);
  const [picked, setPicked] = useState([]);
  const [ideasChecked, setIdeasChecked] = useState(false);
  const [sumWrong, setSumWrong] = useState([]);
  const [sumOk, setSumOk] = useState(false);
  const [text, setText] = useState(s.summaries[t.id]?.text || '');
  const [sent, setSent] = useState(false);
  const [ai, setAi] = useState({ state: 'idle' });
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);
  const check = checkSummary(text, t);
  const model = t.summaries.find((x) => x.ok);

  useEffect(() => stopSpeaking, []);
  useEffect(() => { if (step === 3) aiStatus().then((ok) => setAi((a) => (a.state === 'idle' ? { state: ok ? 'ready' : 'off' } : a))); }, [step]);

  const gain = (n) => { if (n > 0) { addXp(n); setXp((x) => x + n); } };

  function checkIdeas() {
    const good = picked.filter((i) => ideas[i].ok).length;
    setIdeasChecked(true);
    sfx(good === 3 ? 'ok' : 'pop');
    gain(good * 5);
  }

  function pickSummary(i) {
    if (sumOk || sumWrong.includes(i)) return;
    if (sums[i].ok) {
      sfx('ok');
      setSumOk(true);
      if (!sumWrong.length) gain(10);
    } else {
      sfx('fail');
      setSumWrong([...sumWrong, i]);
    }
  }

  function finish(written) {
    update((st) => { st.summaries[t.id] = { done: true, written: written || !!st.summaries[t.id]?.written, text: written ? text : st.summaries[t.id]?.text || '' }; });
    bumpStats({ summaries: 1 });
    completeSetlist('summary', t.id);
    setFinished(true);
  }

  async function submit() {
    const passed = check.items.filter((i) => i.ok).length;
    const pts = passed === check.items.length ? 30 : passed >= 3 ? 15 : 5;
    setSent(true);
    sfx(pts === 30 ? 'ok' : 'pop');
    gain(pts);
    finish(true);
    if (ai.state === 'ready') {
      setAi({ state: 'loading' });
      try {
        const res = await aiSummary({ title: t.title, source: t.paragraphs.join('\n\n'), summary: text });
        setAi({ state: 'done', res });
      } catch {
        setAi({ state: 'error' });
      }
    }
  }

  return (
    <div className="summary-play">
      <TopBar title={t.title} backTo="summary" />
      <ol className="stepper" aria-label="Passi">
        {STEPS.map((l, i) => <li key={l} className={i === step ? 'now' : i < step ? 'past' : ''}>{l}</li>)}
      </ol>

      {step === 0 && (
        <section className="reading">
          <p className="muted small">Tocca le parole sottolineate per la traduzione.</p>
          {t.paragraphs.map((p, i) => (
            <div key={i} className="reading-p">
              <p><Glossed text={p} glossary={t.glossary} onPick={setGloss} /></p>
              <SpeakButton text={p} label="Ascolta il paragrafo" />
            </div>
          ))}
          {gloss && (
            <div className="gloss-bar" role="status">
              <strong>{gloss.w}</strong> {gloss.it}
              <button type="button" onClick={() => setGloss(null)} aria-label="Chiudi"><Icon name="x" size={16} /></button>
            </div>
          )}
          <Button onClick={() => { setStep(1); setGloss(null); stopSpeaking(); }}>Ho letto: trova le idee</Button>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="section-title">Scegli le 3 idee principali</h2>
          <p className="muted">Attenzione: alcune frasi sono false, altre sono vere ma sono solo dettagli.</p>
          <ul className="ideas">
            {ideas.map((idea, i) => {
              const on = picked.includes(i);
              const cls = ideasChecked ? (idea.ok ? 'is-right' : on ? 'is-wrong' : 'is-dim') : on ? 'on' : '';
              return (
                <li key={i}>
                  <button type="button" className={`idea ${cls}`} aria-pressed={on} disabled={ideasChecked}
                    onClick={() => setPicked(on ? picked.filter((x) => x !== i) : picked.length < 3 ? [...picked, i] : picked)}>
                    {idea.text}
                  </button>
                  {ideasChecked && (on || idea.ok) && <p className="idea-fb">{idea.fb}</p>}
                </li>
              );
            })}
          </ul>
          {!ideasChecked
            ? <Button onClick={checkIdeas} disabled={picked.length !== 3}>Controlla ({picked.length}/3)</Button>
            : <Button onClick={() => setStep(2)}>Avanti: scegli il riassunto</Button>}
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="section-title">Qual è il riassunto migliore?</h2>
          <ul className="sums">
            {sums.map((x, i) => {
              const cls = sumWrong.includes(i) ? 'is-wrong' : sumOk && x.ok ? 'is-right' : sumOk ? 'is-dim' : '';
              return (
                <li key={i}>
                  <button type="button" className={`sum ${cls}`} onClick={() => pickSummary(i)} disabled={sumOk || sumWrong.includes(i)}>{x.text}</button>
                  {(sumWrong.includes(i) || (sumOk && x.ok)) && <p className="idea-fb">{x.fb}</p>}
                </li>
              );
            })}
          </ul>
          {sumOk && <Button onClick={() => setStep(3)}>Avanti: scrivi il tuo</Button>}
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="section-title">Ora scrivilo tu</h2>
          <p className="muted">In inglese, con parole tue. Il testo resta qui sotto se ti serve.</p>
          <details className="source">
            <summary>Rileggi il testo</summary>
            {t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </details>
          <textarea className="writer" value={text} onChange={(e) => setText(e.target.value)} disabled={sent} rows={7}
            placeholder="The text is about…" aria-label="Il tuo riassunto" spellCheck="true" lang="en" />
          <ul className="checklist">
            {check.items.map((c) => (
              <li key={c.id} className={c.ok ? 'ok' : ''}><Icon name={c.ok ? 'check' : 'x'} size={16} stroke={3} /> {c.label}</li>
            ))}
          </ul>
          {!sent ? (
            <div className="end-actions">
              <Button onClick={submit} disabled={check.count < 10}>Consegna il riassunto</Button>
              {!finished && <button type="button" className="link-btn light" onClick={() => finish(false)}>Salta per oggi</button>}
            </div>
          ) : (
            <div className="after">
              {ai.state === 'loading' && <p className="muted">{CONFIG.ai.tutorName} sta leggendo il tuo riassunto…</p>}
              {ai.state === 'error' && <p className="muted">{CONFIG.ai.tutorName} non risponde adesso. Il riassunto conta lo stesso.</p>}
              {ai.state === 'done' && ai.res && (
                <article className="ai-card">
                  <header><strong>{CONFIG.ai.tutorName}</strong><span className="ai-score">{ai.res.score}/10</span></header>
                  {ai.res.good && <p><b>Bene:</b> {ai.res.good}</p>}
                  {Array.isArray(ai.res.fix) && ai.res.fix.length > 0 && <ul>{ai.res.fix.map((f, i) => <li key={i}>{f}</li>)}</ul>}
                  {ai.res.better && <p className="ai-better">{ai.res.better}</p>}
                  {ai.res.tip && <p className="muted">{ai.res.tip}</p>}
                </article>
              )}
              <h3 className="section-title">Un riassunto modello</h3>
              <p className="model">{model.text}</p>
            </div>
          )}
        </section>
      )}

      {finished && (
        <section className="summary-done">
          <p className="jam-end-xp">Testo completato: +{xp} XP</p>
          <div className="end-actions">
            <Button to="summary">Altri testi</Button>
            <Button to="home" variant="ghost">Torna al palco</Button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function Summary({ params }) {
  const t = params.id && textById(params.id);
  return t ? <Play t={t} /> : <List />;
}

