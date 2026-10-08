// Genera i PDF del libro in public/pdf a partire da src/content/book.js (lo stesso contenuto dell'app).
// Non serve per il deploy: i PDF sono già nella cartella public/pdf. Per rigenerarli dopo aver modificato il libro:
//   npm i --no-save playwright pdf-lib && npx playwright install chromium && npm run book
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { BOOK, SIDES, FULL_BOOK_PDF, chapterPdf } from '../src/content/book.js';
import { fmt } from '../src/lib/format.js';
import { CONFIG } from '../src/config.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'public', 'pdf');

let chromium, PDFDocument;
try {
  ({ chromium } = await import('playwright'));
  ({ PDFDocument } = await import('pdf-lib'));
} catch {
  console.error('Mancano playwright e/o pdf-lib. Installa con:\n  npm i --no-save playwright pdf-lib && npx playwright install chromium');
  process.exit(1);
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap';

const CSS = `
@page { size: A4; margin: 18mm 17mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 10.8pt/1.55 'Newsreader', Georgia, serif; color: #101A4A; }
.chapter { break-before: page; }
.chapter:first-child { break-before: auto; }
.side { font: 700 10pt 'Atkinson Hyperlegible', sans-serif; color: #4A5580; margin: 0 0 8mm; }
.no { display: inline-block; font: 900 15pt 'Big Shoulders Display', sans-serif; padding: 1mm 3mm; background: #101A4A; color: #fff; }
h1 { font: 900 38pt/0.92 'Big Shoulders Display', sans-serif; margin: 4mm 0 2mm; }
.sub { font: italic 13pt/1.3 'Newsreader', serif; color: #4A5580; margin: 0 0 5mm; }
.intro { font-size: 12pt; margin: 0 0 6mm; padding-bottom: 5mm; border-bottom: 1mm solid #101A4A; }
h3 { font: 700 19pt/1.05 'Big Shoulders Display', sans-serif; color: #1D39A3; margin: 7mm 0 2.5mm; break-after: avoid; }
h4 { font: 900 15pt 'Big Shoulders Display', sans-serif; margin: 0 0 2mm; }
p { margin: 0 0 3mm; }
table { width: 100%; border-collapse: collapse; margin: 2mm 0 5mm; font: 9.3pt/1.35 'Atkinson Hyperlegible', sans-serif; break-inside: auto; }
tr { break-inside: avoid; }
th { text-align: left; padding: 1.8mm 2.4mm; background: #101A4A; color: #fff; }
td { padding: 1.8mm 2.4mm; border-bottom: 0.3mm solid #D8DCEB; vertical-align: top; }
tr:nth-child(even) td { background: #F4F6FB; }
.ex { list-style: none; padding: 0; margin: 2mm 0 5mm; }
.ex li { padding-left: 3.5mm; border-left: 0.9mm solid #8FB3FF; margin-bottom: 2.5mm; break-inside: avoid; }
.ex .en { font-weight: 600; }
.ex .it { font-style: italic; color: #4A5580; font-size: 10pt; }
ol.steps { padding-left: 7mm; margin: 2mm 0 5mm; }
ol.steps li { margin-bottom: 1.5mm; }
ol.steps li::marker { font: 900 12pt 'Big Shoulders Display', sans-serif; color: #E63B2E; }
.tip { margin: 4mm 0; padding: 3mm 4mm; background: #FFF4D1; border-left: 1.6mm solid #FFC72C; break-inside: avoid; }
.tip strong.lab { display: block; font: 900 12pt 'Big Shoulders Display', sans-serif; }
.wrong { margin: 5mm 0; break-inside: auto; }
.row { padding: 2mm 0; border-bottom: 0.3mm solid #D8DCEB; font: 9.8pt/1.4 'Atkinson Hyperlegible', sans-serif; break-inside: avoid; }
.no-w { color: #B3261E; text-decoration: line-through; }
.yes { color: #137A47; font-weight: 700; }
.why { color: #4A5580; font-size: 9pt; }
.check { margin: 6mm 0 0; padding: 4mm; border: 0.7mm dashed #1D39A3; break-inside: avoid; }
.check ol { margin: 0; padding-left: 6mm; }
.check li { margin-bottom: 2mm; }
.line { display: block; border-bottom: 0.3mm solid #9AA3C7; height: 7mm; }
.solutions { margin-top: 5mm; font: 8.6pt/1.4 'Atkinson Hyperlegible', sans-serif; color: #4A5580; break-inside: avoid; }
.solutions strong { color: #101A4A; }
.blank { display: inline-block; min-width: 12mm; border-bottom: 0.4mm solid currentColor; }
strong { font-weight: 700; }
.toc h1 { font-size: 36pt; margin-bottom: 2mm; }
.toc h2 { font: 900 18pt 'Big Shoulders Display', sans-serif; margin: 4mm 0 0.5mm; }
.toc .tsub { font-style: italic; color: #4A5580; margin-bottom: 2mm; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc li { display: grid; grid-template-columns: 12mm 1fr auto; gap: 3mm; padding: 0.9mm 0; border-bottom: 0.3mm solid #D8DCEB; align-items: baseline; }
.toc .tn { font: 900 13pt 'Big Shoulders Display', sans-serif; color: #E63B2E; }
.toc .B .tn { color: #1D39A3; }
.toc .tt { font-weight: 600; }
.toc .ts { display: block; font-size: 9pt; line-height: 1.3; color: #4A5580; }
.toc .pg { font: 700 10pt 'Atkinson Hyperlegible', sans-serif; }
.toc .how { margin: 0 0 1mm; font: 9.5pt/1.5 'Atkinson Hyperlegible', sans-serif; color: #4A5580; }
`;

const COVER_CSS = `
@page { size: A4; margin: 0; }
html, body { margin: 0; height: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.cover { position: relative; width: 210mm; height: 297mm; overflow: hidden; background: #1D39A3; color: #fff; padding: 22mm 18mm; font-family: 'Atkinson Hyperlegible', sans-serif; }
.brand { font: 700 18pt 'Big Shoulders Display', sans-serif; color: #8FB3FF; }
.title { font: 900 128pt/0.8 'Big Shoulders Display', sans-serif; color: #FFC72C; margin: 22mm 0 0 -2mm; position: relative; z-index: 2; }
.subtitle { font: 900 38pt/0.95 'Big Shoulders Display', sans-serif; margin: 8mm 0 0; position: relative; z-index: 2; }
.drum { position: absolute; right: -40mm; bottom: 38mm; width: 150mm; height: 150mm; border-radius: 50%;
  background: radial-gradient(circle, #E63B2E 0 58%, #C52F24 58% 60%, #E63B2E 60% 88%, #F4F4F4 88% 93%, #C9CCD6 93%); }
.sides { position: absolute; left: 18mm; bottom: 22mm; font: 700 12pt 'Atkinson Hyperlegible', sans-serif; line-height: 1.6; z-index: 2; }
.sides span { display: block; }
.from { position: absolute; right: 18mm; top: 24mm; font-size: 11pt; color: #8FB3FF; }
`;

const f = (s) => fmt(s);

function blockHtml(b, sol) {
  switch (b.t) {
    case 'h': return `<h3>${f(b.text)}</h3>`;
    case 'p': return `<p>${f(b.text)}</p>`;
    case 'tip': return `<div class="tip"><strong class="lab">Trucco</strong>${f(b.text)}</div>`;
    case 'table': return `<table><thead><tr>${b.head.map((h) => `<th>${f(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${f(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    case 'ex': return `<ul class="ex">${b.items.map(([en, it]) => `<li><div class="en">${f(en)}</div><div class="it">${f(it)}</div></li>`).join('')}</ul>`;
    case 'steps': return `<ol class="steps">${b.items.map((s) => `<li>${f(s)}</li>`).join('')}</ol>`;
    case 'wrong': return `<section class="wrong"><h4>Errori tipici</h4>${b.items.map(([w, r, why]) => `<div class="row"><div class="no-w">✗ ${f(w)}</div><div class="yes">✓ ${f(r)}</div><div class="why">${f(why)}</div></div>`).join('')}</section>`;
    case 'check':
      b.items.forEach(([, a]) => sol.push(a));
      return `<section class="check"><h4>Prova tu</h4><ol>${b.items.map(([q]) => `<li>${f(q)}<span class="line"></span></li>`).join('')}</ol></section>`;
    default: return '';
  }
}

function chapterHtml(c) {
  const sol = [];
  const body = c.blocks.map((b) => blockHtml(b, sol)).join('\n');
  const solutions = sol.length ? `<div class="solutions"><strong>Soluzioni di “Prova tu”:</strong> ${sol.map((a, i) => `${i + 1}. ${f(a)}`).join(' &nbsp; ')}</div>` : '';
  return `<article class="chapter">
    <div class="side">${SIDES[c.side].title}</div>
    <span class="no">${c.id.toUpperCase()}</span>
    <h1>${f(c.title)}</h1>
    <p class="sub">${f(c.sub)}</p>
    <p class="intro">${f(c.intro)}</p>
    ${body}
    ${solutions}
  </article>`;
}

function tocHtml(pages) {
  const side = (s) => `<h2>${SIDES[s].title}</h2><div class="tsub">${SIDES[s].sub}</div><ol class="${s}">${BOOK.filter((c) => c.side === s)
    .map((c) => `<li><span class="tn">${c.id.toUpperCase()}</span><span><span class="tt">${f(c.title)}</span><span class="ts">${f(c.sub)}</span></span><span class="pg">${pages[c.id] ?? ''}</span></li>`).join('')}</ol>`;
  return `<article class="toc"><h1>Tracklist</h1>
    <p class="how">Come usare il libro: leggi un capitolo, prova gli esercizi “Prova tu” (le soluzioni sono in fondo a ogni capitolo), poi allenati nell’app: ogni capitolo ha il suo gioco collegato.</p>${side('A')}${side('B')}</article>`;
}

const page = (css, body, title) => `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="${FONTS}"><style>${css}</style></head><body>${body}</body></html>`;

const footer = `<div style="width:100%;font:8px Arial,sans-serif;color:#6A7399;padding:0 17mm;display:flex;justify-content:space-between;">
  <span>${CONFIG.appName}: il libro di ${CONFIG.learner}</span><span><span class="pageNumber"></span></span></div>`;

const browser = await chromium.launch();
const tab = await browser.newPage();

async function render(html, { withFooter = true } = {}) {
  await tab.setContent(html, { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  return tab.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: withFooter,
    headerTemplate: '<span></span>',
    footerTemplate: withFooter ? footer : '<span></span>',
  });
}

const pageCount = async (buf) => (await PDFDocument.load(buf)).getPageCount();

async function save(name, buf, title) {
  const doc = await PDFDocument.load(buf);
  doc.setTitle(title);
  doc.setAuthor(CONFIG.from);
  doc.setCreator(CONFIG.appName);
  await writeFile(path.join(OUT, name), await doc.save());
}

await mkdir(OUT, { recursive: true });
for (const f0 of await readdir(OUT)) if (f0.endsWith('.pdf')) await unlink(path.join(OUT, f0));

// 1. Un PDF per capitolo (servono anche per calcolare i numeri di pagina dell'indice)
const counts = {};
for (const c of BOOK) {
  const buf = await render(page(CSS, chapterHtml(c), c.title));
  counts[c.id] = await pageCount(buf);
  await save(chapterPdf(c), buf, `${c.id.toUpperCase()}: ${c.title}`);
  console.log(`  ${chapterPdf(c)}: ${counts[c.id]} pagine`);
}

// 2. Libro completo: copertina + indice + capitoli, con numeri di pagina veri nell'indice
const tocBuf = await render(page(CSS, tocHtml({}), 'Indice'));
const tocPages = await pageCount(tocBuf);
const pages = {};
let p = tocPages + 1;
for (const c of BOOK) { pages[c.id] = p; p += counts[c.id]; }
const bodyBuf = await render(page(CSS, tocHtml(pages) + BOOK.map(chapterHtml).join('\n'), 'Il libro'));
const bodyPages = await pageCount(bodyBuf);
const expected = tocPages + Object.values(counts).reduce((a, b) => a + b, 0);
if (bodyPages !== expected) console.warn(`  ATTENZIONE: il libro ha ${bodyPages} pagine, attese ${expected}: i numeri dell'indice potrebbero essere sfasati`);

const cover = `<div class="cover">
  <div class="brand">${CONFIG.appName}</div>
  <div class="from">per ${CONFIG.learner}, da ${CONFIG.from}</div>
  <div class="title">Il libro</div>
  <div class="subtitle">Grammatica e parole<br>a tempo di batteria</div>
  <div class="drum"></div>
  <div class="sides"><span>${SIDES.A.title}</span><span>${SIDES.B.title}</span></div>
</div>`;
const coverBuf = await render(page(COVER_CSS, cover, 'Copertina'), { withFooter: false });

const full = await PDFDocument.create();
for (const buf of [coverBuf, bodyBuf]) {
  const src = await PDFDocument.load(buf);
  (await full.copyPages(src, src.getPageIndices())).forEach((pg) => full.addPage(pg));
}
full.setTitle(`${CONFIG.appName}: il libro di ${CONFIG.learner}`);
full.setAuthor(CONFIG.from);
full.setCreator(CONFIG.appName);
await writeFile(path.join(OUT, FULL_BOOK_PDF), await full.save());
console.log(`✓ ${FULL_BOOK_PDF}: ${full.getPageCount()} pagine (copertina + ${tocPages} indice + ${bodyPages - tocPages} capitoli)`);

await browser.close();
