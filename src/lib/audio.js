// Suoni sintetizzati con Web Audio: niente file da scaricare, funziona offline.
let ctx = null;
let noise = null;
const prefs = { sound: true, metronome: true };

export function configureAudio(p) { Object.assign(prefs, p); }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// iOS e Chrome vogliono un gesto dell'utente prima di suonare
export function unlockAudio() {
  const c = ac();
  if (!c) return;
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
}

function noiseBuffer(c) {
  if (noise) return noise;
  noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function env(c, t, peak, decay) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  g.connect(c.destination);
  return g;
}

function tone(c, t, { type = 'sine', f0, f1 = f0, dur, peak = 0.3 }) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  o.connect(env(c, t, peak, dur));
  o.start(t);
  o.stop(t + dur + 0.05);
}

function hiss(c, t, { filter = 'highpass', freq = 7000, dur = 0.05, peak = 0.25, q = 1 }) {
  const s = c.createBufferSource();
  s.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  s.connect(f);
  f.connect(env(c, t, peak, dur));
  s.start(t);
  s.stop(t + dur + 0.05);
}

const SOUNDS = {
  kick: (c, t) => tone(c, t, { f0: 150, f1: 42, dur: 0.35, peak: 0.9 }),
  snare: (c, t) => { hiss(c, t, { freq: 1200, dur: 0.18, peak: 0.45 }); tone(c, t, { type: 'triangle', f0: 190, f1: 150, dur: 0.1, peak: 0.25 }); },
  hat: (c, t) => hiss(c, t, { freq: 8000, dur: 0.06, peak: 0.3 }),
  tom: (c, t) => tone(c, t, { f0: 240, f1: 110, dur: 0.3, peak: 0.6 }),
  click: (c, t) => tone(c, t, { type: 'square', f0: 1400, dur: 0.025, peak: 0.08 }),
  accent: (c, t) => tone(c, t, { type: 'square', f0: 2000, dur: 0.03, peak: 0.12 }),
  ok: (c, t) => { tone(c, t, { f0: 660, dur: 0.12, peak: 0.2 }); tone(c, t + 0.08, { f0: 990, dur: 0.18, peak: 0.2 }); },
  fail: (c, t) => tone(c, t, { type: 'sawtooth', f0: 210, f1: 110, dur: 0.3, peak: 0.12 }),
  snap: (c, t) => { hiss(c, t, { filter: 'bandpass', freq: 2500, dur: 0.04, peak: 0.5, q: 3 }); tone(c, t, { type: 'square', f0: 900, dur: 0.02, peak: 0.05 }); },
  pop: (c, t) => tone(c, t, { f0: 520, f1: 780, dur: 0.08, peak: 0.15 }),
  levelUp: (c, t) => [523, 659, 784, 1047].forEach((f, i) => tone(c, t + i * 0.09, { type: 'triangle', f0: f, dur: 0.25, peak: 0.2 })),
};

export function sfx(name) {
  if (!prefs.sound) return;
  if ((name === 'click' || name === 'accent') && !prefs.metronome) return;
  const c = ac();
  if (!c || !SOUNDS[name]) return;
  try { SOUNDS[name](c, c.currentTime + 0.001); } catch { /* audio non disponibile */ }
}
