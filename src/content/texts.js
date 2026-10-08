// Studio riassunti: testi brevi (livello B1) sugli interessi di Pipu.
// ideas: 6 frasi, esattamente 3 sono idee principali (ok). summaries: 3 riassunti, esattamente 1 è quello buono.
// glossary: le parole devono comparire nel testo (il lettore le rende toccabili).
// keywords: parole chiave per la checklist del riassunto scritto (in minuscolo).

const RAW = [
  {
    id: 'bossa', title: 'The birth of bossa nova', it: 'La nascita della bossa nova', minutes: 4,
    paragraphs: [
      'Bossa nova was born in Rio de Janeiro at the end of the 1950s. In Portuguese the name means something like “new trend”. Young Brazilian musicians mixed the rhythm of samba with the soft harmonies of American cool jazz, and they created a calm and elegant sound.',
      'Three people were especially important. João Gilberto invented a new way of playing the guitar, the composer Antônio Carlos Jobim wrote many of the most famous songs, and the poet Vinicius de Moraes wrote the lyrics. Many experts consider “Chega de Saudade”, recorded by Gilberto in 1958, the first bossa nova record.',
      'In 1964 the album Getz/Gilberto, with the American saxophonist Stan Getz, made bossa nova famous all over the world. Its song “The Girl from Ipanema” became a huge international hit.',
      'For drummers, bossa nova is a great lesson in control: they often play quietly with brushes and use a cross-stick on the snare. Today many bossa nova songs are jazz standards.',
    ],
    glossary: [
      ['trend', 'tendenza, moda'], ['mixed', 'mescolarono'], ['elegant', 'elegante'], ['especially', 'particolarmente'],
      ['invented', 'inventò'], ['lyrics', 'testi (delle canzoni)'], ['consider', 'considerano'], ['huge', 'enorme'],
      ['quietly', 'piano, a basso volume'], ['brushes', 'spazzole'], ['cross-stick', 'colpo con la bacchetta appoggiata sul cerchio'],
    ],
    ideas: [
      ['Bossa nova started in Rio in the late 1950s by mixing samba and cool jazz.', true, 'È l’idea del primo paragrafo: dove, quando e cosa.'],
      ['João Gilberto, Jobim and Vinicius de Moraes created the new style.', true, 'È l’idea del secondo paragrafo: le persone chiave.'],
      ['The album Getz/Gilberto made bossa nova famous all over the world.', true, 'È l’idea del terzo paragrafo: il successo mondiale.'],
      ['In Portuguese, “bossa nova” means something like “new trend”.', false, 'Vero, ma è un dettaglio: in un riassunto si può togliere.'],
      ['Stan Getz was the Brazilian guitarist who invented bossa nova.', false, 'Falso: Stan Getz era un sassofonista americano.'],
      ['Bossa nova is more interesting than rock music.', false, 'È un’opinione: il testo non lo dice.'],
    ],
    summaries: [
      ['The text is about bossa nova, a style that started in Rio de Janeiro in the late 1950s. It mixes samba and cool jazz. João Gilberto, Jobim and Vinicius de Moraes created it, and in 1964 the album Getz/Gilberto made it famous around the world.', true, 'Breve, con parole proprie, e contiene le tre idee principali.'],
      ['Bossa nova was born in Rio de Janeiro at the end of the 1950s. In Portuguese the name means something like new trend. Young Brazilian musicians mixed the rhythm of samba with the soft harmonies of American cool jazz.', false, 'Copia il testo parola per parola e si ferma al primo paragrafo.'],
      ['The text is about Stan Getz, a Brazilian guitarist. In my opinion bossa nova is the best music ever, and every drummer should play it.', false, 'Sbaglia l’argomento, contiene un errore e aggiunge un’opinione personale.'],
    ],
    keywords: ['bossa nova', 'rio', 'brazil', 'samba', 'jazz', 'gilberto', 'jobim', 'getz', '1950s', '1964'],
  },
  {
    id: 'lego', title: 'The story of the LEGO brick', it: 'La storia del mattoncino LEGO', minutes: 4,
    paragraphs: [
      'The LEGO story began in 1932 in Billund, a small town in Denmark. A carpenter called Ole Kirk Christiansen started making wooden toys during a difficult economic period. In 1934 he chose the name LEGO, from the Danish words “leg godt”, which mean “play well”.',
      'At the end of the 1940s the company started producing plastic bricks. However, the first bricks did not hold together very well, and models often fell apart.',
      'The solution arrived in 1958, when the company patented a new brick with tubes inside. The tubes grip the studs of the brick below, so models stay together firmly, but you can still take them apart easily. Amazingly, a brick from 1958 still fits a brick made today.',
      'In 1978 the first minifigures appeared, and the sets started telling stories: castles, space stations and towns. Today LEGO is one of the biggest toy companies in the world, and it is still controlled by the same family.',
    ],
    glossary: [
      ['carpenter', 'falegname'], ['wooden', 'di legno'], ['economic', 'economico'], ['producing', 'produrre'],
      ['hold together', 'restare uniti'], ['fell apart', 'si smontavano, cadevano a pezzi'], ['patented', 'brevettò'],
      ['tubes', 'tubi, cilindri'], ['grip', 'fanno presa su'], ['studs', 'bottoncini'], ['firmly', 'saldamente'],
      ['fits', 'si incastra con'], ['controlled', 'controllata'],
    ],
    ideas: [
      ['Ole Kirk Christiansen founded LEGO in Denmark in 1932, making wooden toys.', true, 'È l’idea del primo paragrafo: chi, dove, quando.'],
      ['In 1958 a new brick with tubes solved the problem of models falling apart.', true, 'È il cuore del testo: la soluzione del 1958.'],
      ['Minifigures and sets with stories helped LEGO become one of the biggest toy companies.', true, 'È l’idea dell’ultimo paragrafo.'],
      ['LEGO means “build together” in Danish.', false, 'Falso: significa “play well”, gioca bene.'],
      ['The first plastic bricks were perfect from the start.', false, 'Falso: il testo dice che all’inizio non stavano insieme bene.'],
      ['Billund is a small town.', false, 'Vero, ma è un dettaglio.'],
    ],
    summaries: [
      ['The text is about the history of LEGO. It started in Denmark in 1932 as a company that made wooden toys. In 1958 it patented a brick with tubes inside, which made models strong but easy to take apart. Later, minifigures and sets with stories made it one of the biggest toy companies in the world.', true, 'Segue tutta la storia in poche frasi, con parole proprie.'],
      ['The text says that LEGO bricks from 1958 do not fit modern bricks, so you have to buy new ones.', false, 'Falso: il testo dice esattamente il contrario.'],
      ['Ole Kirk Christiansen was a carpenter. He lived in Billund. Billund is in Denmark. He made toys. The toys were wooden.', false, 'Solo dettagli del primo paragrafo, senza connettivi: manca il resto della storia.'],
    ],
    keywords: ['lego', 'denmark', '1932', 'wooden', 'plastic', '1958', 'tubes', 'brick', 'minifigure', 'christiansen'],
  },
  {
    id: 'blues', title: 'Where the blues comes from', it: 'Da dove viene il blues', minutes: 4,
    paragraphs: [
      'The blues was born at the end of the 19th century in the southern United States. It came from African American communities, and it grew out of work songs and spirituals. Blues songs often talk about sadness, hard work and love, but they can also be funny and full of hope.',
      'Most blues songs follow a simple structure: twelve bars and three chords. Singers and guitarists also use “blue notes”, notes that are played a little lower than usual, so they sound sad and expressive.',
      'In the 1930s musicians like Robert Johnson recorded blues in the Mississippi Delta, usually with just a voice and an acoustic guitar. Later, many African Americans moved north to cities like Chicago. There, artists like Muddy Waters played the blues with electric guitars and drums, and the music became louder.',
      'The blues influenced almost everything that came after it: jazz, rock and roll, soul and rock. The Rolling Stones even took their name from a Muddy Waters song.',
    ],
    glossary: [
      ['southern', 'del sud'], ['communities', 'comunità'], ['grew out of', 'nacque da'], ['work songs', 'canti di lavoro'],
      ['spirituals', 'canti religiosi afroamericani'], ['sadness', 'tristezza'], ['bars', 'battute'], ['chords', 'accordi'],
      ['expressive', 'espressivo'], ['acoustic', 'acustica'], ['louder', 'più forte (di volume)'], ['influenced', 'influenzò'],
    ],
    ideas: [
      ['The blues was born in African American communities in the southern USA at the end of the 19th century.', true, 'È l’idea del primo paragrafo: origine.'],
      ['The blues moved from acoustic guitars in the Delta to electric bands in Chicago.', true, 'È l’idea del terzo paragrafo: come è cambiato.'],
      ['The blues influenced jazz, rock and roll, soul and rock.', true, 'È l’idea dell’ultimo paragrafo: la sua eredità.'],
      ['Robert Johnson played an electric guitar in Chicago.', false, 'Falso: suonava la chitarra acustica nel Delta del Mississippi.'],
      ['Blues songs are always sad.', false, 'Falso: il testo dice che possono essere anche divertenti e piene di speranza.'],
      ['The Rolling Stones took their name from a Muddy Waters song.', false, 'Vero, ma è una curiosità: in un riassunto si toglie.'],
    ],
    summaries: [
      ['The text is about the blues. It was born in African American communities in the southern United States at the end of the 19th century, and it usually has twelve bars and blue notes. It started with acoustic guitars in the Mississippi Delta and became electric in Chicago. Finally, it influenced jazz, rock and roll and rock.', true, 'Contiene origine, struttura, evoluzione e influenza, con connettivi.'],
      ['Blues is sad music from Chicago that the Rolling Stones invented in the 1930s.', false, 'Pieno di errori: il blues non è nato a Chicago e non l’hanno inventato i Rolling Stones.'],
      ['The text is about Robert Johnson. He recorded blues in the 1930s with a voice and an acoustic guitar. I think he is the best guitarist ever.', false, 'Parla solo di un dettaglio e aggiunge un’opinione personale.'],
    ],
    keywords: ['blues', 'african american', 'south', 'twelve', 'blue notes', 'delta', 'chicago', 'electric', 'jazz', 'rock'],
  },
  {
    id: 'beethoven', title: 'Beethoven: the composer who could not hear', it: 'Beethoven: il compositore che non sentiva', minutes: 4,
    paragraphs: [
      'Ludwig van Beethoven was born in Bonn, Germany, in 1770. He showed a great talent for music when he was a child, and at 21 he moved to Vienna, the capital of classical music at that time. There he became famous as a pianist and composer.',
      'When he was still under 30, Beethoven started to lose his hearing. It was a terrible problem for a musician, and for a while he felt desperate. However, he decided to continue, and he wrote some of his greatest music when he could hardly hear anything.',
      'His Ninth Symphony was performed for the first time in Vienna in 1824. Beethoven was on stage, but he could not hear the audience. According to a famous story, a singer turned him around so that he could see that people were clapping.',
      'Beethoven died in 1827, but his music is everywhere today. The four notes that open his Fifth Symphony are known all over the world, and the melody of the “Ode to Joy” from the Ninth Symphony is the anthem of the European Union.',
    ],
    glossary: [
      ['talent', 'talento'], ['capital', 'capitale'], ['hearing', 'udito'], ['desperate', 'disperato'],
      ['hardly', 'a malapena, quasi per niente'], ['performed', 'eseguita'], ['audience', 'pubblico'],
      ['turned him around', 'lo fece girare'], ['clapping', 'applaudendo'], ['anthem', 'inno'],
    ],
    ideas: [
      ['Beethoven was born in Germany in 1770 and became famous in Vienna.', true, 'È l’idea del primo paragrafo.'],
      ['He lost his hearing but continued to compose great music.', true, 'È il cuore del testo.'],
      ['His music is still famous today, and part of it is the anthem of the European Union.', true, 'È l’idea dell’ultimo paragrafo.'],
      ['Beethoven was born deaf.', false, 'Falso: ha cominciato a perdere l’udito prima dei 30 anni.'],
      ['The Ninth Symphony was first performed in Bonn in 1770.', false, 'Falso: Vienna, 1824. Nel 1770 Beethoven è nato.'],
      ['A singer turned him around at the concert.', false, 'Vero (secondo la storia), ma è un aneddoto: in un riassunto si toglie.'],
    ],
    summaries: [
      ['The text is about Ludwig van Beethoven. He was born in Germany in 1770 and became famous in Vienna. Although he started to lose his hearing before he was 30, he continued to compose. Today his music is known all over the world, and part of his Ninth Symphony is the anthem of the European Union.', true, 'Ha tutte le idee principali e usa although per collegarle.'],
      ['Beethoven was deaf, so he stopped writing music and became a pianist in Bonn.', false, 'Falso: il testo dice che ha continuato a comporre.'],
      ['In 1824 the Ninth Symphony was performed in Vienna. Beethoven was on stage but he could not hear the audience. A singer turned him around.', false, 'Riassume solo un paragrafo e copia le frasi del testo.'],
    ],
    keywords: ['beethoven', '1770', 'germany', 'vienna', 'hearing', 'deaf', 'compose', 'symphony', 'european union', 'anthem'],
  },
];

