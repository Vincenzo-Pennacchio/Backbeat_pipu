// Logica pura del progresso: livelli (= tempo in BPM), padronanza per argomento, trofei, setlist del giorno.
import { TOPICS, topicById } from '../content/topics.js';
import { BOOK } from '../content/book.js';
import { VOCAB } from '../content/vocab.js';
import { DIALOGUES } from '../content/dialogues.js';
import { TEXTS } from '../content/texts.js';
import { dayKey, addDays, rng, hash, shuffle } from './util.js';

// ── Livelli ──────────────────────────────────────────────────
export const LEVEL_NAMES = ['Garage', 'Sala prove', 'Jam session', 'Open mic', 'Club', 'Session drummer', 'Festival', 'Tour', 'Headliner', 'Leggenda'];
export const threshold = (level) => 50 * (level - 1) * level; // XP necessari per arrivare al livello
export const levelName = (level) => (level <= LEVEL_NAMES.length ? LEVEL_NAMES[level - 1] : `Leggenda ${level - LEVEL_NAMES.length + 1}`);
export const bpmFor = (level) => 60 + 10 * (level - 1);

export function levelInfo(xp) {
  let level = 1;
  while (xp >= threshold(level + 1)) level++;
  const from = threshold(level);
  const to = threshold(level + 1);
  return { level, name: levelName(level), bpm: bpmFor(level), from, to, progress: (xp - from) / (to - from) };
}

// ── Padronanza (ultime 20 risposte per argomento) ───────────
export const MASTERY_WINDOW = 20;
export function mastery(state, topic) {
  const arr = state.mastery[topic] || [];
  const n = arr.length;
  return { n, acc: n ? arr.reduce((a, b) => a + b, 0) / n : 0 };
}

// ── Parole ───────────────────────────────────────────────────
export const LEARNED_BOX = 3;
export const INTERVALS = [1, 2, 4, 8, 16, 32]; // giorni, per box 1..6
export const wordsLearned = (state) => Object.values(state.vocab).filter((c) => c.box >= LEARNED_BOX).length;
export const wordsDue = (state, today = dayKey()) => VOCAB.filter((v) => state.vocab[v.id] && state.vocab[v.id].due <= today).length;
export const wordsNew = (state) => VOCAB.filter((v) => !state.vocab[v.id]).length;

export function gradeCard(card, grade, today = dayKey()) {
  const box = card?.box || 0;
  const seen = (card?.seen || 0) + 1;
  if (grade === 'no') return { box: 1, due: today, seen };
  if (grade === 'almost') return { box: Math.max(1, box), due: addDays(today, 1), seen };
  const nb = Math.min(INTERVALS.length, box + 1);
  return { box: nb, due: addDays(today, INTERVALS[nb - 1]), seen };
}

// ── Streak ───────────────────────────────────────────────────
// La streak mostrata vale solo se l'ultima attività è di oggi o di ieri
export function liveStreak(state, today = dayKey()) {
  if (!state.lastDay) return 0;
  return state.lastDay === today || state.lastDay === addDays(today, -1) ? state.streak : 0;
}

