// Router a hash (#/percorso?param=valore): funziona su Netlify e offline senza configurare redirect
import { useSyncExternalStore } from 'react';

function parse() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = h.split('?');
  return { path: path || 'home', params: Object.fromEntries(new URLSearchParams(qs)) };
}

let current = parse();
let key = window.location.hash;
const subs = new Set();
window.addEventListener('hashchange', () => {
  current = parse();
  key = window.location.hash;
  subs.forEach((f) => f());
});

export function useRoute() {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => key);
  return current;
}

export function href(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return `#/${path}${qs ? `?${qs}` : ''}`;
}

export function go(path, params = {}) {
  const h = href(path, params);
  if (h === window.location.hash) return;
  window.location.hash = h;
}
