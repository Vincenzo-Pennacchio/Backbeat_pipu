// Argomenti di grammatica: collegano Drill, mattoncini, libro e padronanza (mixer)
export const TOPICS = [
  { id: 'be-have', name: 'To be e to have', short: 'Be/Have', chapter: 'a1' },
  { id: 'present', name: 'Present simple e in/on/at', short: 'Present', chapter: 'a2' },
  { id: 'continuous', name: 'Present continuous', short: 'Contin.', chapter: 'a3' },
  { id: 'stative', name: 'Verbi di stato e dei sensi', short: 'Stati', chapter: 'a4' },
  { id: 'past', name: 'Past simple, was e were', short: 'Past', chapter: 'a5' },
  { id: 'pastperf', name: 'Past perfect', short: 'P. perf.', chapter: 'a6' },
  { id: 'cond', name: 'Condizionali 0–3', short: 'Cond.', chapter: 'a7' },
  { id: 'future', name: 'I futuri', short: 'Futuri', chapter: 'b1', isNew: true },
  { id: 'mixed', name: 'Condizionali misti', short: 'Misti', chapter: 'b2', isNew: true },
  { id: 'phrasal', name: 'Phrasal verbs', short: 'Phrasal', chapter: 'b3', isNew: true },
  { id: 'sentence', name: 'Costruire le frasi', short: 'Frasi', chapter: 'b4', isNew: true },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);
