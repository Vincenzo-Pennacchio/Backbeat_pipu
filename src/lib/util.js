// Piccole utility condivise
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const pad = (n) => String(n).padStart(2, '0');
// Data locale (non UTC): il "giorno" è quello del telefono di Pipu
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDay = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (k, n) => {
  const d = parseDay(k);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
export const dayDiff = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);

// PRNG deterministico (mulberry32) per la setlist del giorno
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prima lettera maiuscola + punto finale (o ?), per mostrare le frasi dei mattoncini
export function sentence(s, question = false) {
  const t = s.trim();
  if (!t) return t;
  const cap = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(cap) ? cap : cap + (question ? '?' : '.');
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
