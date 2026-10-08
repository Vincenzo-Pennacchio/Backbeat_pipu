// Client per la funzione Netlify del tutor (Theo). Se la funzione non c'è o non è configurata, l'app funziona lo stesso.
import { CONFIG } from '../config.js';

let status = null; // null = non verificato, true/false
export async function aiStatus(force = false) {
  if (status !== null && !force) return status;
  try {
    const r = await fetch(CONFIG.ai.endpoint, { method: 'GET' });
    if (!r.ok) { status = false; return status; }
    const j = await r.json();
    status = !!j.configured;
  } catch {
    status = false;
  }
  return status;
}

async function post(body) {
  const r = await fetch(CONFIG.ai.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Errore ${r.status}`);
  return j;
}

export const aiChat = (messages) => post({ mode: 'chat', messages: messages.slice(-16) });
export const aiSummary = ({ title, source, summary }) => post({ mode: 'summary', title, source, summary });