const words = (s) => s.split(/\s+/).filter(Boolean).length;

export const TEXTS = RAW.map((t) => ({
  ...t,
  glossary: t.glossary.map(([w, it]) => ({ w, it })),
  ideas: t.ideas.map(([text, ok, fb]) => ({ text, ok, fb })),
  summaries: t.summaries.map(([text, ok, fb]) => ({ text, ok, fb })),
  wordCount: t.paragraphs.reduce((n, p) => n + words(p), 0),
}));

export const textById = (id) => TEXTS.find((t) => t.id === id);

// Checklist del riassunto scritto: usata dall'app e dai test
export const OPENERS = ['the text is about', 'the article is about', 'the text explains', 'the article explains', 'the text describes', 'the text tells', 'this text is about', 'the writer says', 'according to the text'];
export const LINKERS = ['and', 'but', 'because', 'so', 'although', 'however', 'then', 'finally', 'later', 'in addition', 'also', 'in short', 'to sum up', 'while', 'when'];

const clean = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'\s/-]/g, ' ').replace(/\s+/g, ' ').trim();

function ngrams(s, n = 4) {
  const w = clean(s).split(' ');
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
}

export function checkSummary(text, source) {
  const c = clean(text);
  const count = c ? c.split(' ').length : 0;
  const has = (phrase) => new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(c);
  const kw = source.keywords.filter((k) => has(k));
  const mine = ngrams(text);
  const src = ngrams(source.paragraphs.join(' '));
  let copied = 0;
  mine.forEach((g) => { if (src.has(g)) copied++; });
  const copyRatio = mine.size ? copied / mine.size : 0;
  return {
    count,
    items: [
      { id: 'length', ok: count >= 25 && count <= 70, label: `Tra 25 e 70 parole (ora ${count})` },
      { id: 'opener', ok: OPENERS.some((o) => c.startsWith(o)), label: 'Inizia con “The text is about…” o simile' },
      { id: 'linker', ok: LINKERS.some((l) => has(l)), label: 'Usa almeno un connettivo (and, but, so, although…)' },
      { id: 'keywords', ok: kw.length >= 2, label: `Almeno 2 parole chiave del testo (${kw.length})` },
      { id: 'own', ok: count > 0 && copyRatio <= 0.4, label: 'Con parole tue: non copiare pezzi interi' },
    ],
    copyRatio,
  };
}
