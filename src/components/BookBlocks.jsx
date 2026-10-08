import { useState } from 'react';
import { Html, SpeakButton, Icon } from './ui.jsx';

// Toglie la formattazione per la sintesi vocale
const plain = (s) => s.replace(/\*\*|_{1,}/g, ' ').replace(/\s+/g, ' ').trim();

function Check({ items }) {
  const [open, setOpen] = useState({});
  return (
    <section className="bk-check">
      <h4>Prova tu</h4>
      <ol>
        {items.map(([q, a], i) => (
          <li key={i}>
            <Html as="p" text={q} />
            {open[i]
              ? <Html as="p" className="bk-answer" text={a} />
              : <button type="button" className="link-btn" onClick={() => setOpen((o) => ({ ...o, [i]: true }))}>Mostra la risposta</button>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BookBlocks({ blocks }) {
  return blocks.map((b, i) => {
    switch (b.t) {
      case 'h': return <Html key={i} as="h3" className="bk-h" text={b.text} />;
      case 'p': return <Html key={i} as="p" className="bk-p" text={b.text} />;
      case 'tip': return (
        <aside key={i} className="bk-tip"><strong>Trucco</strong><Html as="p" text={b.text} /></aside>
      );
      case 'table': return (
        <div key={i} className="bk-table-wrap">
          <table className="bk-table">
            <thead><tr>{b.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <Html key={k} as="td" text={c} />)}</tr>)}</tbody>
          </table>
        </div>
      );
      case 'ex': return (
        <ul key={i} className="bk-ex">
          {b.items.map(([en, it], j) => (
            <li key={j}>
              <div className="bk-ex-en"><Html text={en} /><SpeakButton text={plain(en)} /></div>
              <Html as="div" className="bk-ex-it" text={it} />
            </li>
          ))}
        </ul>
      );
      case 'steps': return (
        <ol key={i} className="bk-steps">{b.items.map((s, j) => <Html key={j} as="li" text={s} />)}</ol>
      );
      case 'wrong': return (
        <section key={i} className="bk-wrong">
          <h4>Errori tipici</h4>
          {b.items.map(([w, r, why], j) => (
            <div key={j} className="bk-wrong-row">
              <div className="bk-no"><Icon name="x" size={16} stroke={3} /><Html text={w} /></div>
              <div className="bk-yes"><Icon name="check" size={16} stroke={3} /><Html text={r} /></div>
              <Html as="div" className="bk-why" text={why} />
            </div>
          ))}
        </section>
      );
      case 'check': return <Check key={i} items={b.items} />;
      default: return null;
    }
  });
}