// ── Trofei (i "dischi" sullo scaffale) ─────────────────────
const readCount = (s) => Object.keys(s.read).length;
export const ACHIEVEMENTS = [
  { id: 'first', name: 'Primo colpo', desc: 'Guadagna i tuoi primi XP.', color: 'red', test: (s) => s.xp > 0 },
  { id: 'pocket', name: 'In the pocket', desc: 'Fai una combo di 10 risposte giuste nel Drill.', color: 'yellow', test: (s) => s.stats.bestCombo >= 10 },
  { id: 'allegro', name: 'Allegro', desc: 'Arriva a 120 BPM nel Drill.', color: 'sky', test: (s) => s.stats.bestBpm >= 120 },
  { id: 'presto', name: 'Presto', desc: 'Arriva a 150 BPM nel Drill.', color: 'red', test: (s) => s.stats.bestBpm >= 150 },
  { id: 'builder', name: 'Capocantiere', desc: 'Costruisci 25 frasi con i mattoncini.', color: 'yellow', test: (s) => s.stats.bricks >= 25 },
  { id: 'words', name: 'Dizionario vivente', desc: 'Impara 40 parole (riviste almeno 3 volte).', color: 'green', test: (s) => wordsLearned(s) >= 40 },
  { id: 'jam', name: 'Jam session', desc: 'Completa tutti i dialoghi.', color: 'sky', test: (s) => DIALOGUES.every((d) => s.dialogues[d.id]?.done) },
  { id: 'critic', name: 'Critico musicale', desc: 'Completa tutti i riassunti.', color: 'green', test: (s) => TEXTS.every((t) => s.summaries[t.id]?.done) },
  { id: 'liner', name: 'Note di copertina', desc: 'Leggi 7 capitoli del libro.', color: 'yellow', test: (s) => readCount(s) >= 7 },
  { id: 'fullbook', name: 'Lato A e lato B', desc: 'Leggi tutti i capitoli del libro.', color: 'red', test: (s) => BOOK.every((c) => s.read[c.id]) },
  { id: 'streak3', name: 'Tre giorni a tempo', desc: 'Allenati 3 giorni di fila.', color: 'green', test: (s) => s.bestStreak >= 3 },
  { id: 'streak7', name: 'Una settimana a tempo', desc: 'Allenati 7 giorni di fila.', color: 'sky', test: (s) => s.bestStreak >= 7 },
  { id: 'streak30', name: 'Un mese a tempo', desc: 'Allenati 30 giorni di fila.', color: 'red', test: (s) => s.bestStreak >= 30 },
  { id: 'setlist', name: 'Setlist chiusa', desc: 'Completa tutta la setlist di un giorno.', color: 'yellow', test: (s) => s.stats.setlists >= 1 },
  { id: 'fourth', name: 'Il “quarto” condizionale', desc: 'Almeno 80% sui condizionali misti (minimo 8 risposte).', color: 'green', test: (s) => { const m = mastery(s, 'mixed'); return m.n >= 8 && m.acc >= 0.8; } },
];

export const newlyUnlocked = (state) => ACHIEVEMENTS.filter((a) => !state.unlocked[a.id] && a.test(state));

// ── Setlist di oggi ─────────────────────────────────────────
// A1 = grammatica sul punto più debole, A2 = parole o mattoncini, B1 = un dialogo o un riassunto
export function weakestTopic(state) {
  const score = (t) => {
    const m = mastery(state, t.id);
    if (!m.n) return t.isNew ? -1 : 0.4; // mai visto: prima le novità
    return m.acc;
  };
  return TOPICS.slice().sort((a, b) => score(a) - score(b))[0];
}

export function buildSetlist(state, today = dayKey()) {
  const r = rng(hash(today));
  const weak = weakestTopic(state);
  const chapter = BOOK.find((c) => c.id === weak.chapter);
  const a1 = mastery(state, weak.id).n === 0 && !state.read[chapter.id] && weak.isNew
    ? { slot: 'A1', kind: 'read', ref: chapter.id, title: `Leggi: ${chapter.title}`, sub: 'Capitolo del libro, poi il Drill' }
    : { slot: 'A1', kind: 'drill', ref: weak.id, title: `Drill: ${weak.name}`, sub: 'Il tuo punto più debole adesso' };

  const day = Number(today.slice(-2));
  const due = wordsDue(state, today);
  const a2 = day % 2 === 0 || due >= 8
    ? { slot: 'A2', kind: 'vocab', ref: null, title: 'Parole: una sessione', sub: due ? `${due} da ripassare oggi` : '10 carte' }
    : { slot: 'A2', kind: 'bricks', ref: null, title: 'Costruisci 6 frasi', sub: 'Mattoncini in ordine' };

  const useDialogue = day % 2 === 1;
  const pick = (list, doneMap) => list.find((x) => !doneMap[x.id]?.done) || shuffle(list, r)[0];
  const b1 = useDialogue
    ? (() => { const d = pick(DIALOGUES, state.dialogues); return { slot: 'B1', kind: 'dialogue', ref: d.id, title: `Jam: ${d.title}`, sub: `Dialogo con ${d.who}` }; })()
    : (() => { const t = pick(TEXTS, state.summaries); return { slot: 'B1', kind: 'summary', ref: t.id, title: `Riassunto: ${t.it}`, sub: 'Leggi, scegli, scrivi' }; })();

  return { day: today, items: [a1, a2, b1].map((i) => ({ ...i, done: false })), bonus: false };
}

// Dove porta ogni voce della setlist
export function setlistTarget(item) {
  switch (item.kind) {
    case 'read': return ['chapter', { id: item.ref }];
    case 'drill': return ['drill', { topic: item.ref }];
    case 'vocab': return ['vocab', {}];
    case 'bricks': return ['bricks', {}];
    case 'dialogue': return ['dialogue', { id: item.ref }];
    case 'summary': return ['summary', { id: item.ref }];
    default: return ['play', {}];
  }
}

export const topicLabel = (id) => topicById(id)?.name || 'Tutti gli argomenti';
