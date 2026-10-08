import { useEffect } from 'react';
import { BOOK, SIDES, chapterById, FULL_BOOK_PDF, chapterPdf } from '../content/book.js';
import { useStore, update, addXp, completeSetlist } from '../lib/store.js';
import { sfx } from '../lib/audio.js';
import { href } from '../lib/router.js';
import { dayKey } from '../lib/util.js';
import { Html, Icon, Button, TopBar, Footer } from '../components/ui.jsx';
import { BookBlocks } from '../components/BookBlocks.jsx';

const pdfUrl = (file) => `/pdf/${file}`;

export function Library() {
  const s = useStore();
  const read = BOOK.filter((c) => s.read[c.id]).length;
  return (
    <div className="library">
      <header className="lib-head">
        <h1 className="lib-title">Il libro</h1>
        <p className="lib-sub">La teoria, separata dal gioco. Ogni capitolo si legge in pochi minuti e si può stampare.</p>
        <div className="lib-actions">
          <a className="btn btn-ink" href={pdfUrl(FULL_BOOK_PDF)} download><Icon name="download" size={18} /> Libro completo in PDF</a>
          <span className="lib-count">{read} di {BOOK.length} capitoli letti</span>
        </div>
      </header>
      {Object.entries(SIDES).map(([side, info]) => (
        <section key={side} className={`side side-${side}`}>
          <h2 className="side-title">{info.title}</h2>
          <p className="side-sub">{info.sub}</p>
          <ol className="tracklist">
            {BOOK.filter((c) => c.side === side).map((c) => (
              <li key={c.id}>
                <a className={`tl-item ${s.read[c.id] ? 'read' : ''}`} href={href('chapter', { id: c.id })}>
                  <span className="tl-no">{c.id.toUpperCase()}</span>
                  <span className="tl-body"><strong>{c.title}</strong><span>{c.sub}</span></span>
                  <span className="tl-dur">{s.read[c.id] ? <Icon name="check" size={18} stroke={3} /> : `${c.minutes} min`}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <Footer />
    </div>
  );
}

export function Chapter({ params }) {
  const c = chapterById(params.id) || BOOK[0];
  const s = useStore();
  const isRead = !!s.read[c.id];
  const i = BOOK.indexOf(c);
  const prev = BOOK[i - 1];
  const next = BOOK[i + 1];

  useEffect(() => {
    if (s.lastChapter !== c.id) update((st) => { st.lastChapter = c.id; });
  }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    update((st) => { st.read[c.id] = dayKey(); });
    sfx('ok');
    addXp(25);
    completeSetlist('read', c.id);
  }

  return (
    <article className="chapter">
      <TopBar title={c.side === 'A' ? 'Lato A' : 'Lato B'} backTo="library"
        right={<a className="topbar-icon" href={pdfUrl(chapterPdf(c))} download aria-label="Scarica il capitolo in PDF"><Icon name="download" /></a>} />
      <header className="ch-head">
        <span className="ch-no">{c.id.toUpperCase()}</span>
        <h1 className="ch-title">{c.title}</h1>
        <p className="ch-sub">{c.sub}</p>
        <Html as="p" className="ch-intro" text={c.intro} />
      </header>
      <div className="ch-body">
        <BookBlocks blocks={c.blocks} />
      </div>
      <footer className="ch-foot">
        {isRead
          ? <p className="ch-read"><Icon name="check" stroke={3} /> Capitolo letto</p>
          : <Button onClick={finish} variant="ink">Ho finito il capitolo: +25 XP</Button>}
        <Button to={c.practice.path} params={c.practice.params} variant="accent">{c.practice.label}</Button>
        <a className="link-btn" href={pdfUrl(chapterPdf(c))} download>Scarica questo capitolo in PDF</a>
        <nav className="ch-nav" aria-label="Altri capitoli">
          {prev ? <a href={href('chapter', { id: prev.id })}><span>Precedente</span>{prev.id.toUpperCase()}: {prev.title}</a> : <span />}
          {next ? <a href={href('chapter', { id: next.id })} className="next"><span>Successivo</span>{next.id.toUpperCase()}: {next.title}</a> : <span />}
        </nav>
      </footer>
    </article>
  );
}
