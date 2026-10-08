// Tutor AI "Theo" (Netlify Functions v2). Serve la variabile d'ambiente ANTHROPIC_API_KEY.
// GET  → { configured: true/false }  (l'app lo usa per sapere se mostrare la chat)
// POST { mode: 'chat', messages: [{role, content}] }        → { reply }
// POST { mode: 'summary', title, source, summary }          → { score, good, fix[], better, tip }
// ATTENZIONE: l'endpoint è pubblico. Metti un limite di spesa sulla chiave dalla console Anthropic.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const LEARNER = process.env.LEARNER_NAME || 'Pipu';
const MAX_MSGS = 16;
const MAX_CHARS = 1200;

const CHAT_SYSTEM = `You are Theo, a friendly jazz bass player who helps ${LEARNER}, an Italian high-school student, practise English.
${LEARNER} plays the drums and loves jazz, bossa nova, blues, classical and contemporary music, and building Lego.
His level is around B1. His school grammar: to be/have, present simple and continuous, past simple and past perfect, stative verbs, conditionals 0-3. He is now learning futures, mixed conditionals, phrasal verbs, building sentences, dialogue and summaries.
Rules:
- Reply in simple, natural B1 English. Maximum 3 short sentences, then ONE follow-up question to keep the conversation going.
- If his last message has a mistake, start your reply with ONE line that begins with "✏️", showing the corrected sentence and a very short explanation in Italian. If there are no mistakes, do not add that line.
- Stay on safe, school-appropriate topics. Never ask for personal information (full name, address, school name, phone, photos). If he shares any, gently tell him not to.
- You are an AI. Never claim to be a human. If asked, say you are an AI tutor.
- If he writes in Italian, answer in easy English and encourage him to try in English.`;

const SUMMARY_SYSTEM = `You are an English teacher checking a short summary written by an Italian high-school student (B1).
Return ONLY a JSON object, no markdown, with these keys:
"score": integer 1-10 (content, accuracy, own words, grammar),
"good": one short sentence in Italian about what works,
"fix": array of at most 3 short items in Italian, each quoting a mistake and giving the correction,
"better": an improved version of his summary in simple English (max 60 words),
"tip": one short tip in Italian for next time.`;

const json = (body, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, 'Cache-Control': 'no-store' },
});

async function callClaude(system, messages, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`Anthropic ${r.status}: ${detail.slice(0, 200)}`);
  }
  const data = await r.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return null;
  const msgs = list.slice(-MAX_MSGS)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift(); // l'API vuole che si parta dall'utente
  return msgs.length && msgs[msgs.length - 1].role === 'user' ? msgs : null;
}

export default async (req) => {
  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get('origin') || '';
  const cors = allowed || '*';
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': cors, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  const configured = !!process.env.ANTHROPIC_API_KEY;
  if (req.method === 'GET') return json({ configured }, 200, cors);
  if (req.method !== 'POST') return json({ error: 'Metodo non permesso' }, 405, cors);
  if (allowed && origin && origin !== allowed) return json({ error: 'Origine non permessa' }, 403, cors);
  if (!configured) return json({ error: 'Tutor non configurato' }, 501, cors);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'JSON non valido' }, 400, cors); }

  try {
    if (body.mode === 'summary') {
      const summary = String(body.summary || '').slice(0, MAX_CHARS);
      const source = String(body.source || '').slice(0, 4000);
      if (summary.split(/\s+/).filter(Boolean).length < 5) return json({ error: 'Riassunto troppo corto' }, 400, cors);
      const text = await callClaude(SUMMARY_SYSTEM, [{ role: 'user', content: `TEXT: "${String(body.title || '').slice(0, 120)}"\n${source}\n\nSTUDENT SUMMARY:\n${summary}` }], 700);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return json({ error: 'Risposta non valida' }, 502, cors);
      const parsed = JSON.parse(match[0]);
      return json({
        score: Math.max(1, Math.min(10, Number(parsed.score) || 5)),
        good: String(parsed.good || ''),
        fix: Array.isArray(parsed.fix) ? parsed.fix.slice(0, 3).map(String) : [],
        better: String(parsed.better || ''),
        tip: String(parsed.tip || ''),
      }, 200, cors);
    }
    const messages = cleanMessages(body.messages);
    if (!messages) return json({ error: 'Messaggi non validi' }, 400, cors);
    const reply = await callClaude(CHAT_SYSTEM, messages, 300);
    return json({ reply: reply || 'Sorry, can you say that again?' }, 200, cors);
  } catch (e) {
    console.error(e);
    return json({ error: 'Il tutor non risponde, riprova tra poco' }, 502, cors);
  }
};

