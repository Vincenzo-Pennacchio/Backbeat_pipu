// Tutto ciò che è personale sta qui: per rifare l'app per qualcun altro basta cambiare questo file
// (e i contenuti in src/content se servono interessi diversi).
export const CONFIG = {
  learner: 'Pipu',
  from: 'zio Vincenzo',
  appName: 'Backbeat',
  storageKey: 'bb_pipu_v1',
  voice: { lang: 'en-GB', rate: 0.95 },
  ai: {
    endpoint: '/.netlify/functions/chat',
    tutorName: 'Theo',
    tutorRole: 'bassista jazz',
  },
};
