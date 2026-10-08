// Stato globale persistito in localStorage. Un solo oggetto, aggiornato in modo immutabile,
// letto dai componenti con useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import { CONFIG } from '../config.js';
import { dayKey, addDays } from './util.js';
import { levelInfo, newlyUnlocked, buildSetlist, MASTERY_WINDOW } from './progress.js';
import { sfx } from './audio.js';

const defaults = () => ({
  v: 1,
  xp: 0,
  lastDay: null,
  streak: 0,
  bestStreak: 0,
  mastery: {},
  vocab: {},
  stats: { answers: 0, correct: 0, bestCombo: 0, bestBpm: 0, drills: 0, bricks: 0, words: 0, dialogues: 0, summaries: 0, chats: 0, setlists: 0 },
  read: {},
  lastChapter: null,
  dialogues: {},
  summaries: {},
  unlocked: {},
  setlist: null,
  days: {},
  settings: { sound: true, metronome: true, rate: CONFIG.voice.rate },
});

function load() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return defaults();
    const saved = JSON.parse(raw);
    const d = defaults();
    // merge superficiale: le chiavi nuove aggiunte in futuro prendono il default
    return { ...d, ...saved, stats: { ...d.stats, ...saved.stats }, settings: { ...d.settings, ...saved.settings } };
  } catch {
    return defaults();
  }
}

let state = load();
const listeners = new Set();
let saveTimer = null;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch { /* storage pieno o privato */ }
  }, 50);
}

export const getState = () => state;
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function useStore(selector = (s) => s) {
  return selector(useSyncExternalStore(subscribe, getState, getState));
}

function set(next) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

// update(fn): fn riceve una copia profonda e la modifica
export function update(fn) {
  const draft = structuredClone(state);
  fn(draft);
  set(draft);
  checkAchievements();
}

// ── Toast (livello, trofei, setlist) ───────────────────────
const toastListeners = new Set();
export const onToast = (fn) => { toastListeners.add(fn); return () => toastListeners.delete(fn); };
export function toast(t) {
  const item = { id: Math.random().toString(36).slice(2), ...t };
  toastListeners.forEach((l) => l(item));
}

function checkAchievements() {
  const fresh = newlyUnlocked(state);
  if (!fresh.length) return;
  const draft = structuredClone(state);
  const today = dayKey();
  fresh.forEach((a) => { draft.unlocked[a.id] = today; });
  set(draft);
  fresh.forEach((a) => toast({ kind: 'trophy', title: 'Nuovo disco', sub: a.name, color: a.color }));
}

// ── Azioni ───────────────────────────────────────────────────
export function addXp(n) {
  if (!n || n <= 0) return;
  const before = levelInfo(state.xp).level;
  const today = dayKey();
  update((s) => {
    s.xp += n;
    s.days[today] = (s.days[today] || 0) + n;
    if (s.lastDay !== today) {
      s.streak = s.lastDay === addDays(today, -1) ? s.streak + 1 : 1;
      s.lastDay = today;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    }
  });
  const info = levelInfo(state.xp);
  if (info.level > before) {
    sfx('levelUp');
    toast({ kind: 'level', title: `Livello ${info.level}`, sub: `${info.name}, ora suoni a ${info.bpm} BPM`, color: 'yellow' });
  }
}

export function recordAnswer(topic, ok) {
  update((s) => {
    const arr = s.mastery[topic] || [];
    arr.push(ok ? 1 : 0);
    s.mastery[topic] = arr.slice(-MASTERY_WINDOW);
    s.stats.answers++;
    if (ok) s.stats.correct++;
  });
}

export function bumpStats(patch) {
  update((s) => {
    Object.entries(patch).forEach(([k, v]) => {
      if (k.startsWith('max:')) {
        const key = k.slice(4);
        s.stats[key] = Math.max(s.stats[key] || 0, v);
      } else {
        s.stats[k] = (s.stats[k] || 0) + v;
      }
    });
  });
}

export function setSetting(key, value) {
  update((s) => { s.settings[key] = value; });
}

// La setlist si genera una volta al giorno e resta fissa
export function ensureSetlist() {
  const today = dayKey();
  if (state.setlist?.day === today) return state.setlist;
  const sl = buildSetlist(state, today);
  update((s) => { s.setlist = sl; });
  return sl;
}

// Segna come fatta la voce della setlist che corrisponde (kind + ref; ref null = qualsiasi)
export function completeSetlist(kind, ref = null) {
  const sl = state.setlist;
  if (!sl || sl.day !== dayKey()) return;
  const idx = sl.items.findIndex((i) => !i.done && i.kind === kind && (i.ref === null || i.ref === ref));
  if (idx < 0) return;
  let finished = false;
  update((s) => {
    s.setlist.items[idx].done = true;
    if (!s.setlist.bonus && s.setlist.items.every((i) => i.done)) {
      s.setlist.bonus = true;
      s.stats.setlists++;
      finished = true;
    }
  });
  toast({ kind: 'setlist', title: `${sl.items[idx].slot} fatta`, sub: sl.items[idx].title, color: 'green' });
  if (finished) {
    addXp(60);
    toast({ kind: 'setlist', title: 'Setlist completa!', sub: '+60 XP bonus', color: 'yellow' });
  }
}

export function resetAll() {
  try { localStorage.removeItem(CONFIG.storageKey); } catch { /* niente */ }
  set(defaults());
}

// Per i test e il debug dalla console
if (typeof window !== 'undefined') window.__backbeat = { getState, update, addXp, resetAll };
