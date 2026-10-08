// Controlli sui contenuti: gira prima di ogni build (npm run build) e blocca il deploy se qualcosa non torna.
import { TOPICS } from '../src/content/topics.js';
import { BOOK } from '../src/content/book.js';
import { DRILL } from '../src/content/drill.js';
import { BRICKS, norm } from '../src/content/bricks.js';
import { VOCAB, DECKS } from '../src/content/vocab.js';
import { DIALOGUES } from '../src/content/dialogues.js';
import { TEXTS, checkSummary } from '../src/content/texts.js';

const errors = [];
const err = (m) => errors.push(m);
const topicIds = new Set(TOPICS.map((t) => t.id));
const chapterIds = new Set(BOOK.map((c) => c.id));

// Argomenti → capitoli
TOPICS.forEach((t) => { if (!chapterIds.has(t.chapter)) err(`Topic ${t.id}: capitolo ${t.chapter} inesistente`); });

// Libro
const slugs = new Set();
const BLOCKS = new Set(['h', 'p', 'table', 'ex', 'steps', 'tip', 'wrong', 'check']);
BOOK.forEach((c) => {
  if (slugs.has(c.slug)) err(`Slug duplicato ${c.slug}`);
  slugs.add(c.slug);
  if (!c.title || !c.intro || !c.blocks.length) err(`Capitolo ${c.id} incompleto`);
  if (!c.practice?.path) err(`Capitolo ${c.id} senza pratica`);
  c.blocks.forEach((b, i) => {
    if (!BLOCKS.has(b.t)) err(`${c.id} blocco ${i}: tipo ${b.t} sconosciuto`);
    if (b.t === 'table') b.rows.forEach((r, j) => { if (r.length !== b.head.length) err(`${c.id} tabella ${i} riga ${j}: ${r.length} celle invece di ${b.head.length}`); });
    if (b.t === 'wrong') b.items.forEach((w) => { if (w.length !== 3) err(`${c.id} wrong: servono 3 campi`); });
    if (['ex', 'check'].includes(b.t)) b.items.forEach((w) => { if (w.length !== 2) err(`${c.id} ${b.t}: servono 2 campi`); });
  });
});

// Drill
const perTopic = {};
DRILL.forEach((d) => {
  if (!topicIds.has(d.topic)) err(`Drill ${d.id}: topic ${d.topic} sconosciuto`);
  if (d.options.length !== 4) err(`Drill ${d.id}: ${d.options.length} opzioni invece di 4`);
  if (new Set(d.options).size !== d.options.length) err(`Drill ${d.id}: opzioni duplicate (${d.q})`);
  if (!d.x) err(`Drill ${d.id}: manca la spiegazione`);
  perTopic[d.topic] = (perTopic[d.topic] || 0) + 1;
});
TOPICS.forEach((t) => { if ((perTopic[t.id] || 0) < 6) err(`Drill: solo ${perTopic[t.id] || 0} domande per ${t.id}`); });

// Mattoncini
BRICKS.forEach((b) => {
  if (!topicIds.has(b.topic)) err(`Bricks ${b.id}: topic sconosciuto`);
  if (!b.accepted.includes(norm(b.bricks.map((x) => x.text).join(' ')))) err(`Bricks ${b.id}: la soluzione non è accettata`);
  b.extras.forEach((e) => { if (b.bricks.some((x) => x.text === e.text)) err(`Bricks ${b.id}: trappola uguale a un pezzo buono (${e.text})`); });
  [...b.bricks, ...b.extras].forEach((x) => { if (!x.cls) err(`Bricks ${b.id}: classe mancante in ${x.text}`); });
});

// Parole
const vIds = new Set();
VOCAB.forEach((v) => {
  if (vIds.has(v.id)) err(`Vocab: id duplicato ${v.id}`);
  vIds.add(v.id);
  if (!DECKS[v.deck]) err(`Vocab ${v.id}: mazzo ${v.deck} sconosciuto`);
  if (!v.en || !v.it || !v.ex) err(`Vocab ${v.id}: campo mancante`);
});

// Dialoghi
DIALOGUES.forEach((d) => {
  if (!topicIds.has(d.topic)) err(`Dialogo ${d.id}: topic sconosciuto`);
  d.turns.forEach((t, i) => {
    const ok = t.options.filter((o) => o.ok).length;
    if (ok !== 1) err(`Dialogo ${d.id} battuta ${i}: ${ok} risposte giuste invece di 1`);
    if (t.options.length !== 3) err(`Dialogo ${d.id} battuta ${i}: servono 3 opzioni`);
    t.options.forEach((o) => { if (!o.fb) err(`Dialogo ${d.id} battuta ${i}: manca feedback`); });
    if (!t.it) err(`Dialogo ${d.id} battuta ${i}: manca la traduzione`);
  });
});

// Testi
TEXTS.forEach((t) => {
  const full = t.paragraphs.join(' ').toLowerCase();
  if (t.ideas.length !== 6 || t.ideas.filter((x) => x.ok).length !== 3) err(`Testo ${t.id}: servono 6 idee con 3 giuste`);
  if (t.summaries.filter((x) => x.ok).length !== 1) err(`Testo ${t.id}: serve esattamente 1 riassunto giusto`);
  t.glossary.forEach((g) => { if (!full.includes(g.w.toLowerCase())) err(`Testo ${t.id}: la parola del glossario "${g.w}" non è nel testo`); });
  // Il riassunto modello deve superare la checklist, quello copiato no
  const model = checkSummary(t.summaries.find((x) => x.ok).text, t);
  const failing = model.items.filter((i) => !i.ok).map((i) => i.id);
  if (failing.length) err(`Testo ${t.id}: il riassunto modello non passa la checklist (${failing.join(', ')})`);
  const copy = checkSummary(t.paragraphs[0], t);
  if (copy.items.find((i) => i.id === 'own').ok) err(`Testo ${t.id}: la copia del primo paragrafo non viene riconosciuta come copia`);
});

const summary = `${BOOK.length} capitoli, ${DRILL.length} domande, ${BRICKS.length} frasi, ${VOCAB.length} parole, ${DIALOGUES.length} dialoghi, ${TEXTS.length} testi`;
if (errors.length) {
  console.error(`✗ Contenuti: ${errors.length} problemi\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ Contenuti ok: ${summary}`);
