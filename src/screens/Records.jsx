import { useState } from 'react';
import { TOPICS } from '../content/topics.js';
import { BOOK } from '../content/book.js';
import { VOCAB } from '../content/vocab.js';
import { useStore, setSetting, resetAll } from '../lib/store.js';
import { levelInfo, liveStreak, mastery, wordsLearned, ACHIEVEMENTS } from '../lib/progress.js';
import { go } from '../lib/router.js';
import { aiStatus } from '../lib/ai.js';
import { speak } from '../lib/speech.js';
import { CONFIG } from '../config.js';
import { plural } from '../lib/util.js';
import { Fader, Vinyl, Footer, Button } from '../components/ui.jsx';

function Toggle({ label, on, onChange }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-ui" aria-hidden="true" />
    </label>
  );
}

export default function Records() {
  const s = useStore();
  const info = levelInfo(s.xp);
  const [ai, setAi] = useState('');
  const [confirm, setConfirm] = useState(0);
  const acc = s.stats.answers ? Math.round((s.stats.correct / s.stats.answers) * 100) : 0;
  const unlocked = ACHIEVEMENTS.filter((a) => s.unlocked[a.id]).length;

  const stats = [
    ['XP totali', s.xp],
    ['Livello', `${info.level}: ${info.name}`],
    ['Serie attuale', plural(liveStreak(s), 'giorno', 'giorni')],
    ['Serie record', plural(s.bestStreak, 'giorno', 'giorni')],
    ['Risposte giuste', `${acc}% di ${s.stats.answers}`],
    ['Parole imparate', `${wordsLearned(s)} su ${VOCAB.length}`],
    ['Capitoli letti', `${Object.keys(s.read).length} su ${BOOK.length}`],
    ['Record Drill', s.stats.bestBpm ? `${s.stats.bestBpm} BPM` : '–'],
  ];

  return (
    <div className="records">
      <h1 className="page-title">Dischi</h1>

      <dl className="stat-grid">
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <section className="mixer-wrap">
        <h2 className="section-title">Il mixer</h2>
        <p className="muted small">Ogni fader è un argomento: sale con le ultime risposte giuste. Toccalo per allenarti.</p>
        <div className="mixer">
          {TOPICS.map((t) => {
            const m = mastery(s, t.id);
            return <Fader key={t.id} label={t.short} value={m.acc} empty={!m.n} onClick={() => go('drill', { topic: t.id })} />;
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Lo scaffale <span className="muted">{unlocked}/{ACHIEVEMENTS.length}</span></h2>
        <div className="shelf">
          {ACHIEVEMENTS.map((a) => <Vinyl key={a.id} {...a} unlocked={!!s.unlocked[a.id]} />)}
        </div>
      </section>

      <section className="settings">
        <h2 className="section-title">Impostazioni</h2>
        <Toggle label="Suoni" on={s.settings.sound} onChange={(v) => setSetting('sound', v)} />
        <Toggle label="Metronomo nel Drill" on={s.settings.metronome} onChange={(v) => setSetting('metronome', v)} />
        <div className="setting-row">
          <span>Voce inglese</span>
          <div className="segmented small">
            {[[0.75, 'Lenta'], [0.95, 'Normale']].map(([r, l]) => (
              <button key={r} type="button" className={s.settings.rate === r ? 'on' : ''} onClick={() => { setSetting('rate', r); setTimeout(() => speak('Hello! This is my English voice.', { rate: r }), 50); }}>{l}</button>
            ))}
          </div>
        </div>
        <div className="setting-row">
          <span>Tutor {CONFIG.ai.tutorName}</span>
          <button type="button" className="link-btn light" onClick={async () => { setAi('…'); setAi((await aiStatus(true)) ? 'collegato' : 'non collegato'); }}>
            {ai ? `Stato: ${ai}` : 'Controlla'}
          </button>
        </div>
        <div className="setting-row danger">
          <span>Azzera tutti i progressi</span>
          {confirm === 0 && <button type="button" className="link-btn light" onClick={() => setConfirm(1)}>Azzera</button>}
          {confirm === 1 && <Button variant="danger" onClick={() => { resetAll(); setConfirm(0); go('home'); }}>Sì, cancella tutto</Button>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
