// Pronuncia (Web Speech API) e riconoscimento vocale opzionale
import { CONFIG } from '../config.js';

let voice = null;
let rate = CONFIG.voice.rate;
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export const setVoiceRate = (r) => { rate = r; };

function pickVoice() {
  if (!canSpeak()) return null;
  const voices = window.speechSynthesis.getVoices();
  const lang = CONFIG.voice.lang.toLowerCase();
  voice = voices.find((v) => v.lang.toLowerCase() === lang && /natural|google|daniel|serena|kate/i.test(v.name))
    || voices.find((v) => v.lang.toLowerCase() === lang)
    || voices.find((v) => v.lang.toLowerCase().startsWith('en'))
    || null;
  return voice;
}
if (canSpeak()) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text, opts = {}) {
  if (!canSpeak() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, '"').replace(/’/g, "'"));
  u.lang = CONFIG.voice.lang;
  if (voice || pickVoice()) u.voice = voice;
  u.rate = opts.rate || rate;
  synth.speak(u);
}

export const stopSpeaking = () => canSpeak() && window.speechSynthesis.cancel();

export function getRecognition() {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return null;
  const r = new SR();
  r.lang = CONFIG.voice.lang;
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}
