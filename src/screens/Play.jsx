import { useStore } from '../lib/store.js';
import { href } from '../lib/router.js';
import { wordsDue, wordsNew } from '../lib/progress.js';
import { DIALOGUES } from '../content/dialogues.js';
import { TEXTS } from '../content/texts.js';
import { CONFIG } from '../config.js';
import { Footer } from '../components/ui.jsx';

export default function Play() {
  const s = useStore();
  const due = wordsDue(s);
  const fresh = wordsNew(s);
  const dDone = DIALOGUES.filter((d) => s.dialogues[d.id]?.done).length;
  const tDone = TEXTS.filter((t) => s.summaries[t.id]?.done).length;

  const games = [
    { path: 'drill', cls: 'g-drill', title: 'Drill a tempo', desc: 'Grammatica sui pad della batteria. Più indovini, più accelera.', meta: s.stats.bestBpm ? `Record: ${s.stats.bestBpm} BPM` : 'Mai suonato' },
    { path: 'bricks', cls: 'g-bricks', title: 'Costruisci la frase', desc: 'Metti i mattoncini nell’ordine giusto.', meta: `${s.stats.bricks} frasi costruite` },
    { path: 'vocab', cls: 'g-vocab', title: 'Parole', desc: 'Carte che tornano quando stai per dimenticarle.', meta: due ? `${due} da ripassare` : `${fresh} parole nuove` },
    { path: 'dialogues', cls: 'g-jam', title: 'Jam', desc: 'Dialoghi: scegli la risposta giusta e tieni viva la conversazione.', meta: `${dDone} su ${DIALOGUES.length} completati` },
    { path: 'summary', cls: 'g-summary', title: 'Riassunti', desc: 'Leggi, trova le idee, scrivi con parole tue.', meta: `${tDone} su ${TEXTS.length} testi` },
    { path: 'chat', cls: 'g-chat', title: `Parla con ${CONFIG.ai.tutorName}`, desc: `Chat in inglese con un ${CONFIG.ai.tutorRole} virtuale che ti corregge.`, meta: 'Tutor AI' },
  ];

  return (
    <div className="play">
      <h1 className="page-title">Gioca</h1>
      <div className="games">
        {games.map((g) => (
          <a key={g.path} className={`game ${g.cls}`} href={href(g.path)}>
            <span className="game-art" aria-hidden="true" />
            <strong className="game-title">{g.title}</strong>
            <span className="game-desc">{g.desc}</span>
            <span className="game-meta">{g.meta}</span>
          </a>
        ))}
      </div>
      <Footer />
    </div>
  );
}
